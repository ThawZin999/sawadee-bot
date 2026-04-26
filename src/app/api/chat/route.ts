import { openai, MODEL_NAME, SYSTEM_PROMPT } from "@/lib/ai";
import { adminDb } from "@/lib/firebase/admin";
import { seedDatabase } from "@/lib/firebase/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const sessionId = req.headers.get("x-session-id") || "demo-session";

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing API Key", { status: 500 });
    }

    // 1. Seed & Fetch context
    await seedDatabase();
    
    // Check for active handover
    let handoverActive = false;
    if (adminDb) {
      const sessionDoc = await adminDb.collection("chat_logs").doc(sessionId).get();
      if (sessionDoc.exists && sessionDoc.data()?.handoverActive) {
        handoverActive = true;
      }
    }

    if (handoverActive) {
      // If handover is active, AI should not respond.
      // We just save the user message and return a placeholder or wait for admin.
      if (adminDb) {
        await adminDb.collection("chat_logs").doc(sessionId).collection("messages").add({
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        });
      }
      return new Response("Our admin will respond to your message shortly. Please wait a moment...", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const classesSnapshot = await adminDb!.collection("classes").get();
    const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const classesContext = JSON.stringify(classesData, null, 2);

    // 2. Prepare messages for OpenAI format
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\nAVAILABLE CLASSES:\n" + classesContext },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // 3. Start Streaming
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any[], 
      stream: true,
    });

    // 4. Create a ReadableStream to send back to client
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";
        const encoder = new TextEncoder();

        try {
          // Save user message to Firestore
          if (adminDb) {
            await adminDb.collection("chat_logs").doc(sessionId).collection("messages").add({
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            });
          }

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            fullText += content;
            controller.enqueue(encoder.encode(content));
          }

          // Save assistant message to Firestore
          if (adminDb) {
            await adminDb.collection("chat_logs").doc(sessionId).collection("messages").add({
              role: "assistant",
              content: fullText,
              timestamp: new Date().toISOString(),
            });
          }

          // Handle actions at the end of the stream
          await handleActions(fullText, sessionId);
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

async function handleActions(text: string, sessionId: string) {
  if (!adminDb) return;

  const bookingMatch = text.match(/\[ACTION:BOOKING:(.*?)\]/);
  if (bookingMatch) {
    try {
      const data = JSON.parse(bookingMatch[1]);
      await adminDb.collection("bookings").add({
        ...data,
        sessionId,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to parse booking action:", e);
    }
  }

  const ticketMatch = text.match(/\[ACTION:TICKET:(.*?)\]/);
  if (ticketMatch) {
    try {
      const data = JSON.parse(ticketMatch[1]);
      await adminDb.collection("tickets").add({
        ...data,
        sessionId,
        status: "Open",
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to parse ticket action:", e);
    }
  }
  
  const handoverMatch = text.match(/\[ACTION:HANDOVER:(.*?)\]/);
  if (handoverMatch) {
    try {
      const data = JSON.parse(handoverMatch[1]);
      await adminDb.collection("chat_logs").doc(sessionId).set({
        handoverActive: true,
        handoverReason: data.reason || "User requested human",
        lastUpdatedAt: new Date().toISOString(),
      }, { merge: true });

      // Create a ticket for the handover
      await adminDb.collection("tickets").add({
        type: "Handover Request",
        details: `Handover triggered: ${data.reason || "User requested human"}`,
        sessionId,
        status: "Open",
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to parse handover action:", e);
    }
  }
  
  await adminDb.collection("chat_logs").doc(sessionId).set({
    lastUpdatedAt: new Date().toISOString(),
  }, { merge: true });
}
