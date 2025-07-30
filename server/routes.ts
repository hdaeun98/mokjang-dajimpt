import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema, updateProgressSchema, insertAnnouncementSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all people
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getPeople();
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  // Create a new person
  app.post("/api/people", async (req, res) => {
    try {
      const validationResult = insertPersonSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(validationResult.error).toString()
        });
      }

      const person = await storage.createPerson(validationResult.data);
      res.status(201).json(person);
    } catch (error) {
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // Update progress for a person
  app.patch("/api/people/progress", async (req, res) => {
    try {
      const validationResult = updateProgressSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(validationResult.error).toString()
        });
      }

      const person = await storage.updateProgress(validationResult.data);
      res.json(person);
    } catch (error) {
      if (error instanceof Error && error.message === "Person not found") {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Update person details
  app.patch("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid person ID" });
      }

      const person = await storage.updatePerson(id, req.body);
      res.json(person);
    } catch (error) {
      if (error instanceof Error && error.message === "Person not found") {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(500).json({ message: "Failed to update person" });
    }
  });

  // Delete a person
  app.delete("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid person ID" });
      }

      await storage.deletePerson(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Person not found") {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Get all announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Create a new announcement
  app.post("/api/announcements", async (req, res) => {
    try {
      const validationResult = insertAnnouncementSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: fromZodError(validationResult.error).toString()
        });
      }

      const announcement = await storage.createAnnouncement(validationResult.data);
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Delete an announcement
  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid announcement ID" });
      }

      await storage.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Announcement not found") {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
