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
import { reactive, watch, computed, ref } from 'vue';
import { useApp } from '../app'; // Assuming this path is correct
import { ImportFileHandle, getFileNameFromHandle } from '@platforma-sdk/model'; // Assuming this path is correct
import { validateFastaFile, type FastaValidationResult } from '../utils/fastaValidator';

const app = useApp();

// Validation state management
const validationState = ref<Record<string, FastaValidationResult>>({});

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
  { label: "Homo sapiens", value: "hsa" },
  { label: "Mus musculus", value: "mmu" },
  { label: "Lama glama", value: "lama" },
  { label: "Alpaca", value: "alpaca" },
  { label: "Macaca fascicularis", value: "mfas" },
  { label: "Chicken", value: "gallus" },
  { label: "Macaca mulatta", value: "mmul" },
  { label: "Rabbit", value: "rabbit" },
  { label: "Rat", value: "rat" },
  { label: "Sheep", value: "sheep" },
  { label: "Spalax", value: "spalax" },
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

// Map of species to their available chains
const speciesInBuiltInHasChains: Record<string, string[]> = {
  hsa: ['IGH', 'IGL', 'IGK', 'TRA', 'TRB', 'TRD', 'TRG'], // Human
  mmu: ['IGH', 'IGL', 'IGK', 'TRA', 'TRB', 'TRD', 'TRG'], // Mouse
  lama: ['IGH', 'IGK', 'IGL'], // Lama glama
  alpaca: ['IGH'], // Alpaca
  mfas: ['TRA', 'TRB', 'TRD'], // Macaca fascicularis
  gallus: ['IGH'], // Chicken
  mmul: ['IGH', 'TRA', 'TRB', 'TRD'], // Macaca mulatta
  rabbit: ['IGH', 'IGK', 'IGL'], // Rabbit
  rat: ['TRA', 'TRB', 'TRD'], // Rat
  sheep: ['IGH', 'IGK', 'IGL'], // Sheep
  spalax: ['IGH', 'TRA', 'TRB', 'TRD'], // Spalax
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
const handleFastaFileUpdate = async (chain: string, seg: typeof segments[number], newFile: ImportFileHandle | undefined) => {
  if (config[chain]?.[seg]) {
    if (newFile !== undefined) { // If a file is selected
      config[chain][seg].sourceType = 'fasta'; // Ensure sourceType is 'fasta'
      config[chain][seg].builtInSpecies = undefined; // Clear species
      
      // Validate the FASTA file using Platforma SDK
      const validationKey = `${chain}-${seg}`;
      
      // Immediate basic validation (file extension, etc.) using Platforma SDK
      const fileName = getFileNameFromHandle(newFile);
      const hasValidExtension = fileName.toLowerCase().match(/\.(fasta|fa|fas)$/);
      
      if (!hasValidExtension) {
        validationState.value[validationKey] = {
          isValid: false,
          error: `File must have .fasta, .fa, or .fas extension. Found: ${fileName}`
        };
        return;
      }
      
      // Set initial pending state
      validationState.value[validationKey] = {
        isValid: false,
        error: 'Validating file content...'
      };
      
      try {
        // Cast to LocalImportFileHandle like in immune-assay-data
        const result = await validateFastaFile(newFile as any);
        validationState.value[validationKey] = result;
      } catch (error) {
        validationState.value[validationKey] = {
          isValid: false,
          error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    } else {
      // File was cleared, remove validation state
      const validationKey = `${chain}-${seg}`;
      delete validationState.value[validationKey];
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
  
  // Filter species options to only include species that have the selected chain
  return speciesOptions.filter(species => 
    speciesInBuiltInHasChains[species.value]?.includes(chain)
  );
};

// Helper function to get validation result for a specific chain/segment
const getValidationResult = (chain: string, seg: string): FastaValidationResult | undefined => {
  return validationState.value[`${chain}-${seg}`];
};

// Helper function to get error message for PlFileInput
const getFileError = (chain: string, seg: string): string | undefined => {
  const result = getValidationResult(chain, seg);
  return result?.isValid === false ? result.error : undefined;
};

// Helper function to get warnings message
const getWarningsMessage = (chain: string, seg: string): string | undefined => {
  const result = getValidationResult(chain, seg);
  if (result?.isValid && result.warnings?.length) {
    return `Warnings: ${result.warnings.join('; ')}`;
  }
  return undefined;
};

// Watch for file upload completion and trigger validation
watch(progresses, (newProgresses, oldProgresses) => {
  for (const [fileHandle, progress] of Object.entries(newProgresses)) {
    const oldProgress = oldProgresses?.[fileHandle];
    
    // Check if file just finished uploading
    if (progress.done && (!oldProgress || !oldProgress.done)) {
      // Find which chain/segment this file belongs to and re-validate
      for (const [chain, chainConfig] of Object.entries(config)) {
        for (const [seg, segConfig] of Object.entries(chainConfig)) {
          if (segConfig.fastaFile === fileHandle) {
            handleFastaFileUpdate(chain, seg as any, segConfig.fastaFile);
            break;
          }
        }
      }
    }
  }
}, { deep: true });

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
            :extensions="['fasta','fa','fas']"
            label="FASTA file for segment"
            :error="getFileError(chain, seg)"
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
          <template v-if="config[chain]?.[seg]?.sourceType === 'fasta'">
            <PlFileInput
              v-model="config[chain][seg].fastaFile"
              :progress="progresses[config[chain]?.[seg]?.fastaFile ?? '']"
              file-dialog-title="Select FASTA file"
              :extensions="['fasta','fa','fas']"
              label="FASTA file for segment"
              :error="getFileError(chain, seg)"
              clearable
              @update:model-value="(newFile) => handleFastaFileUpdate(chain, seg, newFile)"
            />
          </template>
        </template>
      </template>
    </PlAccordionSection>
  </template>

</template>