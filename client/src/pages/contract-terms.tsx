import DocumentTermExplainer from "@/components/document-term-explainer";

export default function ContractTermsPage() {
  // Default processor ID for Document AI
  const processorId = "3c07700f0a77de4f";
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Interactive Contract Terms Explainer</h1>
        <p className="text-muted-foreground">
          Upload your real estate contract and click on highlighted terms to get AI-powered explanations
        </p>
      </div>
      
      <DocumentTermExplainer processorId={processorId} />
    </div>
  );
}