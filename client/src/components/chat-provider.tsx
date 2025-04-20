import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from './chat-interface'; // Original WebSocket version
import ChatInterfaceFirestore from './chat-interface-firestore'; // New Firestore version
import useFirestoreChat, { ParticipantType } from '@/hooks/use-firestore-chat-fixed';

// Configuration to control which chat implementation to use
const USE_FIRESTORE = true; // Set to true to use Firestore, false to use WebSockets

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
  const mapUserType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buyer': return ParticipantType.BUYER;
      case 'seller': return ParticipantType.SELLER;
      case 'expert': return ParticipantType.EXPERT;
      case 'customer_service': return ParticipantType.CUSTOMER_SERVICE;
      default: return ParticipantType.BUYER;
    }
  };
  
  const participantType = mapUserType(userType);

  // Show a notification once when switching to Firestore
  useEffect(() => {
    if (USE_FIRESTORE) {
      toast({
        title: "Using Firestore Chat",
        description: "This chat is now powered by Firebase Firestore for better real-time performance",
        duration: 3000
      });
    }
  }, [toast]);

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
      userType={participantType}
      expertMode={expertMode}
      onClose={onClose}
      className={className}
    />
  );
}