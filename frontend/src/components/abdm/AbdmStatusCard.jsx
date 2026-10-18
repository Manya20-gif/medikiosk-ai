import { useState } from "react";
import {
  ShieldCheck,
  Loader2,
  FileJson,
  Send,
  Undo2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import * as abdmMockService from "../../services/abdmMockService.js";
import { createClinicalBundle } from "../../services/fhirService.js";
import AbdmDemoControls from "./AbdmDemoControls.jsx";
import ConsentCard from "./ConsentCard.jsx";
import ConsentAuditLog from "./ConsentAuditLog.jsx";
import FhirBundleViewer from "./FhirBundleViewer.jsx";

/**
 * Default per-patient ABDM/FHIR demo state. Lives alongside the other
 * per-patient doctor interactions (notes, status, verification) in
 * DoctorDashboard.jsx's `interactions` state, so switching patients and
 * back preserves exactly where the demo flow was left — same pattern
 * already used for the rest of the dashboard.
 */
export function createDefaultAbdmState() {
  return {
    abha: { connected: false, abhaId: null, linkedAt: null, linking: false, error: null },
    consent: { status: "none", requesting: false, error: null },
    fhirBundle: null,
    bundleErrors: [],
    bundleGenerating: false,
    share: { status: "none", shareId: null, sharedAt: null, sharing: false, error: null },
    auditLog: [],
  };
}

function nextAuditEntry(icon, text) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: new Date().toISOString(), icon, text };
}

const ABDM_STATUS_LABEL = { none: "Prototype / Mock", linked: "Sandbox — ABHA linked" };

/**
 * PHASE 10 — "Digital Health Integration" section of the Doctor
 * Dashboard. Clearly labelled "ABDM/FHIR Prototype Integration"
 * throughout. Composes the ABHA demo connect flow, FHIR bundle
 * generation/viewing, consent management, and the consent audit log —
 * all backed by mock services (fhirService.js / abdmMockService.js)
 * that never touch real ABDM infrastructure or real patient data.
 */
