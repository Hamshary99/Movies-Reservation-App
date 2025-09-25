import { relations } from "drizzle-orm";
import * as hallSchema from "./hallSchema";
import * as seatSchema from "./seatSchema";


export const hallRelation = relations(hallSchema.hallsTable, ({ one, many }) => ({
    seats: many(seatSchema.seatsTable),
}))

export const seatRelation = relations(seatSchema.seatsTable, ({ one }) => ({
    hall: one(hallSchema.hallsTable, {
        fields: [seatSchema.seatsTable.hall],
        references: [hallSchema.hallsTable.id]
    }),
}))