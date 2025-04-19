
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { MapPin, Home, BarChart3 } from 'lucide-react';

interface CMAInput {
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
}

interface CMAReport {
  estimatedValue: number;
  confidenceScore: number;
  comparables: Array<{
    address: string;
    salePrice: number;
    sqft: number;
  }>;
  marketInsights: string;
  priceRecommendation: string;
}

export default function CMAAnalysis() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<CMAInput>({
    address: '',
    propertyType: 'house',
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: 0
  });
  const [report, setReport] = useState<CMAReport | null>(null);

  const handleInputChange = (name: string, value: string | number) => {
    setInput(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setStep(2);
      }
    } catch (error) {
      console.error('Error generating CMA:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Property Value Analysis</h2>
        <p className="text-muted-foreground">Get an AI-powered analysis of your property's market value</p>
      </div>

      <Progress value={step === 1 ? 50 : 100} className="mb-8" />

      {step === 1 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="address">Property Address</Label>
                <div className="flex gap-2 mt-1">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    value={input.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter property address"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select 
                  value={input.propertyType}
                  onValueChange={(value) => handleInputChange('propertyType', value)}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={input.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={input.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    value={input.squareFootage}
                    onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Generate Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : report && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">Estimated Value</h3>
                <span className="text-3xl font-bold">${report.estimatedValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Confidence Score:</span>
                <Progress value={report.confidenceScore} className="w-32" />
                <span className="text-sm">{report.confidenceScore}%</span>
              </div>
              <p className="text-muted-foreground">{report.marketInsights}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Comparable Properties</h3>
              <div className="space-y-4">
                {report.comparables.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{comp.address}</p>
                      <p className="text-sm text-muted-foreground">{comp.sqft} sqft</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${comp.salePrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">${Math.round(comp.salePrice/comp.sqft)}/sqft</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setStep(1)} variant="outline" className="w-full">
            Start New Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
