<script setup lang="ts">
import { 
    ListOption, 
    PlBtnGroup, 
    PlDropdown,
    PlFileInput,
    PlTextField,
    PlAccordionSection,
} from '@platforma-sdk/ui-vue';
import { reactive, watch, computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

type LocalState = {
  vTab: "fromFile" | "fromBuiltIn";
  jTab: "fromFile" | "fromBuiltIn";
  dTab: "fromFile" | "fromBuiltIn";
  cTab: "fromFile" | "fromBuiltIn";
};

const state = reactive<LocalState>({
  vTab: "fromBuiltIn",
  jTab: "fromBuiltIn",
  dTab: "fromBuiltIn",
  cTab: "fromBuiltIn",
})

const vComputedTab = computed({
  get() {
    return state.vTab ?? (app.model.args.vFastaFile ? "fromFile" : "fromBuiltIn");
  },
  set(tab) {
    state.vTab = tab;
  },
});

const jComputedTab = computed({
  get() {
    return state.jTab ?? (app.model.args.jFastaFile ? "fromFile" : "fromBuiltIn");
  },
  set(tab) {
    state.jTab = tab;
  },
});

const dComputedTab = computed({
  get() {
    return state.dTab ?? (app.model.args.dFastaFile ? "fromFile" : "fromBuiltIn");
  },
  set(tab) {
    state.dTab = tab;
  },
});

const cComputedTab = computed({
  get() {
    return state.cTab ?? (app.model.args.cFastaFile ? "fromFile" : "fromBuiltIn");
  },
  set(tab) {
    state.cTab = tab;
  },
});

watch(vComputedTab, (newValue, oldValue)=>{
  if (newValue === "fromFile") {
    app.model.args.vSpecies = undefined;
  }
  if (newValue === "fromBuiltIn") {
    app.model.args.vFastaFile = undefined;
  }
})

watch(jComputedTab, (newValue, oldValue)=>{
  if (newValue === "fromFile") {
    app.model.args.jSpecies = undefined;
  }
  if (newValue === "fromBuiltIn") {
    app.model.args.jFastaFile = undefined;
  }
})

watch(dComputedTab, (newValue, oldValue)=>{
  if (newValue === "fromFile") {
    app.model.args.dSpecies = undefined;
  }
  if (newValue === "fromBuiltIn") {
    app.model.args.dFastaFile = undefined;
  }
})

watch(cComputedTab, (newValue, oldValue)=>{
  if (newValue === "fromFile") {
    app.model.args.cSpecies = undefined;
  }
  if (newValue === "fromBuiltIn") {
    app.model.args.cFastaFile = undefined;
  }
})

const speciesOptions = [
  { label: "Homo sapience", value: "hsa" },
  { label: "Mus musculus", value: "mmu" },
  { label: "Lama glama", value: "lama" },
  { label: "Alpaca", value: "alpaca" },
  { label: "Macaca fascicularis", value: "mfas" },
] as const satisfies ListOption [];

const chainOptions = [
    {label: "TRA", value: "TRA"},
    {label: "TRB", value: "TRB"},
    {label: "TRD", value: "TRD"},
    {label: "TRG", value: "TRG"},
    {label: "IGH", value: "IGH"},
    {label: "IGK", value: "IGK"},
    {label: "IGL", value: "IGL"},
] as const satisfies ListOption [];

const genesSourceOptions = [
  { label: "From built-in species", value: "fromBuiltIn" },
  { label: "From fasta file", value: "fromFile" }
] as const satisfies ListOption [];

const vGeneFeatureOptions = [
  {label: "V region", value: "VRegion"},
  {label: "V transcript", value: "VTranscript"}
] as const satisfies ListOption [];


</script>

<template>
  <PlTextField v-model="app.model.args.species" clearable label="Species" />
  <PlDropdown :options="chainOptions" v-model="app.model.args.chain" label="Select chain" />

  <PlBtnGroup :options="genesSourceOptions" v-model="vComputedTab" label="V segments source" />
  <PlDropdown
    v-if="vComputedTab === 'fromBuiltIn'"
    v-model="app.model.args.vSpecies"
    :options="speciesOptions"
    placeholder="Select species"
  />
  <PlFileInput
    v-if="vComputedTab === 'fromFile'"
    v-model="app.model.args.vFastaFile"
    file-dialog-title="Select fasta file"
    clearable="true"
  />
  
  <PlBtnGroup :options="genesSourceOptions" v-model="jComputedTab" label="J segments source" />
  <PlDropdown
    v-if="jComputedTab === 'fromBuiltIn'" 
    :options="speciesOptions"
    v-model="app.model.args.jSpecies"
    placeholder="Select species"
  />
  
  <PlFileInput
    v-if="jComputedTab === 'fromFile'"
    v-model="app.model.args.jFastaFile"
    file-dialog-title="Upload fasta"
    clearable="true"
  />


  <PlAccordionSection label="D and C segments source (optional)">
    <PlBtnGroup :options="genesSourceOptions" v-model="dComputedTab" label="D segments source" />
    <PlDropdown
      v-if="dComputedTab === 'fromBuiltIn'" 
      :options="speciesOptions"
      v-model="app.model.args.dSpecies"
      placeholder="Select species"
    />
    <PlFileInput
      v-if="dComputedTab === 'fromFile'"
      v-model="app.model.args.dFastaFile"
      file-dialog-title="Upload fasta"
      clearable="true"
    />
    <PlBtnGroup :options="genesSourceOptions" v-model="cComputedTab" label="C segments source" />
    <PlDropdown
      v-if="cComputedTab === 'fromBuiltIn'" 
      :options="speciesOptions"
      v-model="app.model.args.cSpecies"
      placeholder="Select species"
    />
    <PlFileInput
      v-if="cComputedTab === 'fromFile'"
      v-model="app.model.args.cFastaFile"
      file-dialog-title="Upload fasta"
      clearable="true"
    />
  </PlAccordionSection>
    
</template>