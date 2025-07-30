import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  emoji: text("emoji").notNull().default("🔥"),
  targetType: text("target_type").$type<"specific_days" | "days_per_week">().notNull().default("specific_days"),
  targetDays: jsonb("target_days").$type<string[]>().notNull().default(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
  targetCount: integer("target_count").default(6),
  weeklyProgress: jsonb("weekly_progress").$type<{
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  }>().notNull().default({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  }),
  currentStreak: integer("current_streak").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  isImportant: boolean("is_important").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPersonSchema = createInsertSchema(people).pick({
  name: true,
  goal: true,
  emoji: true,
  targetType: true,
  targetDays: true,
  targetCount: true,
}).extend({
  targetType: z.enum(["specific_days", "days_per_week"]),
  targetCount: z.number().min(1).max(6).optional(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  author: true,
  isImportant: true,
});

export const updateProgressSchema = z.object({
  personId: z.number(),
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
  completed: z.boolean(),
});

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;
export type UpdateProgress = z.infer<typeof updateProgressSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
