import admin from 'firebase-admin';
import { firestore } from './firebase-admin';
import { storage } from './storage';
import type { ChatMessage, ChatConversation } from '@shared/chat-schema';

/**
 * Helper function to convert Firestore timestamps to ISO strings
 */
function formatTimestamp(timestamp: admin.firestore.Timestamp): string {
  return timestamp.toDate().toISOString();
}

/**
 * Helper function to format a chat message from Firestore to the application format
 */
function formatMessage(doc: admin.firestore.DocumentSnapshot): ChatMessage {
  const data = doc.data();
  if (!data) throw new Error('Message data not found');

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
    metadata: data.metadata || null
  };
}

/**
 * Helper function to format a conversation from Firestore to the application format
 */
function formatConversation(doc: admin.firestore.DocumentSnapshot): ChatConversation {
  const data = doc.data();
  if (!data) throw new Error('Conversation data not found');

  return {
    id: parseInt(doc.id),
    title: data.title,
    type: data.type,
    createdAt: new Date(data.createdAt.toDate()).toISOString(),
    lastMessageAt: new Date(data.lastMessageAt.toDate()).toISOString(),
    metadata: data.metadata || null,
    participants: [] // Will be populated separately
  };
}

/**
 * Initialize the Firestore collections with proper indexes
 */
export async function initializeChatCollections() {
  console.log('[firestore-chat] Initializing Firestore chat collections');

  // Check if collections exist, create them if not
  const conversationsCollection = firestore.collection('chat_conversations');
  const messagesCollection = firestore.collection('chat_messages');
  const participantsCollection = firestore.collection('chat_participants');

  // Additional setup could be done here

  console.log('[firestore-chat] Firestore chat collections initialized');
}

/**
 * Migrate existing chat data from storage to Firestore
 */
