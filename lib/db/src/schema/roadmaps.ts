import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const roadmapsTable = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // JSON string with 4-phase structure
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export type Roadmap = typeof roadmapsTable.$inferSelect;
