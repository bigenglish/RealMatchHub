import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ChatRole = 'user' | 'bot';
interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatbotResponse {
  answer: string;
  relatedQuestions?: string[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Hi there! 👋 I\'m your RealtyAI assistant. How can I help you with your real estate journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Trigger the chat bubble to show after 3 seconds on the landing page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Make API call to the backend chatbot endpoint
      const response = await apiRequest("POST", "/api/chatbot", {
        query: input.trim(),
        chatHistory: messages
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }
      
      const data = await response.json() as ChatbotResponse;
      
      // Add bot's response to messages
      setMessages([...updatedMessages, { 
        role: 'bot', 
        content: data.answer 
      }]);
      
      // If there are related questions, suggest them
      if (data.relatedQuestions && data.relatedQuestions.length > 0) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              role: 'bot', 
              content: "You might also want to ask:" + 
                data.relatedQuestions.map((q: string) => `\n• ${q}`).join('')
            }
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error with chatbot:", error);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: "I'm having trouble connecting right now. Please try again in a moment or reach out to our customer support for assistance."
        }
      ]);
      
      toast({
        title: "Chatbot Error",
        description: "Could not connect to the AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      {showBubble && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
          <div className="bg-white text-black p-3 rounded-lg shadow-lg mb-2 max-w-xs">
            Need help with your real estate search?
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full bg-olive-600 hover:bg-olive-700 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-olive-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <img src="/logo.png" alt="RealtyAI Logo" />
              </Avatar>
              <div>
                <h3 className="font-semibold">RealtyAI Assistant</h3>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-olive-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-olive-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800 flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="resize-none min-h-[44px] rounded-md"
                rows={1}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                size="icon"
                className="h-11 w-11 bg-olive-600 hover:bg-olive-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}