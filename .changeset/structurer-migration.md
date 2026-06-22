---
"@platforma-open/milaboratories.mixcr-library-builder.model": patch
"@platforma-open/milaboratories.mixcr-library-builder.ui": patch
"@platforma-open/milaboratories.mixcr-library-builder.workflow": patch
"@platforma-open/milaboratories.mixcr-library-builder.software": patch
---

Migrate the block onto the structurer (`block-tools structure`) and complete the full SDK upgrade it requires. Adopt the canonical project skeleton (tsconfig, oxlint/oxfmt configs, turbo `check`/`fmt` task graph, block index, workflow format scaffolding), unify per-module scripts under `check` (type-check + lint + fmt-check) and `fmt`, move `typescript`/`@types/node` to peer dependencies, and drop the retired eslint config tooling (`@platforma-sdk/eslint-config` + its catalog entry, per-package `eslint.config.mjs`, `lint` scripts). The catalog moves through the SDK majors: workflow-tengo 5→6, tengo-builder 2→4, model/ui-vue 1.53/1.54→1.79, block-tools 2.6→2.11, plus ts-builder/ts-configs/package-builder. `vue` is pinned to the ui-vue-aligned version automatically.

Author-code fixes required by the upgrade: declare `@milaboratories/helpers` as a direct model dependency (resolves TS2742 on the inferred `model` export, surfaced because the model uses `parseResourceMap`/`createPlDataTableV2`), and drop the obsolete `@platforma-sdk/ui-vue/styles` import from `ui/src/main.ts` (ui-vue no longer exposes that subpath; styles ship from the main entry). Source files reformatted with oxfmt. No user-facing behavior change.