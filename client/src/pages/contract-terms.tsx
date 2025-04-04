import DocumentTermExplainer from "@/components/document-term-explainer";

export default function ContractTermsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Interactive Contract Terms Explainer</h1>
        <p className="text-muted-foreground">
          Upload your real estate contracts (PDF, images, text files) or paste contract text directly. 
          Then, select any text you want explained or click on pre-highlighted legal terms for instant AI-powered explanations.
        </p>
      </div>
      
      <DocumentTermExplainer />
    </div>
  );
}