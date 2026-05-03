import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

// Admins
export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Items
export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  price: text("price").default("0"),
  category: text("category").default("Wigs"),
  subCategory: text("sub_category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").default("Pending"), // Pending, Delivered, Cancelled
  items: jsonb("items").notNull(), // JSON array of items: [{id, name, quantity, price}]
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings
export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("main"),
  siteName: text("site_name").default("GUSS HAIRS"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  address: text("address"),
  heroImage: text("hero_image"),
  bannerText: text("banner_text"),
  advertText: text("advert_text"),
  banners: jsonb("banners"), // JSON array of banners: [{text, imageUrl}]
  updatedAt: timestamp("updated_at").defaultNow(),
});