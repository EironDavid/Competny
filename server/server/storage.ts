import { users, 
  pets, 
  fosterApplications, 
  trackingData, 
  notifications, 
  reviews, 
  cmsPages, 
  securityLogs,
  type User, 
  type InsertUser,
  type Pet,
  type InsertPet,
  type FosterApplication,
  type InsertFosterApplication,
  type TrackingData,
  type InsertTrackingData,
  type Notification,
  type InsertNotification,
  type Review,
  type InsertReview,
  type CmsPage,
  type InsertCmsPage,
  type SecurityLog,
  type InsertSecurityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, ne, isNull, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Pet operations
  getAllPets(filters?: { type?: string; status?: string; breed?: string }): Promise<Pet[]>;
  getPetById(id: number): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, petData: Partial<Pet>): Promise<Pet | undefined>;
  deletePet(id: number): Promise<void>;
  
  // Foster application operations
  createFosterApplication(application: InsertFosterApplication): Promise<FosterApplication>;
  getUserApplications(userId: number): Promise<FosterApplication[]>;
  getApplicationById(id: number): Promise<FosterApplication | undefined>;
  getAllApplications(): Promise<FosterApplication[]>;
  updateApplicationStatus(id: number, status: string, notes?: string, scheduled_visit?: Date): Promise<FosterApplication | undefined>;
  getApprovedApplicationForPet(petId: number): Promise<FosterApplication | undefined>;
  
  // Tracking data operations
  getPetTrackingData(petId: number): Promise<TrackingData[]>;
  addTrackingData(data: InsertTrackingData): Promise<TrackingData>;
  
  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsSeen(id: number, userId: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getAllReviews(): Promise<Review[]>;
  approveReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<void>;
  
  // CMS operations
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  createOrUpdateCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  
  // Security log operations
  createSecurityLog(log: Partial<InsertSecurityLog>): Promise<SecurityLog>;
  getSecurityLogs(): Promise<SecurityLog[]>;
  
  // Dashboard statistics
  getAdminDashboardStats(): Promise<any>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.created_at);
  }

  // Pet operations
  async getAllPets(filters?: { type?: string; status?: string; breed?: string }): Promise<Pet[]> {
    let query = db.select().from(pets);
    
    if (filters) {
      if (filters.type) {
        query = query.where(eq(pets.type, filters.type));
      }
      if (filters.status) {
        query = query.where(eq(pets.status, filters.status));
      }
      if (filters.breed) {
        query = query.where(like(pets.breed, `%${filters.breed}%`));
      }
    }
    
    return await query.orderBy(desc(pets.created_at));
  }

  async getPetById(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db
      .insert(pets)
      .values(pet)
      .returning();
    return newPet;
  }

  async updatePet(id: number, petData: Partial<Pet>): Promise<Pet | undefined> {
    const [pet] = await db
      .update(pets)
      .set(petData)
      .where(eq(pets.id, id))
      .returning();
    return pet || undefined;
  }

  async deletePet(id: number): Promise<void> {
    await db.delete(pets).where(eq(pets.id, id));
  }

  // Foster application operations
  async createFosterApplication(application: InsertFosterApplication): Promise<FosterApplication> {
    const [newApplication] = await db
      .insert(fosterApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getUserApplications(userId: number): Promise<FosterApplication[]> {
    return await db
      .select()
      .from(fosterApplications)
      .where(eq(fosterApplications.user_id, userId))
      .orderBy(desc(fosterApplications.created_at));
  }

  async getApplicationById(id: number): Promise<FosterApplication | undefined> {
    const [application] = await db
      .select()
      .from(fosterApplications)
      .where(eq(fosterApplications.id, id));
    return application || undefined;
  }

  async getAllApplications(): Promise<FosterApplication[]> {
    return await db
      .select()
      .from(fosterApplications)
      .orderBy(desc(fosterApplications.created_at));
  }

  async updateApplicationStatus(id: number, status: string, notes?: string, scheduled_visit?: Date | string): Promise<FosterApplication | undefined> {
    const updateData: Partial<FosterApplication> = { status };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    if (scheduled_visit !== undefined) {
      updateData.scheduled_visit = new Date(scheduled_visit);
    }
    
    const [application] = await db
      .update(fosterApplications)
      .set(updateData)
      .where(eq(fosterApplications.id, id))
      .returning();
    
    if (application && status === "approved") {
      // Update pet status to fostered
      await db
        .update(pets)
        .set({ status: "fostered" })
        .where(eq(pets.id, application.pet_id));
    }
    
    return application || undefined;
  }

  async getApprovedApplicationForPet(petId: number): Promise<FosterApplication | undefined> {
    const [application] = await db
      .select()
      .from(fosterApplications)
      .where(and(
        eq(fosterApplications.pet_id, petId),
        eq(fosterApplications.status, "approved")
      ));
    return application || undefined;
  }

  // Tracking data operations
  async getPetTrackingData(petId: number): Promise<TrackingData[]> {
    return await db
      .select({
        id: trackingData.id,
        pet_id: trackingData.pet_id,
        location: trackingData.location,
        health_status: trackingData.health_status,
        timestamp: trackingData.timestamp
      })
      .from(trackingData)
      .where(eq(trackingData.pet_id, petId))
      .orderBy(desc(trackingData.timestamp));
  }

  async addTrackingData(data: InsertTrackingData): Promise<TrackingData> {
    const [newTrackingData] = await db
      .insert(trackingData)
      .values(data)
      .returning();
    return newTrackingData;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at));
  }

  async markNotificationAsSeen(id: number, userId: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ seen: true })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.user_id, userId)
      ))
      .returning();
    return notification || undefined;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getAllReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.created_at));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId))
      .orderBy(desc(reviews.created_at));
  }

  async approveReview(id: number): Promise<Review | undefined> {
    try {
      const [review] = await db
        .update(reviews)
        .set({ approved: true })
        .where(eq(reviews.id, id))
        .returning();
      return review;
    } catch (error) {
      console.error("Error approving review:", error);
      return undefined;
    }
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId))
      .orderBy(desc(reviews.created_at));
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // CMS operations
  async getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.slug, slug));
    return page || undefined;
  }

  async createOrUpdateCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    // Check if the page exists
    const [existingPage] = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.slug, page.slug));
    
    if (existingPage) {
      // Update existing page
      const [updatedPage] = await db
        .update(cmsPages)
        .set({
          title: page.title,
          content: page.content,
          updated_at: new Date()
        })
        .where(eq(cmsPages.slug, page.slug))
        .returning();
      return updatedPage;
    } else {
      // Create new page
      const [newPage] = await db
        .insert(cmsPages)
        .values(page)
        .returning();
      return newPage;
    }
  }

  // Security log operations
  async createSecurityLog(log: Partial<InsertSecurityLog>): Promise<SecurityLog> {
    const [newLog] = await db
      .insert(securityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getSecurityLogs(): Promise<SecurityLog[]> {
    return await db
      .select()
      .from(securityLogs)
      .orderBy(desc(securityLogs.timestamp));
  }

  // Dashboard statistics
  async getAdminDashboardStats(): Promise<any> {
    // Get active users count
    const [{ count: activeUsersCount }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(ne(users.role, "admin"));
    
    // Get active pets count
    const [{ count: activePetsCount }] = await db
      .select({ count: sql`count(*)` })
      .from(pets);
    
    // Get approved applications count
    const [{ count: approvedApplicationsCount }] = await db
      .select({ count: sql`count(*)` })
      .from(fosterApplications)
      .where(eq(fosterApplications.status, "approved"));
    
    // Get pending applications count
    const [{ count: pendingApplicationsCount }] = await db
      .select({ count: sql`count(*)` })
      .from(fosterApplications)
      .where(eq(fosterApplications.status, "pending"));
    
    // Get recent applications
    const recentApplications = await db
      .select()
      .from(fosterApplications)
      .orderBy(desc(fosterApplications.created_at))
      .limit(10);
    
    // Get recent applications with user and pet details
    const recentApplicationsWithDetails = await Promise.all(
      recentApplications.map(async (application) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, application.user_id));
        
        const [pet] = await db
          .select()
          .from(pets)
          .where(eq(pets.id, application.pet_id));
        
        return {
          ...application,
          user,
          pet
        };
      })
    );
    
    // Get pet statistics by type
    const petStatsByType = await db
      .select({
        type: pets.type,
        count: sql`count(*)`
      })
      .from(pets)
      .groupBy(pets.type);
    
    // Get application status trends (last 7 days)
    const statusTrends = await db
      .select({
        status: fosterApplications.status,
        count: sql`count(*)`
      })
      .from(fosterApplications)
      .where(sql`created_at > now() - interval '7 days'`)
      .groupBy(fosterApplications.status);
    
    return {
      counts: {
        activeUsers: Number(activeUsersCount),
        activePets: Number(activePetsCount),
        approvedApplications: Number(approvedApplicationsCount),
        pendingApplications: Number(pendingApplicationsCount)
      },
      recentApplications: recentApplicationsWithDetails,
      petStatsByType,
      statusTrends
    };
  }
}

export const storage = new DatabaseStorage();
