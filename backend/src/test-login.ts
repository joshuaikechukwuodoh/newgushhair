import "dotenv/config";

async function testLogin() {
  console.log("Testing login...");
  try {
    const res = await fetch("http://localhost:3000/trpc/admin.login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "password123",
      }),
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

testLogin();
