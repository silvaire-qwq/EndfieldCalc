import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import { Icon } from "@iconify/vue";

createApp(App).mount("#app");
createApp(App).component("Icon", Icon).mount("#app");

