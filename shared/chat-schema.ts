import { pgTable, text, serial, integer, boolean, jsonb, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("direct"), // direct, group, property, service
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  metadata: jsonb("metadata"), // Can store property ID, service ID, etc.
});

// Chat conversation participants
export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(), // buyer, seller, expert, customer_service
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type").notNull(), // buyer, seller, expert, customer_service
  content: text("content").notNull(),
  type: text("type").notNull().default("chat"), // chat, system, join, leave
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"), // For attachments, etc.
});

// User appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id"),
  userId: integer("user_id").notNull(),
  expertId: integer("expert_id"),
  type: text("type").notNull(), // property_tour, consultation, customer_service, etc.
  subType: text("sub_type"), // in_person, virtual, self_guided
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, canceled
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: jsonb("metadata"), // Additional details
});

// Chat conversation schema
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
});
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

// Chat participant schema
export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
});
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;

// Chat message schema
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Appointment schema
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Type for scheduling appointment
export interface AppointmentDetails {
  propertyId?: number;
  userId: number;
  expertId?: number;
  type: string;
  subType: string;
  date: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

// Type for chat conversation with participants and latest message
export interface ChatConversationWithDetails extends ChatConversation {
  participants: ChatParticipant[];
  latestMessage?: ChatMessage;
  unreadCount?: number;
}