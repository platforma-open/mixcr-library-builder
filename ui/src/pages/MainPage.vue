<script setup lang="ts">
import { PlBlockPage, PlEditableTitle, PlBtnGhost, PlMaskIcon24, PlLogView, PlSlideModal, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import SettingsPanel from './SettingsPanel.vue';
import LogsPanel from './LogsPanel.vue';
import { computed, ref, watch } from 'vue';
import { useApp } from '../app';

const app = useApp();
const settingsIsShown = ref(app.model.outputs.debugOutput === undefined);
const logsIsShown = ref(false);

const showQuery = () => {
  settingsIsShown.value = true;
};

const showLogs = () => {
  logsIsShown.value = true;
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
  <PlBlockPage @click="settingsIsShown=false; logsIsShown=false">
    <template #title> MiXCR reference library builder </template>
    <template #append>
      <PlBtnGhost @click.stop="showLogs">
        Logs
        <template #append>
          <PlMaskIcon24 name="error" />
        </template>
      </PlBtnGhost>
      <PlBtnGhost @click.stop="showQuery">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
  </PlBlockPage>
  <PlSlideModal 
    v-model="logsIsShown" 
    :close-on-outside-click="false"
    width="100%"
  >
    <template #title>Library Builder Logs</template>
    <LogsPanel />
  </PlSlideModal>
  <PlSlideModal 
    v-model="settingsIsShown" 
    :close-on-outside-click="false"
  >
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
</template>


