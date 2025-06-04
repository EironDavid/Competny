import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  fosterApplications: many(fosterApplications),
  reviews: many(reviews),
}));

// Pet model
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  type: text("type", { enum: ["dog", "cat", "other"] }).notNull(),
  age: integer("age").notNull(),
  gender: text("gender", { enum: ["male", "female"] }).notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  status: text("status", { enum: ["available", "fostered", "adopted"] }).notNull().default("available"),
  shelter_id: integer("shelter_id"),
  traits: json("traits").notNull().$type<string[]>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const petsRelations = relations(pets, ({ many }) => ({
  fosterApplications: many(fosterApplications),
  trackingData: many(trackingData),
  reviews: many(reviews),
}));

// Foster applications model
export const fosterApplications = pgTable("foster_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pet_id: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  scheduled_visit: timestamp("scheduled_visit"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const fosterApplicationsRelations = relations(fosterApplications, ({ one }) => ({
  user: one(users, {
    fields: [fosterApplications.user_id],
    references: [users.id],
  }),
  pet: one(pets, {
    fields: [fosterApplications.pet_id],
    references: [pets.id],
  }),
}));

// Pet tracking data model
export const trackingData = pgTable("tracking_data", {
  id: serial("id").primaryKey(),
  pet_id: integer("pet_id").references(() => pets.id, { onDelete: "cascade" }).notNull(),
  location: text("location"),
  health_status: text("health_status"),
  activity_level: text("activity_level"), // low, moderate, high
  phone_coordinates: text("phone_coordinates"), // GPS coordinates from phone
  tracking_method: text("tracking_method").default("phone"), // phone, device, manual
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Emergency contacts model
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  relationship: text("relationship").notNull(),
  is_primary: boolean("is_primary").default(false),
});

// Pet care resources model
export const petCareResources = pgTable("pet_care_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", { enum: ["article", "tutorial", "first-aid"] }).notNull(),
  tags: json("tags").$type<string[]>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const trackingDataRelations = relations(trackingData, ({ one }) => ({
  pet: one(pets, {
    fields: [trackingData.pet_id],
    references: [pets.id],
  }),
}));

// Notifications model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  seen: boolean("seen").notNull().default(false),
  type: text("type", { enum: ["application", "tracking", "system"] }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pet_id: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  approved: boolean("approved").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
  pet: one(pets, {
    fields: [reviews.pet_id],
    references: [pets.id],
  }),
}));

// CMS Pages model
export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Security logs model
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  user_id: integer("user_id").references(() => users.id),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ip_address: text("ip_address"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertPetSchema = createInsertSchema(pets);

export const insertFosterApplicationSchema = createInsertSchema(fosterApplications);

export const insertTrackingDataSchema = z.object({
  pet_id: z.number(),
  location: z.string().optional(),
  health_status: z.string().optional(),
  activity_level: z.string().optional(),
  phone_coordinates: z.string().optional(),
  tracking_method: z.string().optional(),
  notes: z.string().optional(),
});

export const insertNotificationSchema = createInsertSchema(notifications);

export const insertReviewSchema = createInsertSchema(reviews);

export const insertCmsPageSchema = createInsertSchema(cmsPages);

export const insertSecurityLogSchema = createInsertSchema(securityLogs);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export type InsertFosterApplication = z.infer<typeof insertFosterApplicationSchema>;
export type FosterApplication = typeof fosterApplications.$inferSelect;

export type InsertTrackingData = z.infer<typeof insertTrackingDataSchema>;
export type TrackingData = typeof trackingData.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;

export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;