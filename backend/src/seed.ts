// src/seed.ts
import { db } from "./db";
import { admins } from "./db/schema";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Set your admin credentials here
const email = "admin@example.com";
const password = "password123"; // plain password, will be hashed

async function main() {
  console.log(` Clearing old admins and creating new account for: ${email}...`);

  try {
    // 1️⃣ Clear all existing admins
    await db.delete(admins);
    console.log("🧹 All existing admins cleared.");

    // 2️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


    // 3️⃣ Insert into the database
    const result = await db
      .insert(admins)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    if (result.length === 0) {
      console.log("⚠️ Admin already exists, skipping creation.");
    } else {
      console.log("✅ Admin created successfully!");
      console.log("-----------------------------------");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log("-----------------------------------");
      console.log("You can now use these credentials to log in.");
    }
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
  } finally {
    // Close Bun process
    process.exit(0);
  }
}

// Run the seed script
main();
