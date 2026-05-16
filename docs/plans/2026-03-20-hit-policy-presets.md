# Hit Policy Presets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.md (in project knowledge) to implement this plan task-by-task.

**Goal:** Turn multi-hit behavior into named roster/content presets for normals and specials instead of only inline attack metadata.

**Architecture:** Add a reusable preset catalog in the fight layer, let character content reference those preset identifiers, and resolve them at runtime through the existing hit-confirm ownership path. Keep explicit inline `hitPolicy` support as an override path so tests and future bespoke moves still work.

**Tech Stack:** TypeScript, Vitest, Vite, Biome.

---

### Completed task summary

1. Wrote failing tests for preset-backed normal and special attacks.
2. Verified red by running the focused Vitest file.
3. Added a named hit-policy preset catalog and runtime resolver.
4. Extended character content so normals and specials can reference preset IDs.
5. Wired fighter attack creation and special creation to preserve preset-backed hit policy metadata.
6. Re-ran focused tests, then full lint/test/typecheck/build verification.
