import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  if (!adminDb) {
    return new Response("Database not initialized", { status: 500 });
  }

  try {
    const messagesSnap = await adminDb
      .collection("chat_logs")
      .doc(sessionId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();

    const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return Response.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin Chat GET Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!adminDb) {
    return new Response("Database not initialized", { status: 500 });
  }

  try {
    const { sessionId, content } = await req.json();

    if (!sessionId || !content) {
      return new Response("Missing sessionId or content", { status: 400 });
    }

    await adminDb.collection("chat_logs").doc(sessionId).collection("messages").add({
      role: "admin",
      content,
      timestamp: new Date().toISOString(),
    });

    // Update lastUpdatedAt
    await adminDb.collection("chat_logs").doc(sessionId).set({
      lastUpdatedAt: new Date().toISOString(),
    }, { merge: true });

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin Chat POST Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!adminDb) {
    return new Response("Database not initialized", { status: 500 });
  }

  try {
    const { sessionId, ticketId } = await req.json();

    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    // 1. Re-enable AI
    await adminDb.collection("chat_logs").doc(sessionId).update({
      handoverActive: false,
      lastUpdatedAt: new Date().toISOString(),
    });

    // 2. Close ticket if ticketId is provided
    if (ticketId) {
      await adminDb.collection("tickets").doc(ticketId).update({
        status: "Closed",
      });
    }

    // 3. Send a closing message from admin
    await adminDb.collection("chat_logs").doc(sessionId).collection("messages").add({
      role: "admin",
      content: "Thank you for contacting ThaiTalk support. This ticket has been closed and our AI assistant is back to help you with any further questions. Sawasdee kha!",
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin Chat PATCH Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
