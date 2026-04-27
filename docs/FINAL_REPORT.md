# AI Solution Design: SawadeeBot for ThaiTalk
**Date:** 26 April 2026
**Group Members:** [Names to be filled]

---

## 1. Problem and Concept Definition
### Problem Statement
ThaiTalk, a leading online Thai language school, faces a high volume of repetitive inquiries regarding course schedules, pricing, and booking procedures. Managing these through manual support channels is slow, expensive, and results in lost leads during off-hours.

### Target Users
- **Expats:** Living in Thailand needing practical language skills.
- **Tourists:** Planning a trip and wanting basic conversational Thai.
- **Students:** Seeking formal certifications (ED Visa assistance).

### AI Decision Framework: Why AI?
- **Urgency:** Students often need instant info to make a booking decision.
- **Complexity:** Queries are in natural language ("I'm free on Tuesdays", "Do you have beginner classes for kids?").
- **Scalability:** AI can handle hundreds of concurrent sessions without adding staff costs.

---

## 2. AI Use Case Justification
### AI Type
Generative AI (Large Language Model) using **Google Gemini 3.1 Flash Lite** (via **OpenRouter**).

### Justification Matrix
- **Data:** We have structured data for all courses, pricing, and instructor availability.
- **Pattern:** Customer support follows a predictable pattern: Greeting -> Info Retrieval -> Booking/Escalation/Handover.
- **Business Value:** Expected 40% reduction in manual support tickets. We implemented an **AI Conversion Rate** metric (Unique Sessions with Booking / Total Sessions) to track business impact in real-time.
- **Feasibility:** Modern LLMs like Gemini provide excellent reasoning capabilities and are easy to integrate via API.

---

## 3. System Workflow Design
### Data Flow
1. **Data Collection:** Course information is stored in Firebase Firestore.
2. **Data Processing:** Upon each request, the system retrieves the latest "Available Classes" and injects them into the LLM system prompt as context.
3. **Model Interaction:** The Gemini model processes user intent against the provided context.
4. **Action Parsing:** The system detects structured strings (e.g., `[ACTION:BOOKING]`) to trigger database writes for bookings or support tickets.
5. **Human Handover:** If the AI detects a complex request, it triggers `[ACTION:HANDOVER]`, alerting a human admin who can then take over the live chat in real-time.
6. **Output:** A streaming markdown response is sent back to the React-based chat interface.

---

## 4. Technology Selection
### Hardware
- **Infrastructure:** Vercel Edge Network (Serverless).
- **Client:** Mobile-responsive web interface for any modern browser.

### Software & Tools
- **Framework:** Next.js 15 (App Router).
- **Logic:** TypeScript.
- **UI:** Tailwind CSS + Shadcn UI.
- **Database:** Firebase (Firestore & Admin SDK).
- **AI Component:** Google Generative AI (Gemini 3.1 Flash Lite via OpenRouter).

---

## 5. Ethical Consideration and Risk Analysis
### Data Privacy
- Personal data (Email, Name) is only collected during the booking flow and stored securely in Firebase.
- No training on user data: We do not send user history back to the base model for training.

### Bias and Safety
- The system prompt enforces a "Polite Thai Hospitality" persona to ensure respectful interactions.
- Language is restricted to English for the initial version to maintain control over output quality.

### Hallucination Risk
- **Grounding:** The AI is strictly instructed to use *only* provided class data.
- **Constraint:** If information is missing, the bot is programmed to say "I don't know" rather than guessing.

### When NOT to use AI
- **Complex Financial Disputes:** Refund requests are escalated to human managers.
- **Pedagogical Advice:** Deep questions about language nuances are referred to certified teachers.

---

## 6. AI Usage Documentation
*Detailed logs of prompts and iterations can be found in the accompanying AI_USAGE_LOG.md.*

---

## 7. References
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
