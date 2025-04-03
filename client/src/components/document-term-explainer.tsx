import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Info, Lightbulb, BookOpen, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DocumentTermExplainerProps {
  processorId?: string;
}

interface TermExplanation {
  term: string;
  definition: string;
  implications: string;
  example?: string;
  relatedTerms?: string[];
}

export default function DocumentTermExplainer({ processorId = "3c07700f0a77de4f" }: DocumentTermExplainerProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<TermExplanation | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Highlighted terms that might be common in real estate contracts
  const commonLegalTerms = [
    "force majeure", "indemnification", "easement", "covenant", "encumbrance",
    "contingency", "escrow", "lien", "deed", "title insurance", "appraisal",
    "amortization", "conveyance", "consideration", "warranty"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Reset states when new file is selected
    setDocumentText("");
    setSelectedTerm("");
    setExplanation(null);
  };

  const processDocument = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document file to process",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('processorId', processorId);

      const response = await fetch("/api/ocr/process", {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (response.ok && data.text) {
        setDocumentText(data.text);
        toast({
          title: "Document processed successfully",
          description: "You can now click on terms to get explanations",
        });
      } else {
        throw new Error(data.message || "Failed to process document");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const explainTerm = async (term: string) => {
    if (!documentText || !term) {
      toast({
        title: "Missing information",
        description: "Both document text and term are required",
        variant: "destructive"
      });
      return;
    }

    setIsExplaining(true);
    setSelectedTerm(term);

    try {
      const response = await fetch("/api/ai/explain-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: documentText, term }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data);
    } catch (error) {
      console.error("Error explaining term:", error);
      toast({
        title: "Explanation failed",
        description: error instanceof Error ? error.message : "Failed to explain term",
        variant: "destructive"
      });
    } finally {
      setIsExplaining(false);
    }
  };

  // Function to highlight common legal terms in the document text
  const highlightTerms = (text: string) => {
    if (!text) return "";
    
    let highlightedText = text;
    
    // Sort terms by length (descending) to ensure longer terms are replaced first
    const sortedTerms = [...commonLegalTerms].sort((a, b) => b.length - a.length);
    
    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 px-1 rounded" data-term="${term.toLowerCase()}">${term}</span>`
      );
    }
    
    return highlightedText;
  };

  // Handle click on highlighted terms
  useEffect(() => {
    const handleTermClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-term')) {
        const term = target.getAttribute('data-term');
        if (term) {
          explainTerm(term);
        }
      }
    };

    const container = textContainerRef.current;
    if (container) {
      container.addEventListener('click', handleTermClick);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleTermClick);
      }
    };
  }, [documentText]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Upload Contract Document</CardTitle>
          <CardDescription>
            Upload a real estate contract to analyze and explain legal terms
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="document" className="text-sm font-medium">
              Choose Document
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.docx,.doc"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, JPG, PNG, TIFF, DOC, DOCX
            </p>
          </div>
          
          <Button 
            onClick={processDocument} 
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>Processing Document...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process Document
              </>
            )}
          </Button>
          
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText size={16} />
              <span>{file.name}</span>
            </div>
          )}

          {documentText && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Document Content</h3>
              <p className="text-sm text-muted-foreground">
                Click on any highlighted term to get an explanation.
              </p>
              <ScrollArea className="h-[600px] w-full border rounded-md p-4">
                <div 
                  ref={textContainerRef}
                  className="text-sm whitespace-pre-wrap" 
                  dangerouslySetInnerHTML={{ __html: highlightTerms(documentText) }}
                />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Term Explanation</CardTitle>
          <CardDescription>
            AI-powered explanations of legal terms in real estate contracts
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!documentText && !explanation ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Info className="h-12 w-12 text-muted-foreground/60" />
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Upload a Document</h3>
                <p className="text-muted-foreground">
                  Upload and process a contract document to start exploring legal terms.
                </p>
              </div>
            </div>
          ) : documentText && !explanation ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <AlertCircle className="h-12 w-12 text-primary/60" />
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Select a Term</h3>
                <p className="text-muted-foreground">
                  Click on any highlighted term in the document to see its explanation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {commonLegalTerms.slice(0, 8).map((term, idx) => (
                    <Badge key={idx} variant="outline" className="cursor-pointer hover:bg-primary/10" 
                          onClick={() => explainTerm(term)}>
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : isExplaining ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <div className="h-8 w-40 bg-primary/20 rounded mx-auto"></div>
                  <div className="h-4 w-64 bg-muted rounded mx-auto mt-4"></div>
                  <div className="h-4 w-52 bg-muted rounded mx-auto mt-2"></div>
                </div>
                <p className="text-muted-foreground">Generating explanation...</p>
              </div>
            </div>
          ) : explanation ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6 pr-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{explanation.term}</h3>
                  <Badge variant="outline" className="text-primary font-mono">
                    Legal Term
                  </Badge>
                </div>

                <div>
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    Definition
                  </h4>
                  <p className="mt-2 text-muted-foreground">{explanation.definition}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    Legal Implications
                  </h4>
                  <p className="mt-2 text-muted-foreground">{explanation.implications}</p>
                </div>

                {explanation.example && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Lightbulb className="h-5 w-5" />
                        Example
                      </h4>
                      <Alert className="mt-2 bg-muted/50">
                        <AlertTitle>Practical Example</AlertTitle>
                        <AlertDescription>{explanation.example}</AlertDescription>
                      </Alert>
                    </div>
                  </>
                )}

                {explanation.relatedTerms && explanation.relatedTerms.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <AlertCircle className="h-5 w-5" />
                        Related Terms
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {explanation.relatedTerms.map((relatedTerm, idx) => (
                          <Badge key={idx} variant="secondary" className="cursor-pointer" 
                                onClick={() => explainTerm(relatedTerm)}>
                            {relatedTerm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground mt-4">
                  <p>
                    Note: This explanation is generated by AI and should not be considered legal advice.
                    Always consult with a qualified legal professional for legal matters.
                  </p>
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}