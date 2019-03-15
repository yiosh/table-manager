import Vue from "vue";
import Vuex from "vuex";
import TMService from "@/services/TMService";
import NProgress from "nprogress";
import * as table from "@/store/modules/table.js";
import * as guest from "@/store/modules/guest.js";
import * as notification from "@/store/modules/notification.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    table,
    notification,
    guest
  },
  state: {
    hostname:
      location.hostname === "localhost"
        ? "demo.condivision.cloud"
        : location.hostname,
    selectedGroup: null,
    loading: true,
    layout: {
      ambiente_id: "",
      created_at: "",
      evento_id: "",
      id: "",
      layout_name: "",
      orientation: "",
      sede_id: "",
      updated_at: ""
    },
    stage: null,
    layer: null,
    configKonva: {
      width: 1200,
      height: 792
    }
  },
  mutations: {
    SET_LAYOUT(state, payload) {
      state.layout = Object.assign({}, payload);
      console.log("Layout", state.layout);
    },
    SET_STAGE(state, payload) {
      state.stage = payload;
    },
    SET_LAYER(state, payload) {
      state.layer = payload;
    },
    SELECT_GROUP(state, payload) {
      state.selectedGroup = payload;
    },
    SET_ORIENTATION(state, payload) {
      state.configKonva.width = payload.width;
      state.configKonva.height = payload.height;
    }
  },
  actions: {
    startProgress() {
      NProgress.start();
    },
    endProgress({ state }) {
      NProgress.done();
      state.loading = false;
    },
    setStage(state, payload) {
      state.commit("SET_STAGE", payload);
    },
    setLayer(state, payload) {
      state.commit("SET_LAYER", payload);
    },
    selectGroup(state, payload) {
      state.commit("SELECT_GROUP", payload);
    },
    setOrientation(state, payload) {
      state.commit("SET_ORIENTATION", payload);
    },
    setLayout({ commit, dispatch }, layoutId) {
      TMService.fetchLayout(layoutId)
        .then(response => {
          // handle success
          // const notification = {
          //   type: "error",
          //   multiLine: true,
          //   message:
          //     "Si è verificato un problema durante il recupero del layout: " +
          //     error.message
          // };
          // dispatch("notification/add", notification, { root: true });
          // const layout =
          // if (condition) {

          // }
          return commit("SET_LAYOUT", response.data.dati[0]);
        })
        .catch(error => {
          // handle error
          console.log(error);
          const notification = {
            type: "error",
            multiLine: true,
            message:
              "Si è verificato un problema durante il recupero del layout: " +
              error.message
          };
          dispatch("notification/add", notification, { root: true });
        });
    }
  }
});
