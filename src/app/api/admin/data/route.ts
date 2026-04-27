import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!adminDb) {
    return new Response("Database not initialized", { status: 500 });
  }

  try {
    const [bookingsSnap, ticketsSnap, chatsSnap, countSnap] = await Promise.all([
      adminDb.collection("bookings").orderBy("createdAt", "desc").get(),
      adminDb.collection("tickets").orderBy("createdAt", "desc").get(),
      adminDb.collection("chat_logs").orderBy("lastUpdatedAt", "desc").limit(50).get(),
      adminDb.collection("chat_logs").count().get(),
    ]);

    const bookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const tickets = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const chats = chatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalSessions = countSnap.data().count;

    return Response.json({ bookings, tickets, chats, totalSessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin Data Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
