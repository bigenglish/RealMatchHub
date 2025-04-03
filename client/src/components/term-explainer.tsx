import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, BookOpen, Info, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TermExplanation {
  term: string;
  definition: string;
  implications: string;
  example?: string;
  relatedTerms?: string[];
}

export default function TermExplainer() {
  const { toast } = useToast();
  const [contractText, setContractText] = useState("");
  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<TermExplanation | null>(null);

  const handleExplain = async () => {
    if (!contractText.trim()) {
      toast({
        title: "Contract text required",
        description: "Please paste the contract text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!term.trim()) {
      toast({
        title: "Term required",
        description: "Please enter the legal term you want explained",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/explain-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, term }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data);
      toast({
        title: "Term explained",
        description: `Successfully explained "${term}"`,
      });
    } catch (error) {
      console.error("Error explaining term:", error);
      toast({
        title: "Explanation failed",
        description: error instanceof Error ? error.message : "Failed to explain term",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Real Estate Contract Term Explainer</CardTitle>
          <CardDescription>
            Paste your contract text and enter a legal term to get an AI-powered explanation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="contract" className="text-sm font-medium">
              Contract Text
            </label>
            <Textarea
              id="contract"
              placeholder="Paste your contract text here..."
              className="min-h-[200px]"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="term" className="text-sm font-medium">
              Legal Term to Explain
            </label>
            <div className="flex gap-2">
              <Input
                id="term"
                placeholder="e.g., Force Majeure, Indemnification, Escrow"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <Button
                onClick={handleExplain}
                disabled={isLoading || !contractText.trim() || !term.trim()}
              >
                {isLoading ? "Processing..." : "Explain Term"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {explanation && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Term Explanation</CardTitle>
              <Badge variant="outline" className="text-primary font-mono">
                AI-Generated
              </Badge>
            </div>
            <CardDescription>
              AI-powered explanation of "{explanation.term}" in real estate context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    Definition
                  </h3>
                  <p className="mt-2 text-muted-foreground">{explanation.definition}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    Legal Implications
                  </h3>
                  <p className="mt-2 text-muted-foreground">{explanation.implications}</p>
                </div>

                {explanation.example && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Lightbulb className="h-5 w-5" />
                        Example
                      </h3>
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
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <AlertCircle className="h-5 w-5" />
                        Related Terms
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {explanation.relatedTerms.map((relatedTerm, idx) => (
                          <Badge key={idx} variant="secondary" className="cursor-pointer" 
                                onClick={() => setTerm(relatedTerm)}>
                            {relatedTerm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="bg-muted/30 text-xs text-muted-foreground">
            <p>
              Note: This explanation is generated by AI and should not be considered legal advice.
              Always consult with a qualified legal professional for legal matters.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}