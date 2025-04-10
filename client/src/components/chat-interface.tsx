import React, { useState, useEffect, useRef } from 'react';
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
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Define these types here since we can't import from server
enum MessageType {
  CHAT = 'chat',
  SYSTEM = 'system',
  JOIN = 'join',
  LEAVE = 'leave'
}

enum ParticipantType {
  BUYER = 'buyer',
  SELLER = 'seller',
  EXPERT = 'expert',
  CUSTOMER_SERVICE = 'customer_service'
}

// Chat message type
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderType: ParticipantType;
  content: string;
  type: MessageType;
  timestamp: string;
  isRead: boolean;
}

// Conversation type
interface ChatConversation {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  lastMessageAt: string;
  participants: {
    id: number;
    conversationId: number;
    userId: number;
    userType: string;
    joinedAt: string;
    lastReadAt: string;
  }[];
  latestMessage?: ChatMessage;
  unreadCount?: number;
}

interface ChatInterfaceProps {
  userId: number;
  userName: string;
  userType: ParticipantType;
  expertMode?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ChatInterface({ 
  userId, 
  userName, 
  userType, 
  expertMode = false,
  onClose,
  className = ""
}: ChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket
  useEffect(() => {
    // Determine the WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create WebSocket connection
    const newSocket = new WebSocket(wsUrl);
    
    // Connection opened
    newSocket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Send authentication message
      const authMessage = {
        type: 'auth',
        userId,
        userName,
        userType,
        conversations: []
      };
      
      newSocket.send(JSON.stringify(authMessage));
    });
    
    // Listen for messages
    newSocket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'system':
            toast({
              title: "Chat System",
              description: data.content,
            });
            break;
            
          case 'error':
            toast({
              title: "Chat Error",
              description: data.content,
              variant: "destructive"
            });
            break;
            
          case 'new_message':
            if (activeConversation && 
                data.message.conversationId === activeConversation.id.toString()) {
              setMessages(prev => [...prev, data.message]);
              
              // Mark message as read if in active conversation
              markMessagesAsRead(activeConversation.id);
            }
            
            // Update conversation list to show new message
            fetchConversations();
            break;
            
          case 'unread_messages':
            // Update conversation list to show unread counts
            fetchConversations();
            break;
            
          case 'user_joined':
          case 'user_left':
          case 'messages_read':
            // Update conversation list and messages
            if (activeConversation) {
              fetchMessages(activeConversation.id);
            }
            fetchConversations();
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Connection closed
    newSocket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        toast({
          title: "Chat Disconnected",
          description: "Attempting to reconnect...",
        });
      }, 3000);
    });
    
    // Connection error
    newSocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Chat Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive"
      });
    });
    
    // Save socket instance
    setSocket(newSocket);
    
    // Cleanup function
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [userId, userName, userType]);
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await apiRequest("GET", `/api/chat/conversations?userId=${userId}`);
      const data: ChatConversation[] = await response.json();
      setConversations(data);
      
      // Update active conversation if it exists
      if (activeConversation) {
        const updatedConversation = data.find(c => c.id === activeConversation.id);
        if (updatedConversation) {
          setActiveConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };
  
  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await apiRequest("GET", `/api/chat/messages/${conversationId}`);
      const data: ChatMessage[] = await response.json();
      setMessages(data);
      
      // Mark messages as read when fetched
      markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (conversationId: number) => {
    try {
      await apiRequest("POST", `/api/chat/read/${conversationId}/${userId}`);
      
      // Update conversations to reflect read status
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Create a new conversation
  const createConversation = async (title: string, participants: {userId: number, userType: string}[]) => {
    try {
      // Add current user to participants
      const allParticipants = [
        ...participants,
        { userId, userType }
      ];
      
      // Create conversation
      const response = await apiRequest("POST", "/api/chat/conversations", {
        title,
        type: participants.length > 1 ? "group" : "direct",
        metadata: {}
      });
      
      const conversation: ChatConversation = await response.json();
      
      // Add participants
      for (const participant of allParticipants) {
        await apiRequest("POST", "/api/chat/participants", {
          conversationId: conversation.id,
          userId: participant.userId,
          userType: participant.userType
        });
      }
      
      // Fetch updated conversations
      await fetchConversations();
      
      // Set active conversation to the new one
      setActiveConversation(conversation);
      setActiveTab('chat');
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Send a message
  const sendMessage = () => {
    if (!messageInput.trim() || !activeConversation || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Create message object
    const message = {
      type: 'chat_message',
      conversationId: activeConversation.id.toString(),
      content: messageInput
    };
    
    // Send via WebSocket
    socket.send(JSON.stringify(message));
    
    // Clear input
    setMessageInput('');
  };
  
  // Handle conversation selection
  const selectConversation = async (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
    setActiveTab('chat');
    
    // Join conversation via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'join_conversation',
        conversationId: conversation.id.toString()
      }));
    }
  };
  
  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [userId]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get avatar color based on user type
  const getAvatarColor = (userType: string) => {
    switch (userType) {
      case ParticipantType.BUYER:
        return 'bg-blue-500';
      case ParticipantType.SELLER:
        return 'bg-green-500';
      case ParticipantType.EXPERT:
        return 'bg-amber-500';
      case ParticipantType.CUSTOMER_SERVICE:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <Card className={`flex flex-col h-[600px] w-full max-w-md shadow-lg ${className}`}>
      <CardHeader className="px-4 py-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {activeTab === 'conversations' ? 'Messages' : (activeConversation?.title || 'Chat')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeTab === 'chat' && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Audio Call"
                  disabled={!expertMode}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Video Call"
                  disabled={!expertMode}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Info"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="chat" disabled={!activeConversation}>Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="px-4 py-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map(conversation => (
                  <div 
                    key={conversation.id} 
                    className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors
                      ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={
                          getAvatarColor(
                            conversation.participants.find(p => p.userId !== userId)?.userType || 'default'
                          )
                        }>
                          {getInitials(conversation.title)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">{conversation.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.latestMessage ? (
                              `${conversation.latestMessage.senderName}: ${conversation.latestMessage.content}`
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                          {conversation.unreadCount ? (
                            <Badge variant="default" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <CardFooter className="border-t p-3">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                // Simulated for demo - in real app would show a dialog to select participants
                createConversation(
                  expertMode ? "New Customer Chat" : "Chat with Expert",
                  expertMode ? 
                    [{ userId: 123, userType: ParticipantType.BUYER }] : 
                    [{ userId: 456, userType: ParticipantType.EXPERT }]
                );
              }}
            >
              <Users className="h-4 w-4" />
              New Conversation
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages yet
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.senderId === userId ? 'flex-row-reverse' : ''}`}>
                      {message.senderId !== userId && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={getAvatarColor(message.senderType)}>
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {message.senderId !== userId && (
                          <div className="mb-1 flex justify-between">
                            <span className="text-xs font-medium">{message.senderName}</span>
                          </div>
                        )}
                        <div className={`rounded-lg p-3 ${
                          message.senderId === userId 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {message.content}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${message.senderId === userId ? 'text-right' : ''}`}>
                          {formatTimestamp(message.timestamp)}
                          {message.isRead && message.senderId === userId && (
                            <span className="ml-1">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <CardFooter className="border-t p-3">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={!connected || !activeConversation}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!connected || !activeConversation || !messageInput.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
      
      {!connected && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <Card className="w-[300px]">
            <CardHeader>
              <CardTitle>Connecting to Chat...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}