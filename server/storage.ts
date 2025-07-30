import { people, announcements, type Person, type InsertPerson, type UpdateProgress, type Announcement, type InsertAnnouncement } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPeople(): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updateProgress(update: UpdateProgress): Promise<Person>;
  deletePerson(id: number): Promise<void>;
  updatePerson(id: number, updates: Partial<Person>): Promise<Person>;
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPeople(): Promise<Person[]> {
    return await db.select().from(people).orderBy(people.id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const personData = {
      ...insertPerson,
      targetType: insertPerson.targetType || "specific_days",
      targetCount: insertPerson.targetCount || 6,
      targetDays: Array.isArray(insertPerson.targetDays) ? insertPerson.targetDays : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    };
    
    const [person] = await db
      .insert(people)
      .values(personData)
      .returning();
    return person;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(insertAnnouncement)
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    if (result.rowCount === 0) {
      throw new Error("Announcement not found");
    }
  }

  async updateProgress(update: UpdateProgress): Promise<Person> {
    const [person] = await db.select().from(people).where(eq(people.id, update.personId));
    if (!person) {
      throw new Error("Person not found");
    }

    const updatedProgress = {
      ...person.weeklyProgress,
      [update.day]: update.completed,
    };

    // Calculate current streak
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    let streak = 0;
    for (const day of days) {
      if (updatedProgress[day as keyof typeof updatedProgress]) {
        streak++;
      } else {
        break;
      }
    }

    const [updatedPerson] = await db
      .update(people)
      .set({
        weeklyProgress: updatedProgress,
        currentStreak: streak,
        updatedAt: new Date(),
      })
      .where(eq(people.id, update.personId))
      .returning();

    return updatedPerson;
  }

  async deletePerson(id: number): Promise<void> {
    const result = await db.delete(people).where(eq(people.id, id));
    if (result.rowCount === 0) {
      throw new Error("Person not found");
    }
  }

  async updatePerson(id: number, updates: Partial<Person>): Promise<Person> {
    const [updatedPerson] = await db
      .update(people)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(people.id, id))
      .returning();

    if (!updatedPerson) {
      throw new Error("Person not found");
    }

    return updatedPerson;
  }
}

export class MemStorage implements IStorage {
  private people: Map<number, Person>;
  private announcements: Map<number, Announcement>;
  private currentPersonId: number;
  private currentAnnouncementId: number;

  constructor() {
    this.people = new Map();
    this.announcements = new Map();
    this.currentPersonId = 1;
    this.currentAnnouncementId = 1;
  }

  async getPeople(): Promise<Person[]> {
    return Array.from(this.people.values()).sort((a, b) => a.id - b.id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = this.currentPersonId++;
    const now = new Date();
    const person: Person = {
      ...insertPerson,
      id,
      targetType: insertPerson.targetType || "specific_days",
      targetDays: Array.isArray(insertPerson.targetDays) ? insertPerson.targetDays : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      targetCount: insertPerson.targetCount || 6,
      weeklyProgress: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
      },
      currentStreak: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.people.set(id, person);
    return person;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const now = new Date();
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      isImportant: insertAnnouncement.isImportant || false,
      createdAt: now,
      updatedAt: now,
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    if (!this.announcements.has(id)) {
      throw new Error("Announcement not found");
    }
    this.announcements.delete(id);
  }

  async updateProgress(update: UpdateProgress): Promise<Person> {
    const person = this.people.get(update.personId);
    if (!person) {
      throw new Error("Person not found");
    }

    const updatedProgress = {
      ...person.weeklyProgress,
      [update.day]: update.completed,
    };

    // Calculate current streak
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    let streak = 0;
    for (const day of days) {
      if (updatedProgress[day as keyof typeof updatedProgress]) {
        streak++;
      } else {
        break;
      }
    }

    const updatedPerson: Person = {
      ...person,
      weeklyProgress: updatedProgress,
      currentStreak: streak,
      updatedAt: new Date(),
    };

    this.people.set(update.personId, updatedPerson);
    return updatedPerson;
  }

  async deletePerson(id: number): Promise<void> {
    if (!this.people.has(id)) {
      throw new Error("Person not found");
    }
    this.people.delete(id);
  }

  async updatePerson(id: number, updates: Partial<Person>): Promise<Person> {
    const person = this.people.get(id);
    if (!person) {
      throw new Error("Person not found");
    }

    const updatedPerson: Person = {
      ...person,
      ...updates,
      updatedAt: new Date(),
    };

    this.people.set(id, updatedPerson);
    return updatedPerson;
  }
}

export const storage = new DatabaseStorage();
