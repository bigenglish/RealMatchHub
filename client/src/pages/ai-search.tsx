import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AiStyleSearch from "@/components/ai-style-search";
import { Search, Camera, Upload, BrainCircuit, Sparkles } from "lucide-react";

export default function AiSearchPage() {
  const [searchStarted, setSearchStarted] = useState(false);
  
  return (
    <>
      <Helmet>
        <title>AI-Powered Property Search | Realty.ai</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {!searchStarted ? (
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Find Your Dream Home with AI
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                Upload photos of homes you love and tell us about your needs. Our AI will find properties that match your style and practical requirements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-olive-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Inspiration</h3>
                    <p className="text-gray-600 text-sm">
                      Share photos of homes that match your style preferences.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center mb-4">
                      <BrainCircuit className="h-6 w-6 text-olive-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Our AI analyzes your style and combines it with your practical needs.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-olive-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Personalized Results</h3>
                    <p className="text-gray-600 text-sm">
                      Get property recommendations tailored to your unique preferences.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Button 
                size="lg" 
                className="bg-olive-600 hover:bg-olive-700 text-white px-8"
                onClick={() => setSearchStarted(true)}
              >
                Start AI Property Search
              </Button>
            </div>
          ) : (
            <AiStyleSearch />
          )}
        </div>
      </div>
    </>
  );
}