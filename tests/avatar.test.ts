import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { initialsOf, isPrompt } from "../src/lib/initials";

/**
 * Initials stand in for a staff photo until real ones are supplied, so the
 * failure mode is a customer-facing card showing something wrong or blank.
 * The cases below are the ones real staff lists actually contain.
 */

describe("initialsOf", () => {
  test("takes first and last initial", () => {
    assert.equal(initialsOf("Maria Alvarez"), "MA");
  });

  test("ignores middle names rather than cramming them in", () => {
    assert.equal(initialsOf("James Robert Whitfield"), "JW");
  });

  test("uses two letters when there is only one name", () => {
    assert.equal(initialsOf("Cher"), "CH");
  });

  test("survives extra whitespace", () => {
    assert.equal(initialsOf("  Derek   Shaw  "), "DS");
  });

  test("skips a leading honorific-like token that is not a letter", () => {
    // "Jr." style suffixes and stray punctuation should not become an initial.
    assert.equal(initialsOf("Ana - Lopez"), "AL");
  });

  test("returns empty for a nameless value rather than throwing", () => {
    assert.equal(initialsOf("   "), "");
    assert.equal(initialsOf(""), "");
  });
});

describe("isPrompt", () => {
  test("recognises the seeded editing prompts", () => {
    assert.equal(isPrompt("Add owner's name"), true);
    assert.equal(isPrompt("Your name here"), true);
    assert.equal(isPrompt("TBD"), true);
  });

  test("treats a real name as a real name", () => {
    assert.equal(isPrompt("Maria Alvarez"), false);
    // Guards against matching "Add" anywhere rather than at the start —
    // somebody surnamed Addison must not be treated as a placeholder.
    assert.equal(isPrompt("Grace Addison"), false);
    assert.equal(isPrompt("Adam Yourke"), false);
  });
});
