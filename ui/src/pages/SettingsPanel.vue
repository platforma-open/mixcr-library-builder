<script setup lang="ts">
import {
    ListOption,
    PlBtnGroup,
    PlDropdown,
    PlFileInput,
    PlTextField,
    PlAccordionSection,
    PlDropdownMulti,
} from '@platforma-sdk/ui-vue'; // Assuming this is the correct import path
import { reactive, watch, computed } from 'vue';
import { useApp } from '../app'; // Assuming this path is correct
import { ImportFileHandle } from '@platforma-sdk/model'; // Assuming this path is correct

const app = useApp();

const progresses = computed(() => {
  const fileImports = app.model.outputs.fileImports ?? {};
  return Object.fromEntries(
    Object.entries(fileImports).map(([handle, progress]) => [
      handle,
      {
        done: progress.done,
        isUpload: progress.isUpload,
        status: progress.status
      }
    ])
  );
});

const speciesOptions = [
  { label: "Homo sapiens", value: "hsa" }, // Corrected spelling
  { label: "Mus musculus", value: "mmu" },
  { label: "Lama glama", value: "lama" },
  { label: "Alpaca", value: "alpaca" },
  { label: "Macaca fascicularis", value: "mfas" },
] as const satisfies ListOption[];

const chainOptions = computed(() => {
  const chains = [
    {label: "TRA", value: "TRA"},
    {label: "TRB", value: "TRB"},
    {label: "TRG", value: "TRG"},
    {label: "TRD", value: "TRD"},
    {label: "IGH", value: "IGH"},
    {label: "IGK", value: "IGK"},
    {label: "IGL", value: "IGL"},
  ] as const satisfies ListOption[];
  return [...chains];
});

const chainsModel = computed({
  get: () => (app.model.args.chains ?? []),
  set: (value) => {
    app.model.args.chains = value ?? [];
  },
});

const segments = ['V', 'D', 'J', 'C'] as const;
const mainSegments = ['V', 'J'] as const;
const optionalSegments = ['D', 'C'] as const;

const vRegionOptions = [
  { label: "V transcript", value: "VTranscript" },
  { label: "V region", value: "VRegion" }
] as const satisfies ListOption[];

const chainSegments: Record<string, readonly (typeof segments[number])[]> = {
  TRA: ['V', 'J', 'C'],
  TRB: ['V', 'D', 'J', 'C'],
  TRG: ['V', 'J', 'C'],
  TRD: ['V', 'D', 'J', 'C'],
  IGH: ['V', 'D', 'J', 'C'],
  IGK: ['V', 'J', 'C'],
  IGL: ['V', 'J', 'C']
} as const;

type SourceType = 'built-in' | 'fasta';
interface SegmentConfig {
  sourceType: SourceType;
  builtInSpecies: string | undefined;      // only if sourceType==='built-in'
  fastaFile: ImportFileHandle | undefined; // only if sourceType==='fasta'
  vRegionType?: "VTranscript" | "VRegion"; // only for V segment when sourceType==='fasta'
}

// Local reactive state for configurations
const config = reactive<Record<string, Record<typeof segments[number], SegmentConfig>>>(
  // Initialize from existing chainConfigs if they exist
  JSON.parse(JSON.stringify(app.model.args.chainConfigs || {}))
);

// Initialize or update config based on selected chains
watch(chainsModel, (newChains, oldChains) => {
  // Remove configurations for unselected chains
  const oldChainsSet = new Set(oldChains ?? []);
  const newChainsSet = new Set(newChains);

  for (const chain of oldChainsSet) {
    if (!newChainsSet.has(chain)) {
      delete config[chain];
    }
  }

  // Add default configurations for newly selected chains
  newChains.forEach(chain => {
    if (!config[chain]) {
      config[chain] = chainSegments[chain].reduce((acc, seg) => {
        acc[seg] = {
          sourceType: 'built-in', // Default to built-in
          builtInSpecies: undefined,
          fastaFile: undefined,
          ...(seg === 'V' ? { vRegionType: 'VRegion' } : {}) // Default V region type
        };
        return acc;
      }, {} as Record<typeof segments[number], SegmentConfig>);
    }
  });
}, { immediate: true });


// Watch local 'config' to update the global app model
watch(config, (newConfig) => {
  app.model.args.chainConfigs = JSON.parse(JSON.stringify(newConfig));
}, { deep: true });


const genesSourceOptions = [
  { label: "From built-in species", value: "built-in" },
  { label: "From fasta file", value: "fasta" }
] as const satisfies ListOption[];

// const vGeneFeatureOptions = [ // Not used in the provided template snippet
//   {label: "V region", value: "VRegion"},
//   {label: "V transcript", value: "VTranscript"}
// ] as const satisfies ListOption [];


// Handler for when the source type (PlBtnGroup) changes
// The v-model on PlBtnGroup already updates config[chain][seg].sourceType
const handleSourceTypeUpdate = (chain: string, seg: typeof segments[number], newSourceType: SourceType) => {
  if (config[chain]?.[seg]) {
    if (newSourceType === 'fasta') {
      config[chain][seg].builtInSpecies = undefined; // Clear species if switching to FASTA
    } else if (newSourceType === 'built-in') {
      config[chain][seg].fastaFile = undefined; // Clear FASTA file if switching to built-in
    }
  }
};

