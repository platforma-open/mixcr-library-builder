import { model } from "@milaboratories/milaboratories.mixcr-library-builder.model";
import { defineApp } from "@platforma-sdk/ui-vue";
import MainPage from "./pages/MainPage.vue";
import { ref } from "vue"


export const sdkPlugin = defineApp(model, () => {
  const settingsOpen = ref(true)
  function openSettings () {
    settingsOpen.value = true
  }
  return {
    settingsOpen,
    openSettings,
    routes: {
      "/": () => MainPage,
    },
  };
});

export const useApp = sdkPlugin.useApp;
