import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Find Your Dream Home &<br />
          Connect with Top Professionals
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
          Your one-stop marketplace for all real estate needs. Browse properties and
          connect with service providers to make your dream home a reality.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/properties">
            <Button size="lg">
              Browse Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline">
              Find Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-8 text-card-foreground">
          <Home className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Property Listings</h2>
          <p className="text-muted-foreground mb-6">
            Explore our curated collection of properties. From cozy apartments to
            luxurious homes, find the perfect property that matches your needs.
          </p>
          <Link href="/properties">
            <Button variant="secondary">View Listings</Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-8 text-card-foreground">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Service Providers</h2>
          <p className="text-muted-foreground mb-6">
            Connect with top-rated real estate professionals. From agents to
            inspectors, we've got all the experts you need.
          </p>
          <Link href="/services">
            <Button variant="secondary">Find Services</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
