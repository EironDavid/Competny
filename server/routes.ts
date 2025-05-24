import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "./db";
import { 
  insertPetSchema, 
  insertFosterApplicationSchema, 
  insertReviewSchema, 
  insertCmsPageSchema, 
  insertTrackingDataSchema,
  insertNotificationSchema 
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // ==== User Routes ====

  // Get all pets with optional filters
  app.get("/api/pets", async (req: Request, res: Response) => {
    try {
      const pets = await storage.getAllPets({
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        breed: req.query.breed as string | undefined
      });
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  // Get a specific pet by ID
  app.get("/api/pets/:id", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const pet = await storage.getPetById(petId);

      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }

      res.json(pet);
    } catch (error) {
      console.error("Error fetching pet:", error);
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  // Submit a fostering application
  app.post("/api/foster-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertFosterApplicationSchema.parse({
        ...req.body,
        user_id: req.user.id
      });

      const application = await storage.createFosterApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating foster application:", error);
      res.status(400).json({ message: "Invalid foster application data" });
    }
  });

  // Get user's applications
  app.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const applications = await storage.getUserApplications(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get application details
  app.get("/api/foster-applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Make sure the user has access to this application
      if (req.user.role !== "admin" && application.user_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Get tracking data for a pet
  app.get("/api/pet-tracking/:petId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const petId = parseInt(req.params.petId);
      const trackingData = await storage.getPetTrackingData(petId);
      res.json(trackingData);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/mark-seen", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsSeen(notificationId, req.user.id);
      res.json(notification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Submit a review for a pet
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        user_id: req.user.id
      });

      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Get CMS pages
  app.get("/api/cms-pages/:slug", async (req, res) => {
    try {
      const page = await storage.getCmsPageBySlug(req.params.slug);

      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error fetching CMS page:", error);
      res.status(500).json({ message: "Failed to fetch CMS page" });
    }
  });

  // ==== Admin Routes ====

  // Add a new pet
  app.post("/api/admin/pets", async (req, res) => {
    try {
      const validatedData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(validatedData);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  // Update a pet
  app.patch("/api/admin/pets/:id", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const pet = await storage.updatePet(petId, req.body);

      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }

      res.json(pet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  // Delete a pet
  app.delete("/api/admin/pets/:id", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      await storage.deletePet(petId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pet:", error);
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update a user (admin only)
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.updateUser(userId, req.body);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Get all foster applications (admin only)
  app.get("/api/admin/foster-applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Update application status (admin only)
  app.patch("/api/admin/foster-applications/:id", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.updateApplicationStatus(
        applicationId, 
        req.body.status, 
        req.body.notes,
        req.body.scheduled_visit
      );

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Create notification for user
      if (req.body.status) {
        await storage.createNotification({
          user_id: application.user_id,
          message: `Your application for fostering has been ${req.body.status}`,
          type: "application",
          seen: false
        });
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  // Add tracking data for a pet
  app.post("/api/admin/pet-tracking", async (req, res) => {
    try {
      const validatedData = insertTrackingDataSchema.parse(req.body);
      const trackingData = await storage.addTrackingData(validatedData);

      // Notify the foster parent
      const application = await storage.getApprovedApplicationForPet(validatedData.pet_id);
      if (application) {
        await storage.createNotification({
          user_id: application.user_id,
          message: `New tracking data available for your fostered pet`,
          type: "tracking",
          seen: false
        });
      }

      res.status(201).json(trackingData);
    } catch (error) {
      console.error("Error adding tracking data:", error);
      res.status(400).json({ message: "Invalid tracking data" });
    }
  });

  // Create or update CMS page
  app.post("/api/admin/cms-pages", async (req, res) => {
    try {
      const validatedData = insertCmsPageSchema.parse(req.body);
      const page = await storage.createOrUpdateCmsPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating/updating CMS page:", error);
      res.status(400).json({ message: "Invalid CMS page data" });
    }
  });

  // Get all reviews (admin only)
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Approve or reject a review (admin only)
  app.patch("/api/admin/reviews/:id/moderate", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const approved = req.body.approved === true;

      if (approved) {
        // Approve the review
        const review = await storage.approveReview(reviewId);
        res.json(review);
      } else {
        // Delete the review
        await storage.deleteReview(reviewId);
        res.status(204).send();
      }
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  // Get user reviews
  app.get("/api/user-reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const reviews = await storage.getUserReviews(req.user.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get security logs (admin only)
  app.get("/api/admin/security-logs", async (req, res) => {
    try {
      const logs = await storage.getSecurityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching security logs:", error);
      res.status(500).json({ message: "Failed to fetch security logs" });
    }
  });

  // Create a security log entry
  app.post("/api/admin/security-logs", async (req, res) => {
    try {
      const log = await storage.createSecurityLog({
        action: req.body.action,
        user_id: req.user?.id,
        details: req.body.details,
        ip_address: req.ip
      });
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating security log:", error);
      res.status(400).json({ message: "Invalid security log data" });
    }
  });

  // Get admin dashboard statistics
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}