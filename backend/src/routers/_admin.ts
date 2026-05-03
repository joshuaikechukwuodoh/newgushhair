import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../db";
import { admins } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signJWT } from "../lib/auth";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const adminRouter = router({
  // login
  login: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, input.email));
      
      if (!admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.password,
        admin.password,
      );
      
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = await signJWT({ id: admin.id, email: admin.email });
      return {
        token,
        admin: { id: admin.id, email: admin.email, role: admin.role },
      };
    }),

  // register
  register: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      // Check if any admin already exists
      const existingAdmins = await db.select().from(admins).limit(1);
      if (existingAdmins.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "An admin account already exists. Only one admin is allowed.",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const [newAdmin] = await db
        .insert(admins)
        .values({
          email: input.email,
          password: hashedPassword,
        })
        .returning();

      if (!newAdmin) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create admin",
        });
      }

      return { id: newAdmin.id, email: newAdmin.email };
    }),
    // Check if an admin already exists
    alreadyExists: publicProcedure
    .input(z.object({ email: z.string().optional() }))
    .query(async () => {
      const [admin] = await db.select().from(admins).limit(1);
      return !!admin;
    }), 

  // logout
  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),

  // get all admins
  getAdmins: protectedProcedure.query(async () => {
    return await db.select().from(admins);
  }),

  // get admin by id
  getAdminById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.select().from(admins).where(eq(admins.id, input.id));
    }),

  // update admin
  updateAdmin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().optional(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }
      return await db
        .update(admins)
        .set(updateData)
        .where(eq(admins.id, id))
        .returning();
    }),

  // delete admin
  deleteAdmin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(admins).where(eq(admins.id, input.id)).returning();
    }),
});