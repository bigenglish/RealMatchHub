import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from './chat-interface'; // Original WebSocket version
import ChatInterfaceFirestore from './chat-interface-firestore'; // New Firestore version
import useFirestoreChat, { ParticipantTypeValue } from '@/hooks/use-firestore-chat-fixed';

// Configuration to control which chat implementation to use
const USE_FIRESTORE = true; // Using Firestore implementation for chat

export interface ChatProviderProps {
  userId: number;
  userName: string;
  userType: string;
  expertMode?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ChatProvider({
  userId,
  userName,
  userType,
  expertMode = false,
  onClose,
  className = ""
}: ChatProviderProps) {
  const { toast } = useToast();
  
  // Map string user type to enum value
  const mapUserType = (type: string): ParticipantTypeValue => {
    switch (type.toLowerCase()) {
      case 'buyer': return 'buyer' as ParticipantTypeValue;
      case 'seller': return 'seller' as ParticipantTypeValue;
      case 'expert': return 'expert' as ParticipantTypeValue;
      case 'customer_service': return 'customer_service' as ParticipantTypeValue;
      default: return 'buyer' as ParticipantTypeValue;
    }
  };
  
  const participantType = mapUserType(userType);

  // Show a notification once when switching to Firestore
  useEffect(() => {
    if (USE_FIRESTORE) {
      console.log('Chat Provider: Using Firestore implementation');
      console.log('Chat Provider props:', { userId, userName, userType, expertMode });
      
      toast({
        title: "Using Firestore Chat",
        description: "This chat is now powered by Firebase Firestore for better real-time performance",
        duration: 3000
      });
    } else {
      console.log('Chat Provider: Using WebSocket implementation');
    }
  }, [toast, userId, userName, userType, expertMode]);

  // Render the appropriate chat interface
  return USE_FIRESTORE ? (
    <ChatInterfaceFirestore
      userId={userId}
      userName={userName}
      userType={participantType}
      expertMode={expertMode}
      onClose={onClose}
      className={className}
    />
  ) : (
    <ChatInterface
      userId={userId}
      userName={userName}
      userType={participantType as any}
      expertMode={expertMode}
      onClose={onClose}
      className={className}
    />
  );
}