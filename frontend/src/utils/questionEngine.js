import { chestPainTree } from "../data/questionTrees/chestPain.js";
import { feverTree } from "../data/questionTrees/fever.js";
import { coughTree } from "../data/questionTrees/cough.js";
import { headacheTree } from "../data/questionTrees/headache.js";
import { abdominalPainTree } from "../data/questionTrees/abdominalPain.js";
import { breathlessnessTree } from "../data/questionTrees/breathlessness.js";
import { genericTree } from "../data/questionTrees/generic.js";

const treesByComplaint = {
  chest_pain: chestPainTree,
  fever: feverTree,
  cough: coughTree,
  headache: headacheTree,
  abdominal_pain: abdominalPainTree,
  breathlessness: breathlessnessTree,
};

/**
 * Every "engine" function here is a small, transparent, deterministic
 * lookup — deliberately not an LLM. This keeps the clinical question flow
 * auditable, which matters for a medical prototype: any clinician can read
 * the tree in data/questionTrees and know exactly what will be asked next.
 */

export function getTreeForComplaint(complaintId) {
  return treesByComplaint[complaintId] ?? genericTree;
}

export function getQuestion(tree, questionId) {
  return tree.questions[questionId] ?? null;
}

export function getFirstQuestion(tree) {
  return getQuestion(tree, tree.start);
}

/**
 * Determines the next question id given the current question and the
 * answer just given. Handles single-branch ("string") and per-answer
 * ("object map") routing. multi_choice answers are arrays, so they always
 * use the map's `_default` key since branching on a combination of
 * checkboxes isn't meaningful for this rule engine.
 */
export function getNextQuestionId(question, answerValue) {
  const { next } = question;
  if (typeof next === "string") return next;
  if (next && typeof next === "object") {
    if (Array.isArray(answerValue)) {
      return next._default ?? "END";
    }
    return next[answerValue] ?? next._default ?? "END";
  }
  return "END";
}

export function isEnd(questionId) {
  return !questionId || questionId === "END";
}
