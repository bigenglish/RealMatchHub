import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Video, 
  Share2, 
  PanelLeft, 
  PanelRight, 
  Maximize, 
  Minimize, 
  VolumeX, 
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ChevronsRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VirtualTourProps {
  propertyId: number;
  propertyImages: string[];
  videoUrl?: string;
  onClose?: () => void;
}

export default function VirtualTour({ 
  propertyId, 
  propertyImages, 
  videoUrl,
  onClose 
}: VirtualTourProps) {
  const [activeView, setActiveView] = useState<'3d' | 'video' | 'gallery'>('gallery');
  const [fullscreen, setFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  // Simulate loading the 3D tour
  useEffect(() => {
    if (activeView === '3d') {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [activeView]);
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setFullscreen(false);
    }
  };
  
  // Handle video playback
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPaused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPaused(!isPaused);
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Simulate 3D rotation
  const rotateView = (direction: 'left' | 'right') => {
    const rotationAmount = direction === 'left' ? -45 : 45;
    setCurrentRotation(prev => prev + rotationAmount);
  };
  
  // Handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Virtual Tour - Property #${propertyId}`,
        url: window.location.href
      })
      .catch(() => {
        // Fallback if sharing fails
        toast({
          title: "Share Link Copied",
          description: "Tour link copied to clipboard",
        });
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Share Link Copied",
        description: "Tour link copied to clipboard",
      });
    }
  };
  
  // Gallery navigation
  const showNextImage = () => {
    setCurrentImageIndex(prev => 
      prev < propertyImages.length - 1 ? prev + 1 : 0
    );
  };
  
  const showPrevImage = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : propertyImages.length - 1
    );
  };
  
  return (
    <Card className="w-full h-full overflow-hidden">
      <div ref={containerRef} className="relative">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Virtual Tour</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="3d">3D Tour</TabsTrigger>
                {videoUrl && <TabsTrigger value="video">Video</TabsTrigger>}
              </TabsList>
              
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {fullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <CardContent className="p-0">
            <TabsContent value="gallery" className="m-0">
              <div className="relative w-full aspect-video bg-black">
                {propertyImages.length > 0 ? (
                  <>
                    <img 
                      src={propertyImages[currentImageIndex]} 
                      alt={`Property view ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={showPrevImage}
                        className="bg-white/20 hover:bg-white/40"
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-white font-medium">
                        {currentImageIndex + 1} / {propertyImages.length}
                      </span>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={showNextImage}
                        className="bg-white/20 hover:bg-white/40"
                      >
                        <PanelRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    No gallery images available
                  </div>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              <div className="p-2 overflow-x-auto">
                <div className="flex gap-2">
                  {propertyImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer flex-shrink-0 border-2 rounded transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="3d" className="m-0">
              <div className="relative w-full aspect-video bg-black">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      <p className="text-white">Loading 3D Tour...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Simulated 3D view with rotation */}
                    <div className="relative w-full h-full">
                      {propertyImages.length > 0 && (
                        <img 
                          src={propertyImages[0]} 
                          alt="3D view"
                          className="w-full h-full object-cover transition-transform duration-700"
                          style={{ transform: `perspective(1000px) rotateY(${currentRotation}deg)` }}
                        />
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <Button 
                          variant="outline"
                          onClick={() => rotateView('left')}
                          className="bg-white/20 hover:bg-white/40"
                        >
                          Rotate Left
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentRotation(0)}
                          className="bg-white/20 hover:bg-white/40"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset View
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => rotateView('right')}
                          className="bg-white/20 hover:bg-white/40"
                        >
                          Rotate Right
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4 bg-muted/20">
                <h3 className="text-sm font-medium mb-2">3D Tour Instructions:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use the rotation buttons to view different angles</li>
                  <li>• Click and drag on the image to look around</li>
                  <li>• Double-click to move to a specific location</li>
                  <li>• Use scroll wheel or pinch gesture to zoom in/out</li>
                </ul>
              </div>
            </TabsContent>
            
            {videoUrl && (
              <TabsContent value="video" className="m-0">
                <div className="relative w-full aspect-video bg-black">
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full"
                    poster={propertyImages[0]}
                    onPlay={() => setIsPaused(false)}
                    onPause={() => setIsPaused(true)}
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={togglePlayPause}
                      className="bg-white/20 hover:bg-white/40"
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4 fill-current" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleMute}
                      className="bg-white/20 hover:bg-white/40"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
      </div>
    </Card>
  );
}