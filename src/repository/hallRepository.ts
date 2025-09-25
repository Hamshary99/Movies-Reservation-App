import * as hallSchema from "../models/hallSchema.js";
import * as seatSchema from "../models/seatSchema.js";
import * as relations from "../models/relations.js";
import { db } from "./dbConfig.js";
import { and, eq, gt, gte, sql } from "drizzle-orm";
import { ApiError, SQLError } from "../utils/errorHandler.js";

export const createHall = async (
  hallName: string,
  rows: number,
  columns: number
) => {
  try {
    hallName = hallName
      .trim()
      .toUpperCase()
      .replace(/\s/g, "_")
      .replace(/([A-Za-z])(\d)/g, "$1_$2");
    console.log(hallName);
    const isHallExist = await db
      .select()
      .from(hallSchema.hallsTable)
      .where(eq(hallSchema.hallsTable.name, hallName));
    if (isHallExist[0]) {
      throw new ApiError("Hall already exists", 400);
    }

    const hall = await db
      .insert(hallSchema.hallsTable)
      .values({
        name: hallName,
      })
      .returning({
        id: hallSchema.hallsTable.id,
        name: hallSchema.hallsTable.name,
      });

    if (!hall[0]) {
      throw new SQLError("Failed to create hall", 500, "SQL_error");
    }

    const seats: any[] = [];

    for (let row = 0; row < rows; row++) {
      const rowLabel = String.fromCharCode(65 + row);
      for (let column = 1; column <= columns; column++) {
        seats.push({
          rowLabel: rowLabel + column,
          hall: hall[0].id,
          isAvailable: true,
          booked: false,
        });
      }
    }

    const seatsOfHall = await db
      .insert(seatSchema.seatsTable)
      .values(seats)
      .returning();
    // console.log(seats);
    return { hall: hall[0], seats: seatsOfHall };
  } catch (error: any) {
    throw error;
  }
};

export const getHalls = async () => {
  try {
    const halls = await db
      .select()
      .from(hallSchema.hallsTable)
      .orderBy(hallSchema.hallsTable.name);
    
    if (!halls[0]) {
      throw new ApiError("No halls found", 404);
    }

    return halls;
  } catch (error: any) {
    throw error;
  }
};

export const getHall = async (id: number) => {
  try {
    return await db.transaction(async (tx) => {
      const hall = await tx
        .select()
        .from(hallSchema.hallsTable)
        .where(eq(hallSchema.hallsTable.id, id))
        .limit(1);
      if (!hall[0]) {
        throw new ApiError("Hall not found", 404);
      }

      const seatsOfHall = await tx
        .select()
        .from(seatSchema.seatsTable)
        .where(eq(seatSchema.seatsTable.hall, id));

      if (!seatsOfHall[0]) {
        throw new ApiError("No seats found for this hall", 404);
      }

      return { hall: hall[0], seats: seatsOfHall };
    });
  } catch (error: any) {
    throw error;
  }
};

export const updateHall = async (
  id: number,
  hallName: string,
  rows: number,
  columns: number
) => {
  try {
    // await getHall(id);

    hallName = hallName
      .trim()
      .toUpperCase()
      .replace(/\s/g, "_")
      .replace(/([A-Za-z])(\d)/g, "$1_$2");

    return await db.transaction(async (tx) => {
      const isHallExist = await tx
        .select()
        .from(hallSchema.hallsTable)
        .where(eq(hallSchema.hallsTable.id, id))
        .limit(1);

      if (!isHallExist[0]) {
        console.log("Hall does not exist or error occurred");
        throw new ApiError("Hall not found", 404);
      }

      // Tried to update hall name but it won't work as the type name is unique (might be changed in future)

      // const hall = await tx
      //   .update(hallSchema.hallsTable)
      //   .set({ name: hallName })
      //   .where(eq(hallSchema.hallsTable.id, id))
      //   .returning()
      //   .catch((error: any) => {
      //     const err = error?.message || error?.cause || error?.cause?.message || error;
      //     console.log("Error with updating hall: ", err);
      //     throw new SQLError(`Failed to update hall ${err}`, 500, "SQL_error");
      //   });

      // if (!hall[0]) {
      //   throw new SQLError("Failed to update hall", 500, "SQL_error");
      // }

      try {
        await tx
          .delete(seatSchema.seatsTable)
          .where(eq(seatSchema.seatsTable.hall, id));
      } catch (error: any) {
        throw new SQLError(`Failed to delete existing seats: ${error}`, 500, "SQL_error");
      }

      const seats: any[] = [];

      for (let row = 0; row < rows; row++) {
        const rowLabel = String.fromCharCode(65 + row); // A, B, C...
        for (let column = 1; column <= columns; column++) {
          seats.push({
            rowLabel: rowLabel + column,
            hall: id,
            isAvailable: true,
            booked: false,
          });
        }
      }

      const seatsOfHall = await tx
        .insert(seatSchema.seatsTable)
        .values(seats)
        .returning()
        .catch((error: any) => {
          throw new SQLError(`Failed to create seats: ${error}`, 500, "SQL_error");
        });

      return { hall: isHallExist[0], seats: seatsOfHall };
    });
  } catch (error: any) {
    throw error;
  }
};

export const deleteHalls = async () => {
  try {
    const deletedHalls = await db.delete(hallSchema.hallsTable).returning();
    if (!deletedHalls[0]) {
      throw new ApiError("No halls found", 404);
    }

    return deletedHalls;
  } catch (error: any) {
    throw error;
  }
};

export const deleteHall = async (id: number) => {
  try {
    const deletedHall = await db
      .delete(hallSchema.hallsTable)
      .where(eq(hallSchema.hallsTable.id, id))
      .returning();

    if (!deletedHall[0]) {
      throw new ApiError("Hall not found", 404);
    }

    return deletedHall[0];
  } catch (error: any) {
    throw error;
  }
};
