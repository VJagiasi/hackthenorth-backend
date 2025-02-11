import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // Load the JSON file
  const filePath = path.join(__dirname, "../user.json");
  const data: {
    name: string;
    email: string;
    phone: string;
    badge_code: string;
    scans: { activity_name: string; activity_category: string; scanned_at: string }[];
  }[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // ✅ Step 1: Ensure all unique activities exist
  const uniqueActivities = new Map();
  for (const user of data) {
    for (const scan of user.scans) {
      const key = `${scan.activity_name}-${scan.activity_category}`;
      if (!uniqueActivities.has(key)) {
        uniqueActivities.set(key, {
          name: scan.activity_name,
          category: scan.activity_category,
        });
      }
    }
  }

  await Promise.all(
    Array.from(uniqueActivities.values()).map(async (activity) => {
      await prisma.activity.upsert({
        where: { name: activity.name },
        update: {},
        create: activity,
      });
    })
  );

  console.log("✅ All activities inserted successfully!");

  // ✅ Step 2: Insert users and their scans
  const insertedBadgeCodes = new Set<string>(); // Track unique badge codes

  for (const user of data) {
    try {
      let sanitizedBadgeCode = user.badge_code.trim() !== "" ? user.badge_code : null;

      // ✅ Check for duplicate non-empty badge codes
      if (sanitizedBadgeCode && insertedBadgeCodes.has(sanitizedBadgeCode)) {
        console.warn(`⚠️ Skipping duplicate badge_code '${sanitizedBadgeCode}' for ${user.email}`);
        continue; // Skip inserting this user
      }

      const checkedIn = false; // Default is checked out even if they have a badge_code

      await prisma.user.upsert({
        where: { email: user.email }, // Email is always unique
        update: {},
        create: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          badge_code: sanitizedBadgeCode, // Store null if empty
          checked_in: checkedIn, // Automatically set checked_in
          updated_at: new Date(),
          scans: {
            create: user.scans.map((scan) => ({
              scanned_at: new Date(scan.scanned_at),
              activity: { connect: { name: scan.activity_name } }, // ✅ Ensure activities exist
            })),
          },
        },
      });

      if (sanitizedBadgeCode) insertedBadgeCodes.add(sanitizedBadgeCode); // Track unique badge codes

    } catch (error) {
      console.error(`❌ Error seeding user ${user.email}:`, error);
    }
  }

  console.log("✅ Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });