// PHASE 10 — ABDM/FHIR Prototype Integration.
//
// Modular FHIR service sitting between the Doctor Dashboard and the
// mock ABDM gateway (services/abdmMockService.js):
//
//   MediKiosk Frontend -> Backend/API Service (not present in this
//   prototype) -> FHIR Service Layer (this file) -> Mock ABDM Gateway
//
// This file only *shapes* a DoctorRecord (services/doctorService.js)
// into FHIR-style resources (utils/fhirMapper.js) after checking it
// with utils/fhirValidator.js. It never calls a real backend, a real
// FHIR server, or a real ABDM endpoint — everything here operates on
// data already computed elsewhere in the app.

import { validateRecordForFhir } from "../utils/fhirValidator.js";
import {
  createPatientResource,
  createEncounterResource,
  createConditionResource,
  createObservationResource,
  createMedicationStatementResource,
  createAllergyIntoleranceResource,
  createDocumentReferenceResource,
} from "../utils/fhirMapper.js";

export {
  createPatientResource,
  createEncounterResource,
  createConditionResource,
  createObservationResource,
  createMedicationStatementResource,
  createAllergyIntoleranceResource,
  createDocumentReferenceResource,
};

function toBundleEntry(resource) {
  return { fullUrl: `urn:medikiosk-demo:${resource.resourceType}/${resource.id}`, resource };
}

/**
 * Converts a DoctorRecord into a mock FHIR Bundle. Validates first —
 * if validation fails, no bundle is generated and the caller should
 * surface `errors` instead (per the Phase 10 error-handling brief).
 *
 * @param {object} record DoctorRecord (services/doctorService.js shape)
 * @returns {{ valid: boolean, errors: string[], warnings: string[], bundle: object|null }}
 */
export function createClinicalBundle(record) {
  const { valid, errors, warnings } = validateRecordForFhir(record);
  if (!valid) {
    return { valid: false, errors, warnings, bundle: null };
  }

  const resources = [
    createPatientResource(record),
    createEncounterResource(record),
    ...createConditionResource(record),
    ...createObservationResource(record),
    ...createMedicationStatementResource(record),
    ...createAllergyIntoleranceResource(record),
    ...createDocumentReferenceResource(record),
  ];

  const bundle = {
    resourceType: "Bundle",
    id: `bundle-${record.id}`,
    type: "collection",
    timestamp: new Date().toISOString(),
    meta: {
      tag: [
        {
          system: "https://medikiosk.demo/fhir/mock",
          code: "prototype",
          display: "ABDM/FHIR Prototype Integration — mock data, not connected to real ABDM",
        },
      ],
    },
    entry: resources.map(toBundleEntry),
  };

  return { valid: true, errors: [], warnings, bundle };
}
