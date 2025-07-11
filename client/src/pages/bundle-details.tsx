
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function BundleDetails() {
  const { id } = useParams();
  
  const { data: bundle } = useQuery({
    queryKey: [`/api/marketplace/bundles/${id}`],
    initialData: {
      name: "BASIC",
      description: "Full virtual support from listing to post-closing",
      price: "As low as $1,500",
      savings: "Save time and money",
      featuredImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3",
      features: [
        "All 'Free' features",
        "Professional Photography (high-quality photos of the property)",
        "Staging Consultation (Expert consultation with staging tips)",
        "Comparative Market Analysis (CMA) Updates (regular updates on market conditions)",
        "Seller Disclosure Preparation Support (digital tools and templates, guidance)",
        "MLS Listing (basic MLS listing with syndication to major portals)",
        "Due Diligence Checklist & Support (guidance through the due diligence process)"
      ]
    }
  });

  if (!bundle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        {bundle.featuredImage && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={bundle.featuredImage} 
              alt={bundle.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{bundle.name}</CardTitle>
              <CardDescription className="text-lg mt-2">{bundle.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{bundle.price}</div>
              {bundle.savings && (
                <div className="text-green-600 font-medium">{bundle.savings}</div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Features & Benefits</h3>
          <ul className="grid gap-3">
            {bundle.features?.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
