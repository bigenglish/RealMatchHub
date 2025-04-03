import { useState } from "react";
import DocumentUploader, { PropertyOcrResult, OcrResult } from "@/components/document-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText, Download, Check } from "lucide-react";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [showResults, setShowResults] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<PropertyOcrResult | null>(null);

  const handleOcrComplete = (result: OcrResult) => {
    setOcrResult(result);
    setShowResults(true);
    
    toast({
      title: "Document processed successfully",
      description: `Extracted ${result.pages} pages with ${result.entities?.length || 0} entities`,
    });
  };

  const handlePropertyExtracted = (result: PropertyOcrResult) => {
    setPropertyInfo(result);
    setShowResults(true);
    
    const fieldsExtracted = Object.keys(result).filter(k => k !== 'fullText').length;
    
    toast({
      title: "Property details extracted",
      description: `Successfully extracted ${fieldsExtracted} property fields`,
      variant: fieldsExtracted > 0 ? "default" : "destructive",
    });
  };

  // Function to download results as JSON
  const downloadResults = () => {
    const dataToDownload = ocrResult || propertyInfo;
    if (!dataToDownload) return;
    
    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = ocrResult 
      ? 'ocr-results.json' 
      : 'property-details.json';
      
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataUri);
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Document Processing</h1>
        <p className="text-muted-foreground">
          Upload property documents to extract information using Google Document AI OCR
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-${showResults ? '2' : '3'}`}>
          <DocumentUploader 
            onProcessComplete={handleOcrComplete}
            onPropertyExtracted={handlePropertyExtracted}
          />
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
                <CardDescription>
                  Our Document AI system can extract property information from:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Property listings and brochures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Home inspection reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Appraisal documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Lease agreements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Property tax documents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {showResults && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Results</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadResults}
                    className="h-8"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
                <CardDescription>
                  Extracted information from document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {ocrResult && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Document Info</h3>
                        <div className="bg-muted rounded-md p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Pages:</span>
                            <span className="font-medium">{ocrResult.pages}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Confidence:</span>
                            <span className="font-medium">{(ocrResult.confidence * 100).toFixed(1)}%</span>
                          </div>
                          {ocrResult.documentType && (
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium">{ocrResult.documentType}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {ocrResult.entities && ocrResult.entities.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Detected Entities</h3>
                          <div className="space-y-2">
                            {ocrResult.entities.map((entity, idx) => (
                              <div 
                                key={idx} 
                                className="border rounded p-2 text-sm bg-card"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <Badge variant="outline">{entity.type}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {(entity.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-sm">{entity.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium mb-2">Text Sample</h3>
                        <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-card">
                          {ocrResult.text.substring(0, 300)}
                          {ocrResult.text.length > 300 && '...'}
                        </div>
                      </div>
                    </div>
                  )}

                  {propertyInfo && (
                    <div className="space-y-4">
                      {Object.entries(propertyInfo)
                        .filter(([key]) => key !== 'fullText')
                        .map(([key, value]) => (
                          <div key={key} className="border rounded p-3">
                            <h3 className="text-sm font-medium capitalize mb-1">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </h3>
                            <p>{value}</p>
                          </div>
                        ))}

                      {(!propertyInfo || Object.keys(propertyInfo).filter(k => k !== 'fullText').length === 0) && (
                        <div className="bg-muted rounded-md p-4 text-center">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No specific property information detected. Try another document.
                          </p>
                        </div>
                      )}

                      {propertyInfo.fullText && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Text Sample</h3>
                          <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-card">
                            {propertyInfo.fullText.substring(0, 300)}
                            {propertyInfo.fullText.length > 300 && '...'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}