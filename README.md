# MediKiosk — Full Stack Ready

This version uses its **own local backend and database**. Supabase is not required to run it.

## Stack
- React + Vite frontend
- Node.js + Express backend
- File-backed JSON database at `backend/data/database.json`
- JWT authentication
- bcrypt password hashing
- Doctor directory + profiles
- Patient profiles
- Doctor-specific appointment booking/cancellation

## Run on Windows
1. Install Node.js LTS from https://nodejs.org/
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:5173

If the root install does not install workspace packages, run:
`npm run install-all`

## Demo doctor accounts
All seeded doctors use password `Doctor@123`:
- dr.ananya@medikiosk.local
- dr.rohan@medikiosk.local
- dr.meera@medikiosk.local
- dr.kavya@medikiosk.local

Create a normal patient account from the Sign in page.

## Important
The JSON database is intended for a local/demo deployment. For production healthcare use, replace it with a properly secured managed database, add HTTPS, audit logging, stronger secrets, backups, and appropriate privacy/security controls.


### Recent fixes
- Medical document upload now returns a boolean validation result and blocks saving when validation fails.
- After the final symptom/history submission, the patient is sent directly to the doctor selection page.


## AI medical-document analysis

The document upload screen now sends the selected prescription, lab report, discharge summary, or other supported medical document to the backend for AI-assisted triage. The AI returns a conservative **EMERGENCY / URGENT / ROUTINE / UNCLEAR** decision, key findings, red flags, and recommended next steps.

To enable real document-aware AI analysis:

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `OPENAI_API_KEY` to your server-side API key.
3. Optionally set `OPENAI_MODEL` (default: `gpt-4.1-mini`).
4. Start the backend with `npm start` from `backend/`.
5. Start the frontend with `npm run dev` from `frontend/`.

The API key is used only by the backend and is never exposed to the browser. If no key is configured, the app uses a clearly labeled conservative local safety fallback rather than pretending that AI analyzed the file.

**Important:** AI output is clinical decision support, not a diagnosis or a substitute for a qualified clinician. Emergency decisions should be verified by a clinician/emergency service.
