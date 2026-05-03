import { router, protectedProcedure, publicProcedure } from "../trpc";
import { adminRouter } from "./_admin";
import { z } from "zod";
import { db } from "../db";
import { items, orders, settings } from "../db/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  admin: adminRouter,

  // --- ITEMS ---
  // CREATE ITEM
  createItem: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        image: z.string(),
        price: z.string().optional(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .insert(items)
        .values({
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price || "0",
          category: input.category || "Wigs",
          subCategory: input.subCategory,
        })
        .returning();
    }),

  // UPDATE ITEM
  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        image: z.string(),
        price: z.string().optional(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .update(items)
        .set({
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price,
          category: input.category,
          subCategory: input.subCategory,
        })
        .where(eq(items.id, input.id))
        .returning();
    }),

  // DELETE ITEM
  deleteItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db
        .delete(items)
        .where(eq(items.id, input.id))
        .returning();
    }),

  // GET ALL ITEMS
  getItems: publicProcedure.query(async () => {
    return await db.select().from(items);
  }),

  // GET ITEM BY ID
  getItemById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(items)
        .where(eq(items.id, input.id));
    }),

  // --- ORDERS ---
  // CREATE ORDER
  createOrder: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        totalAmount: z.string(),
        items: z.array(z.any()), // [{id, name, quantity, price}]
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .insert(orders)
        .values({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          totalAmount: input.totalAmount,
          items: input.items,
        })
        .returning();
    }),

  // GET ALL ORDERS
  getOrders: protectedProcedure.query(async () => {
    return await db.select().from(orders);
  }),

  // UPDATE ORDER STATUS
  updateOrderStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ input }) => {
      return await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id))
        .returning();
    }),

  // --- SETTINGS ---
  // GET SETTINGS
  getSettings: publicProcedure.query(async () => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.id, "main"));
    return result[0] || null;
  }),

  // UPDATE SETTINGS
  updateSettings: protectedProcedure
    .input(
      z.object({
        siteName: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        heroImage: z.string().optional(),
        bannerText: z.string().optional(),
        advertText: z.string().optional(),
        banners: z.array(z.any()).optional(), // [{text, imageUrl}]
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.id, "main"));

      if (existing.length === 0) {
        return await db
          .insert(settings)
          .values({ id: "main", ...input })
          .returning();
      } else {
        return await db
          .update(settings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(settings.id, "main"))
          .returning();
      }
    }),
});

export type AppRouter = typeof appRouter;