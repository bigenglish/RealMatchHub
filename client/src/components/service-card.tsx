import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceOffering } from "@shared/schema";
import { Link } from "wouter";

interface ServiceCardProps {
  service: ServiceOffering;
  compact?: boolean;
}

export default function ServiceCard({ service, compact = false }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className={compact ? "p-4" : undefined}>
        <CardTitle className={compact ? "text-base" : "text-lg"}>
          {service.name}
        </CardTitle>
        {!compact && <CardDescription>{service.description}</CardDescription>}
      </CardHeader>
      <CardContent className={`flex-grow ${compact ? "p-4 pt-0" : ""}`}>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">{service.price}</span>
          {!compact && (
            <span className="text-muted-foreground text-sm">
              {service.estimatedDuration}
            </span>
          )}
        </div>
        {!compact && (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              <span>Typical timing: </span>
              <span>{service.typicalTimingInTransaction}</span>
            </div>
            {service.requiredDocuments && service.requiredDocuments.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium">Required documents:</span>
                <ul className="text-sm mt-1 space-y-1 list-disc pl-4">
                  {service.requiredDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className={compact ? "p-4 pt-0" : undefined}>
        <Link href={`/marketplace/service/${service.id}`}>
          <Button variant={compact ? "secondary" : "outline"} size={compact ? "sm" : "default"} className="w-full">
            {compact ? "Details" : "Request Service"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}