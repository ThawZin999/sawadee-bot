import { adminDb } from "./admin";

const classes = [
  {
    title: "Beginner Thai Conversations",
    level: "Beginner",
    price: "$150 / month",
    schedule: "Mondays & Wednesdays 6:00 PM - 7:30 PM (BKK Time)",
    description: "Learn basic greetings, numbers, and how to order food. Online via Zoom. Perfect for tourists and expats.",
  },
  {
    title: "Intermediate Grammar & Script",
    level: "Intermediate",
    price: "$180 / month",
    schedule: "Tuesdays & Thursdays 7:00 PM - 8:30 PM (BKK Time)",
    description: "Deep dive into Thai sentence structure and start reading/writing the beautiful Thai script. Online via Zoom.",
  },
  {
    title: "Advanced Business Thai",
    level: "Advanced",
    price: "$250 / month",
    schedule: "Saturdays 10:00 AM - 1:00 PM (BKK Time)",
    description: "Master formal language, professional presentations, and negotiation tactics for the Thai workplace. Online via Zoom.",
  },
];

export async function seedDatabase() {
  if (!adminDb) {
    console.error("Admin DB not initialized.");
    return;
  }

  const classesRef = adminDb.collection("classes");
  
  // Check if already seeded
  const snapshot = await classesRef.limit(1).get();
  if (!snapshot.empty) {
    console.log("Database already seeded with classes.");
    return;
  }

  console.log("Seeding database...");
  for (const cls of classes) {
    await classesRef.add({
      ...cls,
      createdAt: new Date().toISOString(),
    });
  }
  console.log("Seeding complete!");
}
