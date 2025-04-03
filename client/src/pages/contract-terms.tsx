import DocumentTermExplainer from "@/components/document-term-explainer";

export default function ContractTermsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Interactive Contract Terms Explainer</h1>
        <p className="text-muted-foreground">
          Paste or upload your real estate contract text and click on highlighted terms to get AI-powered explanations
        </p>
      </div>
      
      <DocumentTermExplainer />
    </div>
  );
}