---
"@platforma-open/milaboratories.mixcr-library-builder.model": patch
"@platforma-open/milaboratories.mixcr-library-builder.ui": patch
---

Compute the block subtitle without opening the block

The sidebar subtitle (species and chains) is computed by the model from the block
settings instead of being written into the settings each time the block is opened.
Opening the block no longer changes its arguments or marks it stale. Existing projects
keep the same subtitle text. The block has no trace label; the library column label is
unchanged.
