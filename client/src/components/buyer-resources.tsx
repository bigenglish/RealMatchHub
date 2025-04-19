
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ClipboardList, HelpCircle } from "lucide-react";

interface Resource {
  title: string;
  type: string;
  sections?: any[];
  categories?: any[];
}

export default function BuyerResources() {
  const [resources, setResources] = useState<Record<string, Resource>>({});

  useEffect(() => {
    const loadResources = async () => {
      const resourceFiles = [
        'buyer-needs-checklist',
        'property-viewing-checklist',
        'seller-questions'
      ];

      const loadedResources: Record<string, Resource> = {};
      
      for (const file of resourceFiles) {
        const response = await fetch(`/documents/${file}.json`);
        loadedResources[file] = await response.json();
      }

      setResources(loadedResources);
    };

    loadResources();
  }, []);

  const handleDownload = (resourceKey: string) => {
    const content = JSON.stringify(resources[resourceKey], null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resourceKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(resources).map(([key, resource]) => (
        <Card key={key} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {resource.title}
            </CardTitle>
            <CardDescription>
              Click to download or view the checklist
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="space-y-2">
              {resource.sections && (
                <div className="text-sm text-muted-foreground">
                  {resource.sections.length} sections included
                </div>
              )}
              {resource.categories && (
                <div className="text-sm text-muted-foreground">
                  {resource.categories.length} categories of questions
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => handleDownload(key)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
