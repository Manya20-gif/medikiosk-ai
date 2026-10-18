// Demo-grade, rule-based keyword matching — NOT NLP/ML.
// Maps free-text patient input (English or Hindi) to a chief-complaint id.
// This is intentionally transparent and easy to audit, per the prototype's
// "controlled rule engine, not a black-box model" design goal.

const keywordMap = {
  chest_pain: ["chest pain", "chest", "सीने में दर्द", "सीना", "छाती में दर्द", "छाती"],
  fever: ["fever", "temperature", "बुखार", "ज्वर"],
  cough: ["cough", "cold", "खांसी", "खाँसी", "जुकाम"],
  headache: ["headache", "head pain", "सिरदर्द", "सिर दर्द"],
  abdominal_pain: ["stomach pain", "abdominal pain", "belly pain", "पेट दर्द", "पेट में दर्द"],
  breathlessness: [
    "breathless",
    "shortness of breath",
    "difficulty breathing",
    "सांस लेने में तकलीफ",
    "सांस फूलना",
  ],
  joint_pain: ["joint pain", "body pain", "जोड़ों में दर्द", "बदन दर्द"],
};

/**
 * Returns a matched chief-complaint id, or null if nothing matched.
 * Matching is case-insensitive substring matching against known phrases.
 */
export function matchChiefComplaint(freeText) {
  if (!freeText || !freeText.trim()) return null;
  const normalized = freeText.trim().toLowerCase();

  for (const [complaintId, phrases] of Object.entries(keywordMap)) {
    const isMatch = phrases.some((phrase) => normalized.includes(phrase.toLowerCase()));
    if (isMatch) return complaintId;
  }
  return null;
}
