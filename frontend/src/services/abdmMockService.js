// PHASE 10 — ABDM/FHIR Prototype Integration.
//
// MOCK ABDM GATEWAY. Every function here is a simulated network call
// (artificial delay + fabricated response) standing in for what a real
// integration with India's Ayushman Bharat Digital Mission sandbox/
// production APIs would look like.
//
// ABSOLUTE RULES FOR THIS FILE (see Phase 10 brief, Security Rules):
//   - NEVER call a real ABDM API or any external network endpoint.
//   - NEVER generate, store, or accept a real ABHA number.
//   - NEVER require or hard-code real ABDM credentials/API keys.
// Everything below is fabricated locally and clearly labelled as demo/
// sandbox data. Swapping this file for a real integration later should
// not require any caller (components/abdm/*) to change its call shape.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fictional ABHA-shaped identifier that cannot be mistaken for a real
 * 14-digit ABHA number — always prefixed and short.
 */
function randomDemoAbhaId() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ABHA-DEMO-${digits}`;
}

function randomDemoShareId() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `SHARE-DEMO-${digits}`;
}

/**
 * Simulates the ABDM sandbox gateway being reachable. Occasionally
 * "fails" on purpose so the UI's error-handling states are real and
 * demonstrable rather than theoretical (Phase 10 brief, section 14).
 */
export async function checkAbdmConnection() {
  await delay(350);
  const available = Math.random() > 0.08;
  if (!available) {
    const error = new Error("ABDM service unavailable. Demo mode remains available.");
    error.code = "ABDM_UNAVAILABLE";
    throw error;
  }
  return { status: "sandbox", message: "Connected to ABDM Sandbox (mock)." };
}

/**
 * Simulates linking a demo ABHA identity to the current patient record.
 * Never touches a real ABHA number.
 */
export async function linkAbha() {
  await checkAbdmConnection();
  await delay(600);
  return { abhaId: randomDemoAbhaId(), linkedAt: new Date().toISOString(), status: "linked (sandbox)" };
}

/**
 * Simulates fetching external health records via ABDM for a linked
 * demo ABHA. This prototype never actually connects to a real health
 * record source, so this always returns an empty, clearly-labelled
 * sandbox response.
 */
export async function fetchHealthRecords(abhaId) {
  await delay(500);
  return {
    abhaId,
    records: [],
    message: "Sandbox mode — no external ABDM health records are fetched in this prototype.",
  };
}

/**
 * Simulates a consent request/grant round-trip. `purpose` and
 * `dataCategories` are echoed back so the caller can log exactly what
 * was consented to.
 */
export async function requestConsent({ purpose, dataCategories = [] } = {}) {
  await delay(500);
  return {
    status: "granted",
    purpose,
    dataCategories,
    grantedAt: new Date().toISOString(),
    mode: "sandbox",
  };
}

/**
 * Simulates revoking a previously granted consent.
 */
export async function revokeConsent() {
  await delay(400);
  return { status: "revoked", revokedAt: new Date().toISOString() };
}

/**
 * Simulates sharing a (mock) FHIR bundle through the ABDM gateway.
 * Requires an already-generated bundle — never fabricates one itself.
 */
export async function shareHealthRecord({ bundle } = {}) {
  if (!bundle) {
    const error = new Error("No FHIR bundle available to share.");
    error.code = "NO_BUNDLE";
    throw error;
  }
  await checkAbdmConnection();
  await delay(700);
  return {
    shareId: randomDemoShareId(),
    sharedAt: new Date().toISOString(),
    status: "shared (demo)",
    resourceCount: bundle.entry?.length ?? 0,
  };
}
