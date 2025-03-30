import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, User } from "lucide-react";
import type { ServiceProvider } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ServiceCardProps {
  provider: ServiceProvider;
}

export default function ServiceCard({ provider }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/service-provider/${provider.id}`}>
        <CardContent className="p-6 cursor-pointer">
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
            <p className="text-muted-foreground line-clamp-2">{provider.description}</p>
            
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                <span>{provider.rating}/5</span>
              </div>
              <span>{provider.experience} years experience</span>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button className="w-1/2" variant="outline" asChild>
          <Link href={`/service-provider/${provider.id}`}>
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </Button>
        <Button className="w-1/2" onClick={() => window.location.href = `tel:${provider.contact}`}>
          <Phone className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
