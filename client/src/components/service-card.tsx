import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone } from "lucide-react";
import type { ServiceProvider } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  provider: ServiceProvider;
}

export default function ServiceCard({ provider }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <img
            src={provider.image}
            alt={provider.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{provider.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {provider.type}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-muted-foreground">{provider.description}</p>
          
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{provider.rating}/5</span>
            </div>
            <span>{provider.experience} years experience</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" onClick={() => window.location.href = `tel:${provider.contact}`}>
          <Phone className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
