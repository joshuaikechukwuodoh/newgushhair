import "dotenv/config";
import { writeFileSync } from "fs";

const log: string[] = [];
function print(msg: string) {
  log.push(msg);
  console.log(msg);
}

async function testUploadThing() {
  print("Testing UploadThing setup...");

  // 1. Check env
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) {
    print("FAIL: UPLOADTHING_TOKEN is not set in .env");
    writeFileSync("test-results.txt", log.join("\n"), "utf-8");
    process.exit(1);
  }
  print("PASS: UPLOADTHING_TOKEN is set");

  // 2. Check endpoint
  try {
    const res = await fetch("http://localhost:3000/api/uploadthing");
    print("PASS: UploadThing endpoint responded, status: " + res.status);
  } catch (err: any) {
    print("FAIL: Could not reach endpoint - is bun run dev running?");
    writeFileSync("test-results.txt", log.join("\n"), "utf-8");
    process.exit(1);
  }

  // 3. Login and create item
  try {
    const loginRes = await fetch("http://localhost:3000/trpc/admin.login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "password123",
      }),
    });

    const loginText = await loginRes.text();
    print("Login response status: " + loginRes.status);
    print("Login response: " + loginText.substring(0, 500));

    if (loginRes.ok) {
      const loginData = JSON.parse(loginText);
      const jwt = loginData?.result?.data?.token;

      if (jwt) {
        print("PASS: Logged in, got JWT token");

        // Create a test item
        const createRes = await fetch("http://localhost:3000/trpc/createItem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwt,
          },
          body: JSON.stringify({
            name: "Test Item",
            description: "Created by test script",
            image: "https://utfs.io/f/test-placeholder.jpg",
          }),
        });

        const createText = await createRes.text();
        print("Create item status: " + createRes.status);
        print("Create item response: " + createText.substring(0, 500));

        if (createRes.ok) {
          print("PASS: Item created in database!");
        } else {
          print("FAIL: Could not create item");
        }
      } else {
        print("FAIL: No JWT token in login response");
      }
    } else {
      print("FAIL: Login failed - run 'bun run seed' first");
    }
  } catch (err: any) {
    print("FAIL: " + err.message);
  }

  print("--- TEST COMPLETE ---");
  writeFileSync("test-results.txt", log.join("\n"), "utf-8");
  process.exit(0);
}

testUploadThing();