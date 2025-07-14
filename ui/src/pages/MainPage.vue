<script setup lang="ts">
import { PlBlockPage, PlEditableTitle, PlBtnGhost, PlMaskIcon24, PlLogView, PlSlideModal, ReactiveFileContent, PlAgDataTableV2, usePlDataTableSettingsV2 } from '@platforma-sdk/ui-vue';
import SettingsPanel from './SettingsPanel.vue';
import LogsPanel from './LogsPanel.vue';
import { computed, ref, watch } from 'vue';
import { useApp } from '../app';

const app = useApp();
const settingsIsShown = ref(app.model.outputs.debugOutput === undefined);
const logsIsShown = ref(false);

const tableSettings = usePlDataTableSettingsV2({
  model: () => app.model.outputs.fastaTable,
  sheets: () => app.model.outputs.chainTableSheets,
});

const tableLoadingText = computed(() => {
  if (app.model.outputs.isRunning) {
    return 'Running';
  }
  return 'Loading';
});

const showQuery = () => {
  settingsIsShown.value = true;
};

const showLogs = () => {
  logsIsShown.value = true;
};

const chainOptions = computed(() => {
  return app.model.outputs.chainOptions || [];
});

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
    <PlAgDataTableV2
      v-model="app.model.ui.tableState"
      :settings="tableSettings"
      show-columns-panel
      show-export-button
      :loading-text="tableLoadingText"
      not-ready-text="Data is not computed"
    />
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


