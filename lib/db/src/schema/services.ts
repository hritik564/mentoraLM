import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceCategoryEnum = pgEnum("service_category", [
  "Career Counselling",
  "Interview Prep",
  "College Admissions",
  "Resume Review",
  "Other",
]);

export const serviceStatusEnum = pgEnum("service_status", ["DRAFT", "PUBLISHED"]);

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  fullDesc: text("full_desc").notNull(),
  included: text("included").notNull().default("[]"), // JSON array
  category: serviceCategoryEnum("category").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(), // in INR paise (store as integer)
  counsellorName: text("counsellor_name").notNull(),
  counsellorBio: text("counsellor_bio").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  status: serviceStatusEnum("status").notNull().default("DRAFT"),
  slots: text("slots").notNull().default("[]"), // JSON array of date-time strings
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
