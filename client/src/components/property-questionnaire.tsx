import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Home, Building, Users, Briefcase, Sparkles, ChevronsRight } from "lucide-react";

export type UserIntent = "buying" | "selling" | "both" | undefined;
export type UserLifestage = "flexible-move" | "job-received" | "live-alone" | "own-home" | "have-children" | "life-change" | 
                            "flexible-downpayment" | "sold-property" | "self-employed" | "small-business" | "life-questions";

export interface UserPreferences {
  intent?: UserIntent;
  lifestage?: UserLifestage[];
  budget?: {
    min: number;
    max: number;
  };
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  mustHaveFeatures?: string[];
}

interface PropertyQuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
}

export default function PropertyQuestionnaire({ onComplete, onSkip }: PropertyQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    intent: undefined,
    lifestage: [],
    budget: {
      min: 200000,
      max: 750000,
    },
    location: "",
    propertyType: "",
    bedrooms: 0,
    bathrooms: 0,
    mustHaveFeatures: [],
  });
  
  const totalSteps = 3;
  const progress = Math.round((step / totalSteps) * 100);
  
  const handleIntentSelect = (intent: UserIntent) => {
    setPreferences({ ...preferences, intent });
    setStep(2);
  };
  
  const handleLifestageSelect = (lifestage: UserLifestage) => {
    const current = preferences.lifestage || [];
    const updated = current.includes(lifestage)
      ? current.filter(item => item !== lifestage)
      : [...current, lifestage];
    
    setPreferences({ ...preferences, lifestage: updated });
  };
  
  const isLifestageSelected = (lifestage: UserLifestage) => {
    return preferences.lifestage?.includes(lifestage) || false;
  };
  
  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Tell us about you — we'll recommend the right solution.
        </h2>
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>
      
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">What are you looking to do?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                preferences.intent === "buying" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("buying")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Home className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Buy a property</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to purchase a home or investment property
                </p>
              </div>
            </Card>
            
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                preferences.intent === "selling" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("selling")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Building className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Sell a property</h4>
                <p className="text-sm text-muted-foreground">
                  I want to sell my current property
                </p>
              </div>
            </Card>
            
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                preferences.intent === "both" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("both")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Sparkles className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Both</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to sell my current property and buy a new one
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">Tell us about your situation</h3>
          <p className="text-center text-muted-foreground">Select all that apply to you</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I'm flexible on when I move"
              value="flexible-move"
              selected={isLifestageSelected("flexible-move")}
              onClick={() => handleLifestageSelect("flexible-move")}
            />
            
            <LifestageCard 
              icon={<Briefcase className="h-6 w-6" />}
              title="I have a job (received W-2)"
              value="job-received"
              selected={isLifestageSelected("job-received")}
              onClick={() => handleLifestageSelect("job-received")}
            />
            
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I live alone"
              value="live-alone"
              selected={isLifestageSelected("live-alone")}
              onClick={() => handleLifestageSelect("live-alone")}
            />
            
            <LifestageCard 
              icon={<Home className="h-6 w-6" />}
              title="I own a home"
              value="own-home"
              selected={isLifestageSelected("own-home")}
              onClick={() => handleLifestageSelect("own-home")}
            />
            
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I have children or dependents"
              value="have-children"
              selected={isLifestageSelected("have-children")}
              onClick={() => handleLifestageSelect("have-children")}
            />
            
            <LifestageCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="Expecting a change in major life event"
              value="life-change"
              selected={isLifestageSelected("life-change")}
              onClick={() => handleLifestageSelect("life-change")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I'm flexible on downpayment"
              value="flexible-downpayment"
              selected={isLifestageSelected("flexible-downpayment")}
              onClick={() => handleLifestageSelect("flexible-downpayment")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I sold stock or own rental property"
              value="sold-property"
              selected={isLifestageSelected("sold-property")}
              onClick={() => handleLifestageSelect("sold-property")}
            />
            
            <LifestageCard 
              icon={<Briefcase className="h-6 w-6" />}
              title="I'm self-employed/freelancer"
              value="self-employed"
              selected={isLifestageSelected("self-employed")}
              onClick={() => handleLifestageSelect("self-employed")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I own a small business"
              value="small-business"
              selected={isLifestageSelected("small-business")}
              onClick={() => handleLifestageSelect("small-business")}
            />
            
            <LifestageCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="My life has changed and I have questions"
              value="life-questions"
              selected={isLifestageSelected("life-questions")}
              onClick={() => handleLifestageSelect("life-questions")}
            />
          </div>
          
          <div className="flex justify-center pt-4">
            <Button onClick={handleNextStep}>
              Continue
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">Ready to find your perfect match!</h3>
          <p className="text-center text-muted-foreground">
            {preferences.intent === "buying" && "We've prepared specialized property recommendations based on your needs."}
            {preferences.intent === "selling" && "We've prepared specialized services to help you sell your property."}
            {preferences.intent === "both" && "We've prepared a comprehensive plan to help you both sell and buy."}
          </p>
          
          <div className="bg-muted p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-semibold">You are looking to:</span>
                <span>
                  {preferences.intent === "buying" && "Buy a property"}
                  {preferences.intent === "selling" && "Sell a property"}
                  {preferences.intent === "both" && "Buy and sell properties"}
                </span>
              </div>
              
              {preferences.lifestage && preferences.lifestage.length > 0 && (
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold">Your situation: </span>
                    <span>
                      {preferences.lifestage.map((stage, index) => (
                        <span key={stage}>
                          {formatLifestage(stage)}
                          {index < preferences.lifestage!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Go Back
            </Button>
            <Button onClick={() => onComplete(preferences)}>
              Find Properties
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <Button variant="ghost" onClick={onSkip}>
          Skip and continue to all properties
        </Button>
      </div>
    </div>
  );
}

interface LifestageCardProps {
  icon: React.ReactNode;
  title: string;
  value: UserLifestage;
  selected: boolean;
  onClick: () => void;
}

function LifestageCard({ icon, title, selected, onClick }: LifestageCardProps) {
  return (
    <Card 
      className={`p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
        selected ? "bg-primary/10 border-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${selected ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="text-sm font-medium">{title}</div>
        {selected && <Check className="h-4 w-4 ml-auto text-primary" />}
      </div>
    </Card>
  );
}

function formatLifestage(stage: UserLifestage): string {
  const map: Record<UserLifestage, string> = {
    "flexible-move": "Flexible on move timing",
    "job-received": "Have a W-2 job",
    "live-alone": "Live alone",
    "own-home": "Own a home",
    "have-children": "Have children/dependents",
    "life-change": "Expecting life changes",
    "flexible-downpayment": "Flexible on downpayment",
    "sold-property": "Sold property/stocks",
    "self-employed": "Self-employed",
    "small-business": "Small business owner",
    "life-questions": "Have life situation questions"
  };
  
  return map[stage] || stage;
}