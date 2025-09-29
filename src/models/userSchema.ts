import { z } from "zod";
import {
  text,
  uuid,
  timestamp,
  pgTable,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createUpdateSchema,
  createSelectSchema,
} from "drizzle-zod";

export const roles = ["user", "admin", "staff"] as const;
export const roleEnum = pgEnum("role", ["user", "admin", "staff"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum().default("user").notNull(),
  phone: text("phone"),
  passwordChangedAt: timestamp("password_changed_at"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// Omitted columns that we don't want to return in the response
export type UserWithoutPassword = Omit<
  User,
  | "password"
  | "passwordChangedAt"
  | "passwordResetToken"
  | "passwordResetExpires"
  | "createdAt"
  | "updatedAt"
>;
export type UserWithToken = UserWithoutPassword & { token: string }; // May not be needed
export type UserEmailOnly = Pick<User, "email">;

export const userInsertSchema = createInsertSchema(usersTable);
export const userUpdateSchema = createUpdateSchema(usersTable);
export const userSelectSchema = createSelectSchema(usersTable);

// Schema used on signup form
export const userSignUpSchema = userInsertSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(2, "Name should be at least 2 characters long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .refine((val) => val !== "undefined" && !!val, {
        message: "Email is required",
      }),
    password: z
      .string()
      .min(8, "Password should be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number, you can leave it blank")
      .optional(),
    createdAt: z.date().optional().default(new Date()),
    updatedAt: z.date().optional().default(new Date()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });


export const userLoginSchema = userSelectSchema
  .pick({ email: true, password: true })
  .refine((data) => data.email && data.password, {
    message: "Email and password are required",
  });

// Internal insert schema for user creation in DB
// Used by normal users
export const restrictedUserUpdateSchema = userUpdateSchema.extend({
  role: z.undefined(), // prevent normal users from changing role
});

// Used by admins (can change role)
export const adminUserUpdateSchema = userUpdateSchema.extend({
  role: z.enum(roles).optional(), // only admins can pass role, so in user routes force role to be "user"
});

