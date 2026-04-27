# AI Usage Log: The Development of SawadeeBot

This log documents the deep interaction between the developer and the AI (Antigravity) to create the SawadeeBot solution. It tracks the evolution from a simple chat interface to a complex, hybrid AI-human support system.

---

## 1. Phase: Identity & Logic Design (Prompt Engineering)

The most critical part of the development was defining how the AI should behave and interact with our system.

### Evolution of the System Prompt
**Initial Draft Prompt:**
> "Act as a chatbot for a Thai school. Help people book classes."
> *Result:* Too generic. The bot made up prices and didn't follow a specific format.

**Iterative Refinement (The "Grounding" Prompt):**
> "You are 'SawadeeBot'. You only answer based on the context provided in the `AVAILABLE CLASSES` section. If a user wants to book, output a special tag like `[ACTION:BOOKING:{"name": "...", "email": "...", "class": "..."}]`. If they are angry or want a refund, output `[ACTION:TICKET:...]`."

**Final Production Prompt (The "Hybrid" Prompt):**
> "You are an expert Thai Language School Assistant. Start with 'Sawasdee kha'. Strictly adhere to the provided JSON context for pricing and levels. 
> 
> **CRITICAL**: If the user asks for a human, admin, or says 'talk to someone', you MUST output `[ACTION:HANDOVER:{"reason": "user request"}]`. 
> 
> Place all ACTION tags at the very end of your response so the system can parse them."

---

## 2. Phase: System Workflow (The Technical "Brain")

The workflow was designed to ensure that the AI isn't just "chatting" but is actively driving the business process.

### The Lifecycle of a Message
1. **Frontend (User Input)**: User sends "I want to book the Level 1 Intensive."
2. **API Layer (Middleware)**:
   - Check Firestore if a human admin has already taken over (`handoverActive: true`).
   - If yes: Skip AI, save message to DB, and return "Admin will respond shortly."
   - If no: Fetch course list from Firestore and inject into the prompt.
3. **AI Inference**: The LLM processes the history + context + new message.
4. **Action Parsing (Regex Engine)**:
   - The backend scans the streaming response for `[ACTION:...]`.
   - `[ACTION:BOOKING]` -> Create document in `/bookings`.
   - `[ACTION:HANDOVER]` -> Set `handoverActive: true` in `/chat_logs` and create a `/tickets` entry.
5. **Frontend (Display)**:
   - The UI filters out the `[ACTION]` tags using regex so the student only sees the text.
   - The UI scrolls to the bottom to show the response.

---

## 3. Phase: Iteration Process (Milestones)

The project was built in four distinct "Sprints," each adding a layer of complexity.

### Milestone 1: The "Dumb" Bot
- **Focus**: Basic Next.js setup and OpenAI streaming.
- **Problem**: The bot didn't know about ThaiTalk's actual prices.
- **Correction**: Created `src/lib/firebase/seed.ts` to populate Firestore with real school data.

### Milestone 2: The "Acting" Bot
- **Focus**: Action Tag parsing.
- **Problem**: The tags were visible in the chat bubble, looking messy.
- **Correction**: Developed a frontend filter to hide anything inside `[...]` from the user.

### Milestone 3: The "Admin" Bot
- **Focus**: The Handover Dashboard.
- **Problem**: Admin had to refresh to see if a student was waiting.
- **Correction**: Integrated Firebase `onSnapshot`. This created a "live" feel where messages appear instantly for both sides.

### Milestone 4: Production Polish
- **Focus**: Metrics and Stability.
- **Feature Add**: Calculated the "AI Conversion Rate" by comparing unique session IDs in `/chat_logs` vs. `/bookings`.
- **Optimization**: Switched from `any` to strict TypeScript interfaces to prevent runtime crashes.

---

## 4. Key AI Prompts for UI/UX

To achieve the "Premium" look, specific design prompts were used:

**The "Glassmorphism" Prompt:**
> "Design a chat bubble that feels premium. Use a semi-transparent background with a subtle blur, soft borders, and a shadow. Ensure it looks great on both light and dark backgrounds."

**The "Real-time Dashboard" Prompt:**
> "Create a dashboard using Shadcn Tabs. One tab for 'Overview' with stats, one for 'Tickets', and one for 'Active Chat'. The Active Chat should have a list of users on the left and the chat window on the right."

---

## 5. Summary of AI-Human Collaboration
The development was a loop:
1. **Human** defines the business rule (e.g., "Refunds need a human").
2. **AI** suggests the technical implementation (e.g., "Use a specific action tag").
3. **Human** identifies a bug (e.g., "The tag is visible to the user").
4. **AI** provides the code fix (e.g., "Regex filter in the component").
