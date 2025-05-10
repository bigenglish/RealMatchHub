import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { firestore as firestoreInstance } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  Firestore
} from 'firebase/firestore';

// Validate that we have a valid Firestore instance and provide detailed error information
let firestore: Firestore;

try {
  if (!firestoreInstance) {
    throw new Error('Firestore instance is null or undefined');
  }
  
  if (typeof firestoreInstance !== 'object') {
    throw new Error('Firestore instance is not an object');
  }
  
  // Type assertion with proper validation
  firestore = firestoreInstance as Firestore;
  console.log('Firestore instance validated successfully in use-firestore-chat-fixed.ts');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('CRITICAL ERROR: Invalid Firestore instance in use-firestore-chat-fixed.ts:', error);
  throw new Error(`Firebase Firestore initialization failed: ${errorMessage}`);
}

// Message and conversation types matching our backend
// Enums defined as const objects so they can be used both as types and values
export const MessageType = {
  CHAT: 'chat',
  SYSTEM: 'system',
  JOIN: 'join',
  LEAVE: 'leave'
} as const;

export type MessageTypeValue = typeof MessageType[keyof typeof MessageType];

export const ParticipantType = {
  BUYER: 'buyer',
  SELLER: 'seller',
  EXPERT: 'expert',
  CUSTOMER_SERVICE: 'customer_service'
} as const;

export type ParticipantTypeValue = typeof ParticipantType[keyof typeof ParticipantType];

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderType: ParticipantTypeValue;
  content: string;
  type: MessageTypeValue;
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

// Define types once at the top
export type MessageType2 = {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  isRead: boolean;
};

export type ParticipantType2 = {
  id: string;
  userId: string;
  userType: string;
  joinedAt: string;
  lastReadAt: string;
};

export function useFirestoreChat(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Format Firestore timestamp to string
  const formatTimestamp = useCallback((timestamp: Timestamp): string => {
    return timestamp.toDate().toISOString();
  }, []);


  useEffect(() => {
    if (!conversationId) return;

    const conversationIdStr = conversationId.toString();

    // Query for messages in this conversation, ordered by timestamp
    const q = query(
      collection(firestore, 'chat_messages'),
      where('conversationId', '==', conversationIdStr),
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
      setError(error.message);
    });

     // Query for participants in this conversation
     const participantsQuery = query(
      collection(firestore, 'chat_participants'),
      where('conversationId', '==', conversationId)
    );

    const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
      const updatedParticipants = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          userId: data.userId,
          userType: data.userType,
          joinedAt: data.joinedAt,
          lastReadAt: data.lastReadAt
        } as ChatParticipant;
      });

      setParticipants(updatedParticipants);
      setLoading(false);
    }, (error) => {
      console.error('Error in participants listener:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => { unsubscribe(); unsubscribeParticipants(); };
  }, [conversationId, formatTimestamp, toast]);


  return {
    messages,
    participants,
    loading,
    error
  };
}

export type {
  ChatMessage,
  ChatConversation,
  ChatParticipant
};