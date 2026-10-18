import { ayushSections } from "../data/ayushQuestions.js";

/**
 * Small, transparent helpers for stepping through the AYUSH case-taking
 * questionnaire. Deliberately linear (no branching) and deterministic —
 * same design philosophy as utils/questionEngine.js: a clinician can read
 * data/ayushQuestions.js and know exactly what will be asked, in what
 * order, with no hidden logic.
 */

export function getSections() {
  return ayushSections;
}

export function getSection(sectionId) {
  return ayushSections.find((section) => section.id === sectionId) ?? null;
}

export function getSectionIndex(sectionId) {
  return ayushSections.findIndex((section) => section.id === sectionId);
}

export function getQuestionInSection(sectionId, questionId) {
  const section = getSection(sectionId);
  return section?.questions.find((q) => q.id === questionId) ?? null;
}

export function totalQuestionCount() {
  return ayushSections.reduce((sum, section) => sum + section.questions.length, 0);
}

/**
 * Flattens every section into a single ordered list of
 * { sectionId, sectionIndex, questionIndexInSection, question } entries,
 * so the case-taking page can move forward/back across section
 * boundaries with one simple pointer instead of juggling two indices.
 */
export function flattenQuestions() {
  const flat = [];
  ayushSections.forEach((section, sectionIndex) => {
    section.questions.forEach((question, questionIndexInSection) => {
      flat.push({ sectionId: section.id, sectionIndex, questionIndexInSection, question });
    });
  });
  return flat;
}
