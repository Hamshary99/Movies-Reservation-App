import {
  serial,
  integer,
  text,
  pgTable,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";

export const hallsTable = pgTable("halls", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export type Hall = typeof hallsTable.$inferSelect;
export type newHall = typeof hallsTable.$inferInsert;

export const baseInsert = createInsertSchema(hallsTable);
export const baseUpdate = createUpdateSchema(hallsTable);
export const baseSelect = createSelectSchema(hallsTable);

export const hallInsertSchema = baseInsert.extend({
  name: z.string().min(2, "Name should be at least 2 characters long").max(50).transform((name) => name.trim().toUpperCase().replace(/\s/g, "_").replace(/([A-Za-z])(\d)/g, "$1_$2")),
});

export const hallUpdateSchema = baseUpdate.extend({
  name: z.string().min(2, "Name should be at least 2 characters long").max(50).transform((name) => name.trim().toUpperCase().replace(/\s/g, "_").replace(/([A-Za-z])(\d)/g, "$1_$2")).optional(),
});

export const hallSelectSchema = baseSelect.extend({
  id: z.number().int().positive(),
  name: z.string().min(2).max(50)
});

export const hallDataVerify = z.object({
  hallName: z.string(),
  rows: z.number().min(1).max(20),
  columns: z.number().min(1).max(20),
});