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

const faqs = [
  {
    question: "Do you offer online classes?",
    answer: "Yes! All our courses are currently offered online via Zoom, allowing you to learn from anywhere in the world.",
    category: "General",
  },
  {
    question: "How long is each course level?",
    answer: "Each level (Beginner, Intermediate, Advanced) typically takes 4-6 weeks to complete, with 2 sessions per week.",
    category: "Courses",
  },
  {
    question: "Do I need to buy any textbooks?",
    answer: "We provide all learning materials in digital format (PDFs and audio files) free of charge for our students.",
    category: "Materials",
  },
  {
    question: "Can I get a refund if I can't attend?",
    answer: "We offer a full refund if you cancel at least 7 days before the course starts. Within 7 days, we can offer a credit for future classes.",
    category: "Policy",
  },
  {
    question: "Do you provide Education (ED) Visas?",
    answer: "Currently, we only offer short-term conversational courses and do not provide ED Visa sponsorship.",
    category: "Visas",
  },
  {
    question: "How do I pay for the classes?",
    answer: "We accept payments via Bank Transfer (Thailand), PayPal, and major Credit Cards.",
    category: "Payment",
  },
];

export async function seedDatabase() {
  if (!adminDb) {
    console.error("Admin DB not initialized.");
    return;
  }

  const classesRef = adminDb.collection("classes");
  const faqsRef = adminDb.collection("faqs");
  
  // Check if classes already seeded
  const classesSnapshot = await classesRef.limit(1).get();
  if (classesSnapshot.empty) {
    console.log("Seeding classes...");
    for (const cls of classes) {
      await classesRef.add({
        ...cls,
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    console.log("Classes already seeded.");
  }

  // Check if FAQs already seeded
  const faqsSnapshot = await faqsRef.limit(1).get();
  if (faqsSnapshot.empty) {
    console.log("Seeding FAQs...");
    for (const faq of faqs) {
      await faqsRef.add({
        ...faq,
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    console.log("FAQs already seeded.");
  }

  console.log("Seeding process finished!");
}
