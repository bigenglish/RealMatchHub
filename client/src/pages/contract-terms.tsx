import TermExplainer from "@/components/term-explainer";

export default function ContractTermsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Contract Terms Explainer</h1>
        <p className="text-muted-foreground">
          Understand legal terms in your real estate contracts using AI-powered explanations
        </p>
      </div>
      
      <TermExplainer />
    </div>
  );
}