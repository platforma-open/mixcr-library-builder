# @platforma-open/milaboratories.mixcr-library-builder.ui

## 2.1.1

### Patch Changes

- 7fcf8a1: Migrate the block onto the structurer (`block-tools structure`) and complete the full SDK upgrade it requires. Adopt the canonical project skeleton (tsconfig, oxlint/oxfmt configs, turbo `check`/`fmt` task graph, block index, workflow format scaffolding), unify per-module scripts under `check` (type-check + lint + fmt-check) and `fmt`, move `typescript`/`@types/node` to peer dependencies, and drop the retired eslint config tooling (`@platforma-sdk/eslint-config` + its catalog entry, per-package `eslint.config.mjs`, `lint` scripts). The catalog moves through the SDK majors: workflow-tengo 5→6, tengo-builder 2→4, model/ui-vue 1.53/1.54→1.79, block-tools 2.6→2.11, plus ts-builder/ts-configs/package-builder. `vue` is pinned to the ui-vue-aligned version automatically.

  Author-code fixes required by the upgrade: declare `@milaboratories/helpers` as a direct model dependency (resolves TS2742 on the inferred `model` export, surfaced because the model uses `parseResourceMap`/`createPlDataTableV2`), and drop the obsolete `@platforma-sdk/ui-vue/styles` import from `ui/src/main.ts` (ui-vue no longer exposes that subpath; styles ship from the main entry). Source files reformatted with oxfmt. No user-facing behavior change.

- Updated dependencies [7fcf8a1]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.1.1

## 2.1.0

### Minor Changes

- ece19be: Support custom block title and running status

### Patch Changes

- Updated dependencies [ece19be]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.1.0

## 2.0.3

### Patch Changes

- 03cfc91: technical release
- 7b58a02: technical release
- fff533b: technical release
- f2284a8: technical release
- 423ce2f: technical release
- Updated dependencies [03cfc91]
- Updated dependencies [7b58a02]
- Updated dependencies [fff533b]
- Updated dependencies [f2284a8]
- Updated dependencies [423ce2f]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [e0e933d]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.0.2

## 2.0.1

### Patch Changes

- 4b22540: updating dependencies
- Updated dependencies [4b22540]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.0.1

## 2.0.0

### Major Changes

- 5a071f6: Multiple chains reference builder, updated dependecies

### Patch Changes

- Updated dependencies [5a071f6]
  - @platforma-open/milaboratories.mixcr-library-builder.model@2.0.0

## 1.3.0

### Minor Changes

- 2f47cb1: SDK upgrade

### Patch Changes

- Updated dependencies [2f47cb1]
  - @platforma-open/milaboratories.mixcr-library-builder.model@1.3.0

## 1.2.1

### Patch Changes

- dac9963: typescript version to 5.5.4

## 1.2.0

### Minor Changes

- 44a1d87: remove logo file

### Patch Changes

- Updated dependencies [44a1d87]
  - @platforma-open/milaboratories.mixcr-library-builder.model@1.2.0

## 1.1.0

### Minor Changes

- 84adbca: Corrections and improvements

### Patch Changes

- Updated dependencies [84adbca]
  - @platforma-open/milaboratories.mixcr-library-builder.model@1.1.0

## 1.0.2

### Patch Changes

- d46bab1: chore: change npmjs repo
- Updated dependencies [d46bab1]
  - @platforma-open/milaboratories.mixcr-library-builder.model@1.0.2

## 1.0.1

### Patch Changes

- 344b5fc: chore: inital release
- Updated dependencies [344b5fc]
  - @platforma-open/milaboratories.mixcr-library-builder.model@1.0.1
