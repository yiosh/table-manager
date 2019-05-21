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
    guestListDialog: false,
    error: false,
    hostname:
      location.hostname === "localhost"
        ? "calderonimartini.condivision.cloud"
        : location.hostname,
    selectedGroup: null,
    loading: true,
    labels: {},
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
    GUEST_LIST_DIALOG(state, payload) {
      state.guestListDialog = payload;
    },
    ERROR(state) {
      state.error = true;
    },
    SET_LABELS(state, payload) {
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
    setLayout({ commit, dispatch }, layoutId) {
      TMService.fetchLayout(layoutId)
        .then(response => {
          const layout = response.data.dati[0];
          const info = response.data.info;

          if (info) {
            commit("SET_LABELS", response.data.info);
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
    printTitle(state) {
      return {
        eventDate: state.layout.board_event_date,
        eventName: state.layout.layout_name
      }
    }
  }
});