export default function AbdmStatusCard({ record, abdm, onUpdateAbdm }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const logActivity = (icon, text) => {
    onUpdateAbdm({ auditLog: [...abdm.auditLog, nextAuditEntry(icon, text)] });
  };

  const handleConnectAbha = async () => {
    setActionError(null);
    onUpdateAbdm({ abha: { ...abdm.abha, linking: true, error: null } });
    try {
      const result = await abdmMockService.linkAbha();
      onUpdateAbdm({
        abha: { connected: true, abhaId: result.abhaId, linkedAt: result.linkedAt, linking: false, error: null },
      });
      logActivity("✓", `Demo ABHA connected (${result.abhaId})`);
    } catch (err) {
      onUpdateAbdm({ abha: { ...abdm.abha, linking: false, error: err.message } });
    }
  };

  const handleAllowConsent = async () => {
    setActionError(null);
    onUpdateAbdm({ consent: { ...abdm.consent, requesting: true, error: null } });
    try {
      const result = await abdmMockService.requestConsent({
        purpose: "Clinical consultation and record continuity",
        dataCategories: ["Clinical history", "Investigations", "Medications", "Medical documents", "Clinical summary"],
      });
      onUpdateAbdm({ consent: { status: result.status, requesting: false, error: null } });
      logActivity("✓", "Consent granted — Clinical consultation and record continuity");
    } catch (err) {
      onUpdateAbdm({ consent: { ...abdm.consent, requesting: false, error: err.message } });
    }
  };

  const handleDeclineConsent = () => {
    // No API call on decline — sharing must never be simulated without
    // an explicit grant.
    onUpdateAbdm({ consent: { status: "declined", requesting: false, error: null } });
    logActivity("✗", "Consent declined");
  };

  const handleRevokeConsent = async () => {
    setActionError(null);
    try {
      await abdmMockService.revokeConsent();
      onUpdateAbdm({
        consent: { status: "revoked", requesting: false, error: null },
        share: { status: "none", shareId: null, sharedAt: null, sharing: false, error: null },
      });
      logActivity("↩", "Consent revoked");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleViewBundle = () => {
    setActionError(null);
    onUpdateAbdm({ bundleGenerating: true });
    const result = createClinicalBundle(record);
    onUpdateAbdm({
      bundleGenerating: false,
      fhirBundle: result.bundle,
      bundleErrors: result.errors,
    });
    if (result.valid) {
      logActivity("✓", "FHIR Bundle generated");
      setViewerOpen(true);
    }
  };

  const handleSimulateShare = async () => {
    setActionError(null);
    if (abdm.consent.status !== "granted") {
      setActionError("Sharing cancelled because consent was not granted.");
      return;
    }
    if (!abdm.fhirBundle) {
      setActionError("Generate the FHIR Bundle first (View FHIR Bundle) before sharing.");
      return;
    }
    onUpdateAbdm({ share: { ...abdm.share, sharing: true, error: null } });
    try {
      const result = await abdmMockService.shareHealthRecord({ bundle: abdm.fhirBundle });
      onUpdateAbdm({
        share: { status: "shared", shareId: result.shareId, sharedAt: result.sharedAt, sharing: false, error: null },
      });
      logActivity("✓", "Demo record shared");
    } catch (err) {
      onUpdateAbdm({ share: { ...abdm.share, sharing: false, error: err.message } });
    }
  };

  const fhirStatusLabel = abdm.fhirBundle ? "FHIR Bundle Ready ✓" : "Not generated";
  const consentStatusLabel =
    { none: "Not requested", granted: "Granted", declined: "Declined", revoked: "Revoked" }[abdm.consent.status] ??
    "Not requested";
  const healthRecordLabel =
    abdm.share.status === "shared"
      ? "Shared (demo)"
      : abdm.consent.status === "granted" && abdm.fhirBundle
      ? "Ready for simulated sharing"
      : "Not ready";

  return (
    <div className="doc-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-primary" />
          <h2 className="text-base font-bold text-ink">Digital Health Integration</h2>
          <span className="doc-badge bg-accent-light text-accent-dark">ABDM/FHIR Prototype Integration</span>
        </div>
        <AbdmDemoControls abha={abdm.abha} onConnect={handleConnectAbha} />
      </div>
      {abdm.abha.error && <p className="mt-2 text-xs font-medium text-alert">{abdm.abha.error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">ABDM Status</p>
          <p className="mt-1 text-sm font-bold text-ink">
            {abdm.abha.connected ? ABDM_STATUS_LABEL.linked : ABDM_STATUS_LABEL.none}
          </p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">FHIR Status</p>
          <p className="mt-1 text-sm font-bold text-ink">{fhirStatusLabel}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Consent Status</p>
          <p className="mt-1 text-sm font-bold text-ink">{consentStatusLabel}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Health Record</p>
          <p className="mt-1 text-sm font-bold text-ink">{healthRecordLabel}</p>
        </div>
      </div>

      {abdm.bundleErrors.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-alert/30 bg-alert-light px-3 py-2 text-xs text-alert">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to create FHIR resource. Please review the patient information.</p>
            <ul className="mt-1 list-disc pl-4">
              {abdm.bundleErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {actionError && <p className="mt-3 text-xs font-medium text-alert">{actionError}</p>}
      {abdm.share.status === "shared" && (
        <p className="mt-3 text-xs font-medium text-success">
          Simulated sharing complete — reference {abdm.share.shareId}. This prototype uses simulated ABDM
          integration and does not connect to real health records.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleViewBundle} disabled={abdm.bundleGenerating} className="doc-btn-secondary">
          {abdm.bundleGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileJson size={14} />}
          View FHIR Bundle
        </button>
        <button
          type="button"
          onClick={handleAllowConsent}
          disabled={abdm.consent.requesting || abdm.consent.status === "granted"}
          className="doc-btn-secondary"
        >
          {abdm.consent.requesting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Request Demo Consent
        </button>
        <button
          type="button"
          onClick={handleSimulateShare}
          disabled={abdm.share.sharing || abdm.consent.status !== "granted" || !abdm.fhirBundle}
          className="doc-btn-primary"
        >
          {abdm.share.sharing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Simulate Share
        </button>
        <button type="button" onClick={handleRevokeConsent} disabled={abdm.consent.status !== "granted"} className="doc-btn-secondary">
          <Undo2 size={14} />
          Revoke Consent
        </button>

        <button
          type="button"
          onClick={() => setDetailsOpen((prev) => !prev)}
          className="doc-btn-ghost ml-auto"
        >
          {detailsOpen ? "Hide details" : "Consent details & activity"}
          {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {detailsOpen && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ConsentCard
            consent={abdm.consent}
            onAllow={handleAllowConsent}
            onDecline={handleDeclineConsent}
            onRevoke={handleRevokeConsent}
          />
          <ConsentAuditLog entries={abdm.auditLog} />
        </div>
      )}

      <p className="mt-4 text-[11px] leading-snug text-muted">
        Your health information is shared only with your consent. This prototype uses simulated ABDM integration
        and does not connect to real health records.
      </p>

      {viewerOpen && <FhirBundleViewer bundle={abdm.fhirBundle} onClose={() => setViewerOpen(false)} />}
    </div>
  );
}
