import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export interface OcrResult {
  text: string;
  confidence: number;
  pages: number;
  entities?: Array<{
    type: string;
    text: string;
    confidence: number;
  }>;
  documentType?: string;
}

export interface PropertyOcrResult {
  address?: string;
  price?: string;
  squareFeet?: string;
  date?: string;
  contact?: string;
  fullText: string;
  [key: string]: any;
}

interface DocumentUploaderProps {
  onProcessComplete?: (result: OcrResult) => void;
  onPropertyExtracted?: (propertyInfo: PropertyOcrResult) => void;
  processorId?: string;
}

export default function DocumentUploader({ 
  onProcessComplete, 
  onPropertyExtracted,
  processorId 
}: DocumentUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processorIdInput, setProcessorIdInput] = useState<string>(processorId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ocr" | "property">("ocr");
  const [result, setResult] = useState<OcrResult | null>(null);
  const [propertyResult, setPropertyResult] = useState<PropertyOcrResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Reset results when new file is selected
    setResult(null);
    setPropertyResult(null);
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

    if (!processorIdInput) {
      toast({
        title: "Processor ID required",
        description: "Please enter a Document AI processor ID",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('processorId', processorIdInput);

      const endpoint = activeTab === "ocr" 
        ? "/api/ocr/process" 
        : "/api/ocr/property-document";

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with boundary parameter
      });
      
      const data = await response.json();

      if (activeTab === "ocr") {
        setResult(data as OcrResult);
        if (onProcessComplete) {
          onProcessComplete(data as OcrResult);
        }
      } else {
        setPropertyResult(data as PropertyOcrResult);
        if (onPropertyExtracted) {
          onPropertyExtracted(data as PropertyOcrResult);
        }
      }

      toast({
        title: "Document processed successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderOcrResult = () => {
    if (!result) return null;

    return (
      <div className="mt-4 border rounded-md p-4 bg-muted/30 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">OCR Results</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
            <span>Pages: {result.pages}</span>
          </div>
        </div>
        
        {result.entities && result.entities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Detected Entities:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.entities.map((entity, index) => (
                <div key={index} className="border rounded-md p-2 text-sm bg-background">
                  <div className="font-medium">{entity.type}</div>
                  <div className="text-muted-foreground">{entity.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Extracted Text:</h4>
          <div className="border rounded-md p-3 text-sm bg-background max-h-64 overflow-y-auto whitespace-pre-wrap">
            {result.text}
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyResult = () => {
    if (!propertyResult) return null;

    // Extract all property fields except fullText
    const propertyFields = Object.entries(propertyResult)
      .filter(([key]) => key !== 'fullText');

    return (
      <div className="mt-4 border rounded-md p-4 bg-muted/30 space-y-4">
        <h3 className="text-lg font-medium">Property Information</h3>
        
        {propertyFields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {propertyFields.map(([key, value]) => (
              <div key={key} className="border rounded-md p-3 bg-background">
                <div className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-base">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-amber-500 gap-2 py-2">
            <AlertCircle size={18} />
            <p>No specific property information was extracted. Try a different document.</p>
          </div>
        )}
        
        {propertyResult.fullText && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Full Document Text:</h4>
            <div className="border rounded-md p-3 text-sm bg-background max-h-64 overflow-y-auto whitespace-pre-wrap">
              {propertyResult.fullText}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Document OCR Processing</CardTitle>
        <CardDescription>
          Upload property documents to extract information using Google Document AI
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ocr" | "property")}>
          <TabsList className="mb-4">
            <TabsTrigger value="ocr">General OCR</TabsTrigger>
            <TabsTrigger value="property">Property Document</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ocr" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload any document to extract text and entities using OCR.
              </p>
            </div>
            {result && renderOcrResult()}
          </TabsContent>
          
          <TabsContent value="property" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload property documents like listings or appraisals to extract key property information.
              </p>
            </div>
            {propertyResult && renderPropertyResult()}
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4 mt-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="processorId" className="text-sm font-medium">
              Document AI Processor ID
            </label>
            <Input
              id="processorId"
              type="text"
              value={processorIdInput}
              onChange={(e) => setProcessorIdInput(e.target.value)}
              placeholder="Enter your Document AI processor ID"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in the Google Cloud Console
            </p>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="document" className="text-sm font-medium">
              Upload Document
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, JPG, PNG, TIFF
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {file && (
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>{file.name}</span>
            </div>
          )}
        </div>
        <Button 
          onClick={processDocument} 
          disabled={!file || isUploading || !processorIdInput}
        >
          {isUploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Process Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}