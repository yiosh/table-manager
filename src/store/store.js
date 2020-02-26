import Vue from "vue";
import Vuex from "vuex";
import TMService from "@/services/TMService";
import NProgress from "nprogress";
import * as table from "@/store/modules/table.js";
import * as guest from "@/store/modules/guest.js";
import * as notification from "@/store/modules/notification.js";
import { host } from "@/localHost";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    table,
    notification,
    guest
  },
  state: {
    guestListDialog: false,
    error: false,
    info: {},
    hostname:
      location.hostname == "localhost" ||
      location.hostname == "dev.condivision.cloud"
        ? host
        : location.hostname,
    selectedGroup: null,
    loading: true,
    labels: {},
    translatedLabels: [],
    layout: {
      ambiente_id: "",
      created_at: "",
      evento_id: "",
      id: "",
      layout_name: "",
      orientation: "",
      sede_id: "",
      updated_at: "",
      mappa: ""
    },
    stage: null,
    layer: null,
    configKonva: {
      width: 1200,
      height: 792
    }
  },
  mutations: {
    GUEST_LIST_DIALOG(state, payload) {
      state.guestListDialog = payload;
    },
    ERROR(state) {
      state.error = true;
    },
    SET_TRANSLATED_LABELS(state, payload) {
      state.translatedLabels.push(payload);
    },
    SET_LABELS(state, payload) {
      state.info = Object.assign({}, payload);
      console.log("labels", payload);
      state.labels = Object.assign({}, payload);
    },
    SET_LAYOUT(state, payload) {
      state.layout = Object.assign({}, payload);
      if (state.layout.orientation == 1) {
        state.configKonva = Object.assign(
          {},
          {
            width: 792,
            height: 1200
          }
        );
      }
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
    CHANGE_ORIENTATION(state) {
      state.configKonva.width = 792;
      state.configKonva.height = 1200;
    }
  },
  actions: {
    redrawCanvas({ state }) {
      console.log(state);
      state.stage.draw();
    },
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
    setLanguageLabels({ commit }, language) {
      TMService.fetchLabels(language)
        .then(response => {
          for (let label of response.data) {
            commit("SET_TRANSLATED_LABELS", label);
          }
        })
        .catch(error => {
          // handle error
          console.log(error);
        });
    },

    setLayout({ commit, dispatch }, layoutId) {
      TMService.fetchLayout(layoutId)
        .then(response => {
          let info;
          let layout;
          if (response.data.dati) {
            layout = response.data.dati[0];
            info = response.data.info;
          }

          if (info) {
            console.log("info", info);
            commit("SET_LABELS", info);
          }
          if (layout) {
            console.log("layout", layout);
            return commit("SET_LAYOUT", layout);
          } else {
            const notification = {
              type: "error",
              multiLine: false,
              message: "Nessun layout è stato trovato"
            };
            dispatch("notification/add", notification, { root: true });
            return commit("ERROR");
          }
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
  },
  getters: {
    getPrintTitle(state) {
      return {
        eventDate: state.layout.board_event_date,
        eventName: state.layout.layout_name
      };
    },
    getInfo: state => {
      return state.info;
    },
    getBackgroundImg: state => state.layout.mappa,
    getStageConfig: state => state.configKonva,
    getOrientation: state => state.layout.orientation,
    getHostname: state => state.hostname,
    getLoading: state => state.loading
  }
});