export async function migrateExistingChatData() {
  console.log('[firestore-chat] Starting migration of existing chat data to Firestore');

  try {
    // Get all conversations from the existing storage
    const conversations = await storage.getChatConversations();

    for (const conversation of conversations) {
      // Create conversation document in Firestore
      await firestore.collection('chat_conversations').doc(conversation.id.toString()).set({
        title: conversation.title,
        type: conversation.type,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(conversation.createdAt)),
        lastMessageAt: admin.firestore.Timestamp.fromDate(new Date(conversation.lastMessageAt)),
        metadata: conversation.metadata || null
      });

      // Add participants
      for (const participant of conversation.participants) {
        await firestore.collection('chat_participants').add({
          conversationId: conversation.id.toString(),
          userId: participant.userId,
          userType: participant.userType,
          joinedAt: admin.firestore.Timestamp.fromDate(new Date(participant.joinedAt)),
          lastReadAt: admin.firestore.Timestamp.fromDate(new Date(participant.lastReadAt))
        });
      }

      // Get and add messages
      const messages = await storage.getChatMessages(conversation.id);
      for (const message of messages) {
        await firestore.collection('chat_messages').add({
          conversationId: conversation.id.toString(),
          senderId: message.senderId,
          senderName: message.senderName,
          senderType: message.senderType,
          content: message.content,
          type: message.type,
          timestamp: admin.firestore.Timestamp.fromDate(new Date(message.timestamp)),
          isRead: message.isRead,
          metadata: message.metadata || null
        });
      }
    }

    console.log('[firestore-chat] Migration of existing chat data completed successfully');
    return true;
  } catch (error) {
    console.error('[firestore-chat] Error migrating chat data:', error);
    return false;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number): Promise<ChatConversation[]> {
  try {
    // Get all participant entries for this user
    const participantsSnapshot = await firestore.collection('chat_participants')
      .where('userId', '==', userId)
      .get();

    if (participantsSnapshot.empty) {
      return [];
    }

    // Extract conversation IDs
    const conversationIds = participantsSnapshot.docs.map(doc => doc.data().conversationId);

    // Get conversation details
    const conversations: ChatConversation[] = [];

    for (const conversationId of conversationIds) {
      const conversationDoc = await firestore.collection('chat_conversations').doc(conversationId).get();

      if (conversationDoc.exists) {
        if (!conversationDoc.exists) {
          throw new Error('Failed to create conversation');
        }

        const conversation = formatConversation(conversationDoc);
        // Add required properties
        conversation.participants = [];
        conversation.latestMessage = undefined;
        conversation.unreadCount = 0;

        // Get participants for this conversation
        const participantsSnapshot = await firestore.collection('chat_participants')
          .where('conversationId', '==', conversationId)
          .get();

        conversation.participants = participantsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: parseInt(doc.id),
            conversationId: parseInt(data.conversationId),
            userId: data.userId,
            userType: data.userType,
            joinedAt: formatTimestamp(data.joinedAt),
            lastReadAt: formatTimestamp(data.lastReadAt)
          };
        });

        // Get latest message
        const latestMessageSnapshot = await firestore.collection('chat_messages')
          .where('conversationId', '==', conversationId)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        if (!latestMessageSnapshot.empty) {
          conversation.latestMessage = formatMessage(latestMessageSnapshot.docs[0]);
        }

        // Count unread messages
        const unreadSnapshot = await firestore.collection('chat_messages')
          .where('conversationId', '==', conversationId)
          .where('isRead', '==', false)
          .where('senderId', '!=', userId)
          .get();

        conversation.unreadCount = unreadSnapshot.size;

        conversations.push(conversation);
      }
    }

    return conversations;
  } catch (error) {
    console.error('[firestore-chat] Error getting user conversations:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(conversationId: number): Promise<ChatMessage[]> {
  try {
    const messagesSnapshot = await firestore.collection('chat_messages')
      .where('conversationId', '==', conversationId.toString())
      .orderBy('timestamp', 'asc')
      .get();

    return messagesSnapshot.docs.map(doc => formatMessage(doc));
  } catch (error) {
    console.error('[firestore-chat] Error getting conversation messages:', error);
    throw error;
  }
}

/**
 * Mark messages as read for a user in a conversation
 */
export async function markMessagesAsRead(conversationId: number, userId: number): Promise<boolean> {
  try {
    // Get unread messages sent by others
    const messagesSnapshot = await firestore.collection('chat_messages')
      .where('conversationId', '==', conversationId.toString())
      .where('senderId', '!=', userId)
      .where('isRead', '==', false)
      .get();

    // Update each message
    const batch = firestore.batch();
    messagesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });

    // Update last read timestamp for this user
    const participantsSnapshot = await firestore.collection('chat_participants')
      .where('conversationId', '==', conversationId.toString())
      .where('userId', '==', userId)
      .get();

    if (!participantsSnapshot.empty) {
      batch.update(participantsSnapshot.docs[0].ref, { 
        lastReadAt: admin.firestore.Timestamp.now() 
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('[firestore-chat] Error marking messages as read:', error);
    return false;
  }
}

/**
 * Send a new message to a conversation
 */
export async function sendMessage(
  conversationId: number, 
  senderId: number, 
  senderName: string, 
  senderType: string, 
  content: string, 
  type: string = 'chat',
  metadata: any = null
): Promise<ChatMessage | null> {
  try {
    // Create message document
    const messageData = {
      conversationId: conversationId.toString(),
      senderId,
      senderName,
      senderType,
      content,
      type,
      timestamp: admin.firestore.Timestamp.now(),
      isRead: false,
      metadata
    };

    const messageRef = await firestore.collection('chat_messages').add(messageData);

    // Update conversation's lastMessageAt
    await firestore.collection('chat_conversations')
      .doc(conversationId.toString())
      .update({ lastMessageAt: admin.firestore.Timestamp.now() });

    // Get the created message
    const messageDoc = await messageRef.get();
    return formatMessage(messageDoc);
  } catch (error) {
    console.error('[firestore-chat] Error sending message:', error);
    return null;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(
  title: string,
  type: string = 'direct',
  participants: Array<{ userId: number, userType: string }>,
  metadata: any = null
): Promise<ChatConversation | null> {
  try {
    // Generate a numeric ID (for compatibility with existing system)
    const randomId = Date.now() + Math.floor(Math.random() * 1000);
    const conversationId = randomId.toString();

    // Create conversation document
    await firestore.collection('chat_conversations').doc(conversationId).set({
      title,
      type,
      createdAt: admin.firestore.Timestamp.now(),
      lastMessageAt: admin.firestore.Timestamp.now(),
      metadata
    });

    // Add participants
    const batch = firestore.batch();
    const now = admin.firestore.Timestamp.now();

    for (const participant of participants) {
      const participantRef = firestore.collection('chat_participants').doc();
      batch.set(participantRef, {
        conversationId,
        userId: participant.userId,
        userType: participant.userType,
        joinedAt: now,
        lastReadAt: now
      });
    }

    await batch.commit();

    // Get created conversation
    const conversationDoc = await firestore.collection('chat_conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new Error('Failed to create conversation');
    }

    const conversation = formatConversation(conversationDoc);
    // Add required properties
    conversation.participants = [];
    conversation.latestMessage = undefined;
    conversation.unreadCount = 0;

    // Get participants for this conversation
    const participantsSnapshot = await firestore.collection('chat_participants')
      .where('conversationId', '==', conversationId)
      .get();

    conversation.participants = participantsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        conversationId: parseInt(data.conversationId),
        userId: data.userId,
        userType: data.userType,
        joinedAt: formatTimestamp(data.joinedAt),
        lastReadAt: formatTimestamp(data.lastReadAt)
      };
    });

    return conversation;
  } catch (error) {
    console.error('[firestore-chat] Error creating conversation:', error);
    return null;
  }
}