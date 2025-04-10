import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { storage } from './storage';

// Message types
export enum MessageType {
  CHAT = 'chat',
  SYSTEM = 'system',
  JOIN = 'join',
  LEAVE = 'leave'
}

// Chat participant types
export enum ParticipantType {
  BUYER = 'buyer',
  SELLER = 'seller',
  EXPERT = 'expert',
  CUSTOMER_SERVICE = 'customer_service'
}

// Message data structure
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderType: ParticipantType;
  content: string;
  type: MessageType;
  timestamp: string; // ISO string
  isRead: boolean;
}

// Client data structure
interface ConnectedClient {
  ws: WebSocket;
  userId: number;
  userName: string;
  userType: ParticipantType;
  conversations: string[]; // List of conversation IDs the client is part of
}

// In-memory store of connected clients
const connectedClients: ConnectedClient[] = [];

// Initialize WebSocket server
export function initializeChat(httpServer: HTTPServer) {
  console.log('[chat-service] Initializing chat service');
  
  // Create WebSocket server on a different path than Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
  });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('[chat-service] New client connected');
    
    // Initial connection doesn't register user until auth message is sent
    let client: ConnectedClient | null = null;
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication message first
        if (data.type === 'auth') {
          console.log(`[chat-service] Client authenticated: ${data.userId}, ${data.userName}`);
          client = {
            ws,
            userId: data.userId,
            userName: data.userName,
            userType: data.userType,
            conversations: data.conversations || []
          };
          
          // Add client to connected clients
          connectedClients.push(client);
          
          // Notify client of successful connection
          sendToClient(ws, {
            type: 'system',
            content: 'Connected to chat server'
          });
          
          // Send unread messages for this user
          const unreadMessages = await storage.getChatUnreadMessages(data.userId);
          if (unreadMessages && unreadMessages.length > 0) {
            sendToClient(ws, {
              type: 'unread_messages',
              conversations: unreadMessages
            });
          }
          
          return;
        }
        
        // Ensure client is authenticated
        if (!client) {
          sendToClient(ws, {
            type: 'error',
            content: 'Authentication required'
          });
          return;
        }
        
        // Handle different message types
        switch(data.type) {
          case 'chat_message':
            await handleChatMessage(client, data);
            break;
            
          case 'join_conversation':
            joinConversation(client, data.conversationId);
            break;
            
          case 'leave_conversation':
            leaveConversation(client, data.conversationId);
            break;
            
          case 'read_messages':
            await markMessagesAsRead(client, data.conversationId);
            break;
            
          default:
            console.log(`[chat-service] Unknown message type: ${data.type}`);
        }
      } catch (err) {
        console.error('[chat-service] Error processing message:', err);
        sendToClient(ws, {
          type: 'error',
          content: 'Error processing message'
        });
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      if (client) {
        console.log(`[chat-service] Client disconnected: ${client.userId}`);
        
        // Remove client from connected clients
        const index = connectedClients.findIndex(c => c.userId === client?.userId);
        if (index !== -1) {
          connectedClients.splice(index, 1);
        }
      } else {
        console.log('[chat-service] Unknown client disconnected');
      }
    });
  });
  
  console.log('[chat-service] Chat service initialized');
  return wss;
}

// Helper function to send messages to a client
function sendToClient(ws: WebSocket, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Helper function to handle chat messages
async function handleChatMessage(sender: ConnectedClient, data: any) {
  const { conversationId, content } = data;
  
  // Create message object
  const message: Omit<ChatMessage, 'id'> = {
    conversationId,
    senderId: sender.userId,
    senderName: sender.userName,
    senderType: sender.userType,
    content,
    type: MessageType.CHAT,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  // Store message in database
  const savedMessage = await storage.saveChatMessage(message);
  
  // Broadcast to all connected clients in the conversation
  broadcastToConversation(conversationId, {
    type: 'new_message',
    message: savedMessage
  }, sender.userId);
}

// Helper function to join a conversation
function joinConversation(client: ConnectedClient, conversationId: string) {
  if (!client.conversations.includes(conversationId)) {
    client.conversations.push(conversationId);
    
    // Notify other participants
    broadcastToConversation(conversationId, {
      type: 'user_joined',
      conversationId,
      userId: client.userId,
      userName: client.userName,
      userType: client.userType
    });
  }
}

// Helper function to leave a conversation
function leaveConversation(client: ConnectedClient, conversationId: string) {
  const index = client.conversations.indexOf(conversationId);
  if (index !== -1) {
    client.conversations.splice(index, 1);
    
    // Notify other participants
    broadcastToConversation(conversationId, {
      type: 'user_left',
      conversationId,
      userId: client.userId,
      userName: client.userName
    });
  }
}

// Helper function to mark messages as read
async function markMessagesAsRead(client: ConnectedClient, conversationId: string) {
  // Update messages in database
  await storage.markChatMessagesAsRead(conversationId, client.userId);
  
  // Broadcast status update to conversation participants
  broadcastToConversation(conversationId, {
    type: 'messages_read',
    conversationId,
    userId: client.userId
  });
}

// Helper function to broadcast to all clients in a conversation
function broadcastToConversation(conversationId: string, data: any, excludeUserId?: number) {
  for (const client of connectedClients) {
    if (client.conversations.includes(conversationId) && 
        (!excludeUserId || client.userId !== excludeUserId)) {
      sendToClient(client.ws, data);
    }
  }
}

// Add a function to get active users
export function getActiveUsers() {
  return connectedClients.map(client => ({
    userId: client.userId,
    userName: client.userName,
    userType: client.userType
  }));
}

// Add a function to send a direct message to a specific user
export function sendDirectMessage(userId: number, data: any) {
  const client = connectedClients.find(c => c.userId === userId);
  if (client) {
    sendToClient(client.ws, data);
    return true;
  }
  return false;
}