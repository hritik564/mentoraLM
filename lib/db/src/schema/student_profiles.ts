import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const studentProfilesTable = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  // Step 1 - Personal Info
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  city: text("city"),
  state: text("state"),
  photoUrl: text("photo_url"),
  // Step 2 - Academic Background
  educationLevel: text("education_level"),
  board: text("board"),
  schoolCollege: text("school_college"),
  gradePercentage: text("grade_percentage"),
  stream: text("stream"),
  subjectStrengths: text("subject_strengths"),    // JSON array as text
  entranceExams: text("entrance_exams"),           // JSON array as text
  entranceScores: text("entrance_scores"),
  // Step 3 - Achievements & Personality
  achievements: text("achievements"),
  workStyle: text("work_style"),
  thinkingStyle: text("thinking_style"),
  energyType: text("energy_type"),
  // Step 4 - Interests & Strengths
  interests: text("interests"),                   // JSON array as text
  strengths: text("strengths"),                   // JSON array as text
  hobbies: text("hobbies"),
  freeTimeActivity: text("free_time_activity"),
  // Step 5 - Career Aspirations
  dreamCareer: text("dream_career"),
  targetColleges: text("target_colleges"),
  openToAbroad: text("open_to_abroad"),
  careerClarity: text("career_clarity"),
  decisionTimeline: text("decision_timeline"),
  // Step 6 - Family & Financial Context
  familyIncome: text("family_income"),
  parentsEducation: text("parents_education"),
  familyPressure: text("family_pressure"),
  educationBudget: text("education_budget"),
  familyCareerExpectation: text("family_career_expectation"),
  // Step 7 - Goals & Blockers
  fiveYearGoal: text("five_year_goal"),
  alreadyTried: text("already_tried"),
  obstacles: text("obstacles"),                   // JSON array as text
  stressLevel: integer("stress_level"),
  heardFrom: text("heard_from"),
  // Legacy fields kept for backwards compat
  energizedBy: text("energized_by"),
  biggestConcern: text("biggest_concern"),
  stoppingYou: text("stopping_you"),
  // Meta
  completionPercent: real("completion_percent").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;
