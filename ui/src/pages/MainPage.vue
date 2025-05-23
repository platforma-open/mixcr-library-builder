<script setup lang="ts">
import { PlBlockPage, PlEditableTitle, PlBtnGhost, PlMaskIcon24, PlLogView, PlSlideModal, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import SettingsPanel from './SettingsPanel.vue';
import { computed, ref, watch } from 'vue';
import { useApp } from '../app';

const app = useApp();
const settingsIsShown = ref(app.model.outputs.debugOutput === undefined);

const showQuery = () => {
  settingsIsShown.value = true;
};

// Watch for settings modal close
watch(settingsIsShown, (newValue) => {
  if (!newValue) { // When modal is closed
    // Settings are automatically saved through reactive bindings
    // No need for explicit save as we're using v-model with app.model.args
  }
});

//const debug = computed(() => {
//  return ReactiveFileContent.getContentString(app.model.outputs.debugOutput?.handle);
//});

</script>

<template>
  <PlBlockPage @click="settingsIsShown=false">
    <template #title> MiXCR reference library builder </template>
    <template #append>
      <PlBtnGhost @click.stop="showQuery">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
     <PlLogView :log-handle="app.model.outputs.debugOutput" label="Debug output"/>
  </PlBlockPage>
  <PlSlideModal 
    v-model="settingsIsShown" 
    :close-on-outside-click="false"
  >
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
</template>


