import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Users, Phone, Video, Info } from "lucide-react";
import useFirestoreChat, { 
  ParticipantType, 
  ChatConversation,
  ChatMessage,
  ParticipantTypeValue
} from "@/hooks/use-firestore-chat-fixed";

interface ChatInterfaceProps {
  userId: number;
  userName: string;
  userType: ParticipantTypeValue;
  expertMode?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ChatInterfaceFirestore({ 
  userId, 
  userName, 
  userType, 
  expertMode = false,
  onClose,
  className = ""
}: ChatInterfaceProps) {
  const [activeTab, setActiveTab] = React.useState('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use our new Firestore chat hook
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    messageInput,
    setMessageInput,
    createConversation,
    sendMessage,
    selectConversation,
    fetchConversations
  } = useFirestoreChat({
    userId,
    userName,
    userType
  });

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Create expert conversation
  const startExpertChat = async () => {
    if (!userId) return;
    
    // Create a conversation with our expert
    const newConversation = await createConversation(
      `Expert Chat with ${userName}`,
      [
        { userId, userType },
        { userId: 1, userType: 'expert' as ParticipantTypeValue } // Assuming ID 1 is our expert
      ],
      'support',
      { requestType: 'expert_assistance' }
    );
    
    if (newConversation) {
      selectConversation(newConversation);
      setActiveTab('chat');
    }
  };

  // Create customer service conversation
  const startCustomerServiceChat = async () => {
    if (!userId) return;
    
    // Create a conversation with customer service
    const newConversation = await createConversation(
      `Customer Support for ${userName}`,
      [
        { userId, userType },
        { userId: 2, userType: 'customer_service' as ParticipantTypeValue } // Assuming ID 2 is customer service
      ],
      'support',
      { requestType: 'customer_support' }
    );
    
    if (newConversation) {
      selectConversation(newConversation);
      setActiveTab('chat');
    }
  };

  // Format chat message timestamp for display
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Format conversation timestamp for display
  const formatConversationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    }
  };

  // Handle message input submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      await sendMessage();
    }
  };

  // Render participant avatar based on user type
  const renderAvatar = (participantType: ParticipantTypeValue, name: string) => {
    let initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    let color = 'bg-primary';
    
    if (participantType === 'expert') {
      color = 'bg-blue-500';
    } else if (participantType === 'customer_service') {
      color = 'bg-green-500';
    }
    
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className={color + ' text-white'}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <Card className={`flex flex-col h-[500px] shadow-lg w-full max-w-md ${className}`}>
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            {activeTab === 'chat' && activeConversation
              ? activeConversation.title
              : 'Messages'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="chat" disabled={!activeConversation}>Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">No conversations yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new conversation with an expert or customer service
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                      activeConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    {renderAvatar(
                      conversation.participants.find(p => p.userId !== userId)?.userType || 'expert' as ParticipantTypeValue,
                      conversation.title
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm truncate">{conversation.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageAt && formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      {conversation.latestMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conversation.latestMessage.senderName === userName ? 'You: ' : ''}
                          {conversation.latestMessage.content}
                        </p>
                      )}
                    </div>
                    {(conversation.unreadCount && conversation.unreadCount > 0) && (
                      <Badge variant="default" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 grid grid-cols-2 gap-2 border-t">
            <Button 
              onClick={startExpertChat} 
              variant="outline" 
              className="flex items-center justify-center"
            >
              <User className="h-4 w-4 mr-2" />
              <span>Expert Chat</span>
            </Button>
            <Button 
              onClick={startCustomerServiceChat} 
              variant="outline" 
              className="flex items-center justify-center"
            >
              <Info className="h-4 w-4 mr-2" />
              <span>Support</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 relative">
          {!activeConversation ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === userId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.senderId !== userId && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-xs">{message.senderName}</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-xs mt-1 ${message.senderId === userId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {expertMode && (
        <CardFooter className="p-2 border-t flex justify-between bg-muted/30">
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              <Phone className="h-3 w-3 mr-1" />
              <span className="text-xs">Call</span>
            </Button>
            <Button size="sm" variant="outline">
              <Video className="h-3 w-3 mr-1" />
              <span className="text-xs">Video</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground self-center">
            {userName} • {userType}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}