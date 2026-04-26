# Project Implementation Plan: Sawadee Bot

## 1. Problem and Concept Definition
- [x] Clearly define the problem: High volume of repetitive inquiries for ThaiTalk language school.
- [x] Target users: Expats, tourists, and students interested in learning Thai.
- [x] AI Justification: 24/7 availability, instant response, multi-turn conversation handling.

## 2. AI Use Case Justification
- [x] Type of AI: NLP / Generative AI (Gemini 3.1 Flash Lite).
- [x] Justification:
    - Data: Course catalogs, pricing, and FAQs.
    - Pattern: Standard booking and inquiry workflows.
    - Business Value: Lead generation and automated support.
    - Feasibility: Ready-to-use LLM APIs.

## 3. System Workflow Design
- [x] Data collection: Course data from Firebase Firestore.
- [x] Data processing: Injecting context into System Prompt.
- [x] Model: Gemini API for response generation.
- [x] Output: Real-time streaming chat UI.
- [x] Actions: Automated booking and ticket creation via JSON-action parsing.

## 4. Technology Selection
- [x] Hardware: Cloud-hosted (Vercel), User devices (Mobile/Desktop).
- [x] Software: Next.js 15, TypeScript, Tailwind CSS.
- [x] AI Framework: Google Generative AI SDK.
- [x] Platforms: Vercel, Firebase (Firestore).

## 5. AI Tool Usage for Project Development
- [x] Development Assistant: Antigravity (Gemini 3 Flash).
- [x] Documentation: Automated report generation.

## 6. Ethical Consideration and Risk Analysis
- [x] Data privacy: Implemented Firestore Security Rules to protect student data.
- [x] Bias: System prompt enforces polite and professional language.
- [x] Hallucination risk: Grounded in Firestore course data with strict instructions.
- [x] When NOT to use AI: Handover logic implemented for complex issues.

## 7. Deliverables Generation
- [x] Final Report (Markdown draft in `docs/`).
- [x] Presentation Slides (Outline in `docs/`).
- [x] AI Usage Log (Prompt history in `docs/`).
