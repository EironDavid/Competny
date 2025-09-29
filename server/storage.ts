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
import type { Store } from "express-session";

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

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
  getUserReviews(userId: number): Promise<Review[]>;

  // CMS operations
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  createOrUpdateCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  getAllCmsPages(): Promise<CmsPage[]>;
  deleteCmsPage(id: number): Promise<void>;

  // Security log operations
  createSecurityLog(log: Partial<InsertSecurityLog>): Promise<SecurityLog>;
  getSecurityLogs(): Promise<SecurityLog[]>;

  // Dashboard statistics
  getAdminDashboardStats(): Promise<any>;

  // Session store
  sessionStore: Store;

  // Report Data
  getApplicationReportData(): Promise<any>;
  getPetReportData(): Promise<any>;
  getUserReportData(): Promise<any>;
  generateExcelReport(data: any[], reportType: string): Promise<Buffer>;

  // New methods
  getUserReviews(userId: number): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor(sessionStore: Store) {
    this.sessionStore = sessionStore;
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

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Pet operations
  async getAllPets(filters?: { type?: string; status?: string; breed?: string }): Promise<Pet[]> {
    const conditions = [];
    
    if (filters) {
      if (filters.type) {
        conditions.push(eq(pets.type, filters.type as "dog" | "cat" | "other"));
      }
      if (filters.status) {
        conditions.push(eq(pets.status, filters.status as "available" | "fostered" | "adopted"));
      }
      if (filters.breed) {
        conditions.push(eq(pets.breed, filters.breed));
      }
    }
    
    return await db.select().from(pets).where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  async getPetById(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async createPet(petData: InsertPet): Promise<Pet> {
    // Ensure traits is always a string[]
    const traits: string[] = Array.isArray(petData.traits)
      ? petData.traits.map(String)
      : typeof petData.traits === 'string'
        ? [petData.traits]
        : [];
    const result = await db.insert(pets).values({
      ...petData,
      traits,
      created_at: new Date(),
    }).returning();
    return result[0];
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

  async updateApplicationStatus(
    id: number,
    status: "pending" | "approved" | "rejected",
    notes?: string,
    scheduled_visit?: Date
  ): Promise<FosterApplication | undefined> {
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
        notes: trackingData.notes,
        location: trackingData.location,
        health_status: trackingData.health_status,
        activity_level: trackingData.activity_level,
        phone_coordinates: trackingData.phone_coordinates,
        tracking_method: trackingData.tracking_method,
        timestamp: trackingData.timestamp,
      })
      .from(trackingData)
      .where(eq(trackingData.pet_id, petId))
      .orderBy(desc(trackingData.timestamp)) as unknown as TrackingData[];
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

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId))
      .orderBy(desc(reviews.created_at));
  }

  // CMS operations
  async getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
    const result = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.slug, slug));
    return result[0];
  }

  async createOrUpdateCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const existingPage = await this.getCmsPageBySlug(page.slug);
    if (existingPage) {
      const result = await db
        .update(cmsPages)
        .set({
          ...page,
          updated_at: new Date(),
        })
        .where(eq(cmsPages.slug, page.slug))
        .returning();
      return result[0];
    }
    const result = await db
      .insert(cmsPages)
      .values({
        ...page,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    return result[0];
  }

  async getAllCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(cmsPages.created_at);
  }

  async deleteCmsPage(id: number): Promise<void> {
    await db.delete(cmsPages).where(eq(cmsPages.id, id));
  }

  // Security log operations
  async getSecurityLogs() {
    return await db.select().from(securityLogs).orderBy(desc(securityLogs.timestamp));
  }

  // Create security log
  async createSecurityLog(data: any) {
    const [log] = await db.insert(securityLogs).values({
      ...data,
      created_at: new Date().toISOString()
    }).returning();
    return log;
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

  async getAdoptionReportData() {
    const adoptions = await db
      .select({
        petName: pets.name,
        petType: pets.type,
        petBreed: pets.breed,
        userName: users.name,
        userEmail: users.email,
        applicationDate: fosterApplications.created_at,
        approvalDate: fosterApplications.scheduled_visit,
        status: fosterApplications.status
      })
      .from(fosterApplications)
      .innerJoin(pets, eq(fosterApplications.pet_id, pets.id))
      .innerJoin(users, eq(fosterApplications.user_id, users.id))
      .where(eq(fosterApplications.status, "approved"))
      .orderBy(desc(fosterApplications.created_at));

    return adoptions;
  }

  async getApplicationReportData() {
    const applications = await db
      .select({
        applicationId: fosterApplications.id,
        petName: pets.name,
        petType: pets.type,
        petBreed: pets.breed,
        userName: users.name,
        userEmail: users.email,
        applicationDate: fosterApplications.created_at,
        status: fosterApplications.status,
        scheduledVisit: fosterApplications.scheduled_visit,
        notes: fosterApplications.notes
      })
      .from(fosterApplications)
      .innerJoin(pets, eq(fosterApplications.pet_id, pets.id))
      .innerJoin(users, eq(fosterApplications.user_id, users.id))
      .orderBy(desc(fosterApplications.created_at));

    return applications;
  }

  async getPetReportData() {
    const pets_data = await db
      .select({
        id: pets.id,
        name: pets.name,
        breed: pets.breed,
        type: pets.type,
        age: pets.age,
        gender: pets.gender,
        status: pets.status,
        created_at: pets.created_at
      })
      .from(pets)
      .orderBy(desc(pets.created_at));

    return pets_data;
  }

  async getUserReportData() {
    const users_data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        created_at: users.created_at
      })
      .from(users)
      .orderBy(desc(users.created_at));

    return users_data;
  }

  async generateExcelReport(data: any[], reportType: string) {
    const XLSX = await import('xlsx');
    let worksheetData: any[] = [];
    let sheetName = 'Report';
    switch (reportType) {
      case 'adoption':
        worksheetData = data.map(item => ({
          'Pet Name': item.petName,
          'Pet Type': item.petType,
          'Pet Breed': item.petBreed,
          'Adopter Name': item.userName,
          'Adopter Email': item.userEmail,
          'Application Date': new Date(item.applicationDate).toLocaleDateString(),
          'Approval Date': item.approvalDate ? new Date(item.approvalDate).toLocaleDateString() : 'N/A',
          'Status': item.status
        }));
        sheetName = 'Adoption Report';
        break;
      case 'applications':
        worksheetData = data.map(item => ({
          'Application ID': item.applicationId,
          'Pet Name': item.petName,
          'Pet Type': item.petType,
          'Pet Breed': item.petBreed,
          'Applicant Name': item.userName,
          'Applicant Email': item.userEmail,
          'Application Date': new Date(item.applicationDate).toLocaleDateString(),
          'Status': item.status,
          'Scheduled Visit': item.scheduledVisit ? new Date(item.scheduledVisit).toLocaleDateString() : 'N/A',
          'Notes': item.notes || ''
        }));
        sheetName = 'Application Report';
        break;
      case 'pets':
        worksheetData = data.map(item => ({
          'Pet ID': item.id,
          'Name': item.name,
          'Breed': item.breed,
          'Type': item.type,
          'Age': item.age,
          'Gender': item.gender,
          'Status': item.status,
          'Added Date': new Date(item.created_at).toLocaleDateString()
        }));
        sheetName = 'Pet Report';
        break;
      case 'users':
        worksheetData = data.map(item => ({
          'User ID': item.id,
          'Name': item.name,
          'Email': item.email,
          'Username': item.username,
          'Role': item.role,
          'Registration Date': new Date(item.created_at).toLocaleDateString()
        }));
        sheetName = 'User Report';
        break;
    }
    const worksheet = (XLSX as any).utils.json_to_sheet(worksheetData);
    const workbook = (XLSX as any).utils.book_new();
    (XLSX as any).utils.book_append_sheet(workbook, worksheet, sheetName);
    return (XLSX as any).write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const storage = new DatabaseStorage(new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
}));