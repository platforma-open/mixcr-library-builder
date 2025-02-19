<script setup lang="ts">
import { PlBlockPage, PlEditableTitle, PlBtnGhost, PlMaskIcon24, PlLogView, PlSlideModal, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import SettingsPanel from './SettingsPanel.vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

//const debug = computed(() => {
//  return ReactiveFileContent.getContentString(app.model.outputs.debugOutput?.handle);
//});

</script>

<template>
  <PlBlockPage>
    <template #title> MiXCR reference library builder </template>
    <template #append>
      <PlBtnGhost @click.stop="app.openSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
    <PlLogView :log-handle="app.model.outputs.debugOutput" label="Debug output"/>
  </PlBlockPage>
  <PlSlideModal v-model="app.settingsOpen">
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
  
</template>


