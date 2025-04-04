import DocumentTermExplainer from "@/components/document-term-explainer";

export default function ContractTermsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Interactive Contract Terms Explainer</h1>
        <p className="text-muted-foreground">
          Upload your real estate contracts (PDF, images, text files) or paste contract text directly, 
          then click on highlighted terms to get AI-powered explanations
        </p>
      </div>
      
      <DocumentTermExplainer />
    </div>
  );
}