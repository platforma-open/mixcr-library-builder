<script setup lang="ts">
import { PlTabs, PlLogView } from '@platforma-sdk/ui-vue';
import { computed, ref, watch } from 'vue';
import { useApp } from '../app';

const app = useApp();

// Get the debug output which is a resource map with isComplete and data properties
const debugOutput = computed(() => app.model.outputs.debugOutput);

// Extract available chains from the resource map data
const availableChains = computed(() => {
  if (!debugOutput.value || !debugOutput.value.data) return [];
  // Extract chain names from the data array where each entry has key: [chainName]
  return debugOutput.value.data.map((entry: any) => entry.key[0]);
});

// Create tab options for each chain
const tabOptions = computed(() => {
  return availableChains.value.map(chain => ({
    label: chain,
    value: chain,
  }));
});

const activeTab = ref<string>();

// Set the first chain as active by default when tabs become available
watch(availableChains, (newChains) => {
  if (!activeTab.value && newChains.length > 0) {
    activeTab.value = newChains[0];
  }
}, { immediate: true });

// Get the log handle for the active chain
const activeLogHandle = computed(() => {
  if (!activeTab.value || !debugOutput.value || !debugOutput.value.data) return undefined;
  // Find the data entry that matches the active tab chain name
  const chainEntry = debugOutput.value.data.find((entry: any) => entry.key[0] === activeTab.value);
  return chainEntry?.value;
});
</script>

<template>
  <div v-if="availableChains.length > 0">
    <PlTabs 
      v-model="activeTab" 
      :options="tabOptions"
      style="margin-bottom: 16px;"
    />
    <PlLogView 
      v-if="activeLogHandle" 
      :log-handle="activeLogHandle" 
      :label="`${activeTab} Chain Logs`"
    />
  </div>
  <div v-else>
    <p>No logs available yet. Logs will appear once the library building process starts.</p>
  </div>
</template>