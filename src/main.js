import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import VueKonva from "vue-konva";
import store from "./store/store";
import "nprogress/nprogress.css";

Vue.use(VueKonva);

Vue.config.productionTip = false;

new Vue({
  store,
  title: "Table Manager V2",
  render: h => h(App),
  created() {}
}).$mount("#app");
