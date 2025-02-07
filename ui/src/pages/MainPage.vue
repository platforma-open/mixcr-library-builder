<script setup lang="ts">
import { PlBlockPage, PlEditableTitle, PlBtnGhost, PlSlideModal, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import SettingsPanel from './SettingsPanel.vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

//const reportContent = computed(
//  () => ReactiveFileContent.getContentString(app.model.outputs.debugOutput?)
//);

//const data = reactive({
//  settingsOpen: false,
//});

</script>

<template>
  <PlBlockPage>
    <template #title>
      <PlEditableTitle max-width="600px" :max-length="40" v-model="app.model.ui.blockTitle" />
    </template>
    <template #append>
      <PlBtnGhost @click.stop="app.openSettings">Settings</PlBtnGhost>
    </template> 
  </PlBlockPage>
  <PlSlideModal v-model="app.settingsOpen">
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
  
</template>


