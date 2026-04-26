# AI Usage Log: SawadeeBot Development

This log documents the prompts and iterative process used to develop the SawadeeBot AI solution.

## 1. Phase: Concept and Logic Design
**Tool Used:** Antigravity (Gemini 3 Flash)

**Prompt:**
> "Help me design a system prompt for a Thai language school chatbot called 'SawadeeBot'. It needs to handle class info retrieval, booking, and ticket escalation. Use structured actions for the system to detect."

**AI Output Summary:**
Generated a comprehensive system prompt with "Thai hospitality" persona and specific JSON-like action tags: `[ACTION:BOOKING:...]` and `[ACTION:TICKET:...]`.

**Refinement Process:**
- **Initial:** The AI included too much Thai language.
- **Edit:** I asked it to stick to English for the body of the message but use polite Thai greetings only at the start.
- **Final:** Integrated into `src/lib/gemini.ts`.

---

## 2. Phase: Implementation (Next.js & Gemini API)
**Tool Used:** Antigravity (Gemini 3 Flash)

**Prompt:**
> "Write a Next.js API route that uses the Google Generative AI SDK to stream responses from Gemini 2.5 Flash. It should also handle the action tags at the end of the stream and save them to Firebase."

**AI Output Summary:**
Provided a `route.ts` implementation using `ReadableStream` and regex parsing for action tags.

**Refinement Process:**
- **Issue:** The action tags were showing up in the UI during streaming.
- **Edit:** Added a regex filter in the frontend `handleSendMessage` to strip `[ACTION:...]` blocks from the visible message content.

---

## 3. Phase: UI/UX Development
**Tool Used:** Antigravity (Gemini 3 Flash)

**Prompt:**
> "Create a premium, modern chat interface for SawadeeBot using Shadcn UI and Tailwind CSS. Use a 'Thai Hospitality' theme with soft blue and slate colors."

**AI Output Summary:**
Generated a full React component using `Card`, `ScrollArea`, and `Lucide` icons.

**Refinement Process:**
- **Edit:** Added "Suggestion Chips" to help first-time users know what to ask.
- **Edit:** Implemented auto-scroll to the bottom when new messages arrive.

---

## 4. Phase: Documentation & Report
**Tool Used:** Antigravity (Gemini 3 Flash)

**Prompt:**
> "Based on our project requirements, draft a final report that justifies the use of AI, explains the system workflow, and addresses ethical concerns like hallucination and bias."

**AI Output Summary:**
Drafted `FINAL_REPORT.md` following the specific assignment structure.

**Combining Outputs:**
I reviewed the drafted report, filled in technical details about Firebase and Gemini 2.5 Flash, and ensured the "Why AI" section used the AI Decision Framework as requested.