// Handler for when the FASTA file input (PlFileInput) changes
// The v-model on PlFileInput already updates config[chain][seg].fastaFile
const handleFastaFileUpdate = (chain: string, seg: typeof segments[number], newFile: ImportFileHandle | undefined) => {
  if (config[chain]?.[seg]) {
    if (newFile !== undefined) { // If a file is selected
      config[chain][seg].sourceType = 'fasta'; // Ensure sourceType is 'fasta'
      config[chain][seg].builtInSpecies = undefined; // Clear species
    }
    // If newFile is undefined (file cleared), sourceType remains 'fasta'.
    // The user must explicitly switch sourceType using the PlBtnGroup if they want to use built-in.
  }
};

// Handler for when the species dropdown (PlDropdown) changes
// The v-model on PlDropdown already updates config[chain][seg].builtInSpecies
const handleSpeciesUpdate = (chain: string, seg: typeof segments[number], newSpecies: string | undefined) => {
  if (config[chain]?.[seg]) {
    if (newSpecies !== undefined) { // If a species is selected
      config[chain][seg].sourceType = 'built-in'; // Ensure sourceType is 'built-in'
      config[chain][seg].fastaFile = undefined; // Clear FASTA file
    }
    // If newSpecies is undefined (species cleared), sourceType remains 'built-in'.
  }
};

// Computed property to get species options for the dropdown
const getSpeciesOptions = (chain: string, seg: typeof segments[number]) => {
  // This dropdown is only visible if config[chain][seg].sourceType === 'built-in'.
  // In that state, config[chain][seg].fastaFile should be undefined due to our handlers.
  // This check is an additional safeguard.
  if (config[chain]?.[seg]?.fastaFile) {
    return []; // If a FASTA file is somehow set, offer no species options.
  }
  return speciesOptions;
};

</script>

<template>
  <PlTextField
    v-model="app.model.args.species"
    clearable
    label="Species"
    placeholder="Type species name"
  />
  <PlDropdownMulti v-model="chainsModel" label="Chains" :options="chainOptions" />

  <template
    v-for="chain in chainsModel"
    :key="chain"
  >
  
    <h3>{{ chain }} chain</h3>

    <!-- Always show V and J segments -->
    <template v-for="seg in mainSegments" :key="seg">
        <PlBtnGroup
          :options="genesSourceOptions"
          v-model="config[chain][seg].sourceType"
          :label="`${seg} segment source`"
          @update:model-value="(newSourceType) => handleSourceTypeUpdate(chain, seg, newSourceType)"
        />
        <PlDropdown
          v-if="config[chain]?.[seg]?.sourceType === 'built-in'"
          v-model="config[chain][seg].builtInSpecies"
          :options="getSpeciesOptions(chain, seg)"
          placeholder="Select species"
          label="Species for segment"
          clearable
          @update:model-value="(newSpecies) => handleSpeciesUpdate(chain, seg, newSpecies)"
        />
        <template v-if="config[chain]?.[seg]?.sourceType === 'fasta'">
          <PlFileInput
            v-model="config[chain][seg].fastaFile"
            :progress="progresses[config[chain]?.[seg]?.fastaFile ?? '']"
            file-dialog-title="Select FASTA file"
            :extensions="['fasta','fa']"
            label="FASTA file for segment"
            clearable
            @update:model-value="(newFile) => handleFastaFileUpdate(chain, seg, newFile)"
          />
          <PlDropdown
            v-if="seg === 'V'"
            v-model="config[chain][seg].vRegionType"
            :options="vRegionOptions"
            label="Covered region"
          />
        </template>
      </template>

    <!-- Show D and C segments in accordion if they exist for this chain -->
    <PlAccordionSection 
      v-if="chainSegments[chain].some(s => optionalSegments.includes(s as any))"
      :label="`${chainSegments[chain].filter(s => s === 'D' || s === 'C').join(' and ')} segments source (optional)`"
    >
      <template v-for="seg in chainSegments[chain]" :key="seg">
        <template v-if="optionalSegments.includes(seg as any)">
          <PlBtnGroup
            :options="genesSourceOptions"
            v-model="config[chain][seg].sourceType"
            :label="`${seg} segment source`"
            @update:model-value="(newSourceType) => handleSourceTypeUpdate(chain, seg, newSourceType)"
          />
          <PlDropdown
            v-if="config[chain]?.[seg]?.sourceType === 'built-in'"
            v-model="config[chain][seg].builtInSpecies"
            :options="getSpeciesOptions(chain, seg)"
            placeholder="Select species"
            label="Species for segment"
            clearable
            @update:model-value="(newSpecies) => handleSpeciesUpdate(chain, seg, newSpecies)"
          />
          <PlFileInput
            v-if="config[chain]?.[seg]?.sourceType === 'fasta'"
            v-model="config[chain][seg].fastaFile"
            :progress="progresses[config[chain]?.[seg]?.fastaFile ?? '']"
            file-dialog-title="Select FASTA file"
            :extensions="['fasta','fa']"
            label="FASTA file for segment"
            clearable
            @update:model-value="(newFile) => handleFastaFileUpdate(chain, seg, newFile)"
          />
        </template>
      </template>
    </PlAccordionSection>
  </template>

</template>