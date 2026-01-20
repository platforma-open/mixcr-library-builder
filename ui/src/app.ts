import { model } from '@platforma-open/milaboratories.mixcr-library-builder.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import MainPage from './pages/MainPage.vue';
import { ref, watch } from 'vue';

export const sdkPlugin = defineApp(model, () => {
  const settingsOpen = ref(true);
  function openSettings() {
    settingsOpen.value = true;
  }
  return {
    settingsOpen,
    openSettings,
    routes: {
      '/': () => MainPage,
    },
  };
});

export const useApp = sdkPlugin.useApp;

// Make sure labels are initialized
const unwatch = watch(sdkPlugin, ({ loaded }) => {
  if (!loaded) return;
  const app = useApp();
  app.model.args.customBlockLabel ??= '';
  app.model.args.defaultBlockLabel ??= 'Select Species';
  unwatch();
});
