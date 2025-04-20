import express from 'express';
import { 
  getUserConversations, 
  getConversationMessages, 
  markMessagesAsRead, 
  sendMessage, 
  createConversation, 
  initializeChatCollections,
  migrateExistingChatData
} from '../firestore-chat-service';

const router = express.Router();

// Initialize Firestore Collections
initializeChatCollections()
  .then(() => {
    console.log('[chat-firestore-routes] Firestore collections initialized successfully');
    // Don't automatically migrate data - we'll do that via an admin endpoint
  })
  .catch(error => {
    console.error('[chat-firestore-routes] Error initializing Firestore collections:', error);
  });

// GET user conversations
router.get('/conversations', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const conversations = await getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    console.error('[chat-firestore-routes] Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// GET conversation messages
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    
    const messages = await getConversationMessages(conversationId);
    res.json(messages);
  } catch (error) {
    console.error('[chat-firestore-routes] Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST mark messages as read
router.post('/read/:conversationId', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const { userId } = req.body;
    
    if (isNaN(conversationId) || !userId) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const success = await markMessagesAsRead(conversationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  } catch (error) {
    console.error('[chat-firestore-routes] Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// POST create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { title, type, participants, metadata } = req.body;
    
    if (!title || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const conversation = await createConversation(title, type, participants, metadata);
    
    if (conversation) {
      res.status(201).json(conversation);
    } else {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  } catch (error) {
    console.error('[chat-firestore-routes] Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// POST send a message
router.post('/messages', async (req, res) => {
  try {
    const { conversationId, senderId, senderName, senderType, content, type, metadata } = req.body;
    
    if (!conversationId || !senderId || !senderName || !content) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const message = await sendMessage(
      conversationId, 
      senderId, 
      senderName, 
      senderType, 
      content, 
      type, 
      metadata
    );
    
    if (message) {
      res.status(201).json(message);
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('[chat-firestore-routes] Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST admin endpoint to migrate data
router.post('/admin/migrate', async (req, res) => {
  try {
    // This would typically require admin authentication
    // For simplicity, we're not implementing that here
    
    const success = await migrateExistingChatData();
    
    if (success) {
      res.json({ success: true, message: 'Migration completed successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Migration failed' });
    }
  } catch (error) {
    console.error('[chat-firestore-routes] Migration error:', error);
    res.status(500).json({ success: false, error: 'Migration failed' });
  }
});

export default router;