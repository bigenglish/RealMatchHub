import { 
  communicationLogs, 
  propertyShowings, 
  propertyOffers, 
  propertyDocuments, 
  transactionProgress, 
  valuationTimeSlots,
  type CommunicationLog,
  type PropertyShowing,
  type PropertyOffer,
  type PropertyDocument,
  type TransactionProgress,
  type ValuationTimeSlot,
  type InsertCommunicationLog,
  type InsertPropertyShowing,
  type InsertPropertyOffer,
  type InsertPropertyDocument,
  type InsertTransactionProgress,
  type InsertValuationTimeSlot,
} from "@shared/schema";
import { db } from "./db";
import { and, desc, eq } from "drizzle-orm";
import crypto from "crypto";

// Helper function to generate unique IDs for entities
function generateUniqueId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export class CommunicationService {
  
  // === Communication Logs (Messages) ===
  
  async getCommunicationLogs(propertyId: string, userId: string): Promise<CommunicationLog[]> {
    try {
      const logs = await db
        .select()
        .from(communicationLogs)
        .where(
          and(
            eq(communicationLogs.propertyId, propertyId),
            eq(communicationLogs.userId, userId)
          )
        )
        .orderBy(desc(communicationLogs.timestamp));
      
      return logs;
    } catch (error) {
      console.error("[communication-service] Error getting communication logs:", error);
      throw error;
    }
  }
  
  async addCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    try {
      const [newLog] = await db
        .insert(communicationLogs)
        .values(log)
        .returning();
      
      return newLog;
    } catch (error) {
      console.error("[communication-service] Error adding communication log:", error);
      throw error;
    }
  }
  
  async markCommunicationLogsAsRead(propertyId: string, userId: string, senderId: string): Promise<void> {
    try {
      await db
        .update(communicationLogs)
        .set({ isRead: true })
        .where(
          and(
            eq(communicationLogs.propertyId, propertyId),
            eq(communicationLogs.userId, userId),
            eq(communicationLogs.senderId, senderId),
            eq(communicationLogs.isRead, false)
          )
        );
    } catch (error) {
      console.error("[communication-service] Error marking communication logs as read:", error);
      throw error;
    }
  }
  
  // === Property Showings ===
  
  async getPropertyShowings(propertyId: string, userId: string): Promise<{
    upcoming: PropertyShowing[];
    past: PropertyShowing[];
  }> {
    try {
      const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
      
      const allShowings = await db
        .select()
        .from(propertyShowings)
        .where(
          and(
            eq(propertyShowings.propertyId, propertyId),
            eq(propertyShowings.userId, userId)
          )
        );
      
      // Split showings into upcoming and past
      const upcoming = allShowings.filter(
        showing => showing.date >= today || showing.status === 'Scheduled'
      );
      
      const past = allShowings.filter(
        showing => showing.date < today && showing.status !== 'Scheduled'
      );
      
      return { upcoming, past };
    } catch (error) {
      console.error("[communication-service] Error getting property showings:", error);
      throw error;
    }
  }
  
  async createPropertyShowing(showing: Omit<InsertPropertyShowing, "showingId">): Promise<PropertyShowing> {
    try {
      const showingId = generateUniqueId("show");
      
      const [newShowing] = await db
        .insert(propertyShowings)
        .values({
          ...showing,
          showingId
        })
        .returning();
      
      return newShowing;
    } catch (error) {
      console.error("[communication-service] Error creating property showing:", error);
      throw error;
    }
  }
  
  async updatePropertyShowingStatus(
    showingId: string, 
    status: string, 
    feedback?: string
  ): Promise<PropertyShowing> {
    try {
      const updateData: Partial<PropertyShowing> = { status };
      
      if (feedback) {
        updateData.feedback = feedback;
      }
      
      const [updatedShowing] = await db
        .update(propertyShowings)
        .set(updateData)
        .where(eq(propertyShowings.showingId, showingId))
        .returning();
      
      if (!updatedShowing) {
        throw new Error(`Showing with ID ${showingId} not found`);
      }
      
      return updatedShowing;
    } catch (error) {
      console.error("[communication-service] Error updating property showing status:", error);
      throw error;
    }
  }
  
  // === Property Offers ===
  
  async getPropertyOffers(propertyId: string, userId: string): Promise<PropertyOffer[]> {
    try {
      const offers = await db
        .select()
        .from(propertyOffers)
        .where(
          and(
            eq(propertyOffers.propertyId, propertyId),
            eq(propertyOffers.userId, userId)
          )
        )
        .orderBy(desc(propertyOffers.submissionDate));
      
      return offers;
    } catch (error) {
      console.error("[communication-service] Error getting property offers:", error);
      throw error;
    }
  }
  
  async createPropertyOffer(offer: Omit<InsertPropertyOffer, "offerId">): Promise<PropertyOffer> {
    try {
      const offerId = generateUniqueId("offer");
      
      const [newOffer] = await db
        .insert(propertyOffers)
        .values({
          ...offer,
          offerId
        })
        .returning();
      
      return newOffer;
    } catch (error) {
      console.error("[communication-service] Error creating property offer:", error);
      throw error;
    }
  }
  
  async updatePropertyOfferStatus(
    offerId: string, 
    status: string,
    expertReviewSummary?: string
  ): Promise<PropertyOffer> {
    try {
      const updateData: Partial<PropertyOffer> = { status };
      
      if (expertReviewSummary) {
        updateData.expertReviewSummary = expertReviewSummary;
      }
      
      const [updatedOffer] = await db
        .update(propertyOffers)
        .set(updateData)
        .where(eq(propertyOffers.offerId, offerId))
        .returning();
      
      if (!updatedOffer) {
        throw new Error(`Offer with ID ${offerId} not found`);
      }
      
      return updatedOffer;
    } catch (error) {
      console.error("[communication-service] Error updating property offer status:", error);
      throw error;
    }
  }
  
  // === Property Documents ===
  
  async getPropertyDocuments(propertyId: string, userId: string): Promise<PropertyDocument[]> {
    try {
      const documents = await db
        .select()
        .from(propertyDocuments)
        .where(
          and(
            eq(propertyDocuments.propertyId, propertyId),
            eq(propertyDocuments.userId, userId),
            eq(propertyDocuments.isArchived, false)
          )
        )
        .orderBy(desc(propertyDocuments.uploadDate));
      
      return documents;
    } catch (error) {
      console.error("[communication-service] Error getting property documents:", error);
      throw error;
    }
  }
  
  async addPropertyDocument(doc: Omit<InsertPropertyDocument, "documentId">): Promise<PropertyDocument> {
    try {
      const documentId = generateUniqueId("doc");
      
      const [newDocument] = await db
        .insert(propertyDocuments)
        .values({
          ...doc,
          documentId
        })
        .returning();
      
      return newDocument;
    } catch (error) {
      console.error("[communication-service] Error adding property document:", error);
      throw error;
    }
  }
  
  async archivePropertyDocument(documentId: string): Promise<PropertyDocument> {
    try {
      const [archivedDocument] = await db
        .update(propertyDocuments)
        .set({ isArchived: true })
        .where(eq(propertyDocuments.documentId, documentId))
        .returning();
      
      if (!archivedDocument) {
        throw new Error(`Document with ID ${documentId} not found`);
      }
      
      return archivedDocument;
    } catch (error) {
      console.error("[communication-service] Error archiving property document:", error);
      throw error;
    }
  }
  
  // === Transaction Progress ===
  
  async getTransactionProgress(propertyId: string, userId: string): Promise<TransactionProgress | null> {
    try {
      const [progress] = await db
        .select()
        .from(transactionProgress)
        .where(
          and(
            eq(transactionProgress.propertyId, propertyId),
            eq(transactionProgress.userId, userId)
          )
        );
      
      return progress || null;
    } catch (error) {
      console.error("[communication-service] Error getting transaction progress:", error);
      throw error;
    }
  }
  
  async createOrUpdateTransactionProgress(
    progress: InsertTransactionProgress
  ): Promise<TransactionProgress> {
    try {
      // Check if progress entry already exists
      const existingProgress = await this.getTransactionProgress(
        progress.propertyId, 
        progress.userId
      );
      
      if (existingProgress) {
        // Update existing progress
        const [updatedProgress] = await db
          .update(transactionProgress)
          .set({
            ...progress,
            lastUpdated: new Date()
          })
          .where(
            and(
              eq(transactionProgress.propertyId, progress.propertyId),
              eq(transactionProgress.userId, progress.userId)
            )
          )
          .returning();
        
        return updatedProgress;
      } else {
        // Create new progress entry
        const [newProgress] = await db
          .insert(transactionProgress)
          .values(progress)
          .returning();
        
        return newProgress;
      }
    } catch (error) {
      console.error("[communication-service] Error creating/updating transaction progress:", error);
      throw error;
    }
  }
  
  // === Valuation Time Slots ===
  
  async getValuationTimeSlots(propertyId: string): Promise<ValuationTimeSlot[]> {
    try {
      const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
      
      const slots = await db
        .select()
        .from(valuationTimeSlots)
        .where(
          and(
            eq(valuationTimeSlots.propertyId, propertyId),
            eq(valuationTimeSlots.isBooked, false)
          )
        );
      
      // Filter out past dates
      return slots.filter(slot => slot.date >= today);
    } catch (error) {
      console.error("[communication-service] Error getting valuation time slots:", error);
      throw error;
    }
  }
  
  async createValuationTimeSlot(slot: InsertValuationTimeSlot): Promise<ValuationTimeSlot> {
    try {
      const [newSlot] = await db
        .insert(valuationTimeSlots)
        .values(slot)
        .returning();
      
      return newSlot;
    } catch (error) {
      console.error("[communication-service] Error creating valuation time slot:", error);
      throw error;
    }
  }
  
  async bookValuationTimeSlot(slotId: number, userId: string): Promise<ValuationTimeSlot> {
    try {
      const [bookedSlot] = await db
        .update(valuationTimeSlots)
        .set({ 
          isBooked: true,
          bookedBy: userId
        })
        .where(
          and(
            eq(valuationTimeSlots.id, slotId),
            eq(valuationTimeSlots.isBooked, false)
          )
        )
        .returning();
      
      if (!bookedSlot) {
        throw new Error(`Time slot with ID ${slotId} not found or already booked`);
      }
      
      return bookedSlot;
    } catch (error) {
      console.error("[communication-service] Error booking valuation time slot:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const communicationService = new CommunicationService();