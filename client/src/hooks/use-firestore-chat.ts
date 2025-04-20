import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';

// Message and conversation types matching our backend
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
  metadata?: any;
}

interface ChatParticipant {
  id: number;
  conversationId: number;
  userId: number;
  userType: string;
  joinedAt: string;
  lastReadAt: string;
}

interface ChatConversation {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  lastMessageAt: string;
  participants: ChatParticipant[];
  latestMessage?: ChatMessage;
  unreadCount?: number;
  metadata?: any;
}

interface UseFirestoreChatProps {
  userId: number;
  userName: string;
  userType: ParticipantType;
}

export default function useFirestoreChat({
  userId,
  userName,
  userType
}: UseFirestoreChatProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageInput, setMessageInput] = useState<string>('');
  const { toast } = useToast();

  // Format Firestore timestamp to string
  const formatTimestamp = useCallback((timestamp: Timestamp): string => {
    return timestamp.toDate().toISOString();
  }, []);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await apiRequest("GET", `/api/chat/conversations?userId=${userId}`);
      const data: ChatConversation[] = await response.json();
      setConversations(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
      setLoading(false);
      return [];
    }
  }, [userId, toast]);

  // Listen for conversation updates
  useEffect(() => {
    if (!userId) return;

    // Use Firestore's onSnapshot to listen for participant changes
    const q = query(
      collection(firestore, 'chat_participants'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // When participants change, fetch all conversations
      // This is a basic implementation - could be optimized further
      fetchConversations();
    }, (error) => {
      console.error('Error in conversation listener:', error);
    });

    return () => unsubscribe();
  }, [userId, fetchConversations]);

  // Load and listen for messages in the active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const conversationId = activeConversation.id.toString();

    // Mark messages as read when conversation becomes active
    markMessagesAsRead(activeConversation.id);

    // Query for messages in this conversation, ordered by timestamp
    const q = query(
      collection(firestore, 'chat_messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    // Listen for message updates in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderType: data.senderType,
          content: data.content,
          type: data.type,
          timestamp: formatTimestamp(data.timestamp),
          isRead: data.isRead,
          metadata: data.metadata
        } as ChatMessage;
      });

      setMessages(updatedMessages);
    }, (error) => {
      console.error('Error in message listener:', error);
    });

    return () => unsubscribe();
  }, [activeConversation, userId, formatTimestamp]);

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: number) => {
    try {
      await apiRequest("POST", `/api/chat/read/${conversationId}`, { userId });
      // Update is handled by the listener
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Create a new conversation
  const createConversation = async (
    title: string,
    participants: Array<{ userId: number, userType: string }>,
    type: string = 'direct',
    metadata: any = null
  ): Promise<ChatConversation | null> => {
    try {
      const response = await apiRequest("POST", "/api/chat/conversations", {
        title,
        type,
        participants,
        metadata
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      const conversation: ChatConversation = await response.json();
      
      // Refresh conversations
      await fetchConversations();
      
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
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) {
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/chat/messages", {
        conversationId: activeConversation.id,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        content: messageInput,
        type: MessageType.CHAT
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Don't need to update messages manually - the listener will handle it
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Select a conversation
  const selectConversation = async (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    markMessagesAsRead(conversation.id);
  };

  // Initialize
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  return {
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
  };
}

export type {
  ChatMessage,
  ChatConversation,
  ChatParticipant,
  ParticipantType,
  MessageType
};