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
    info: {},
    hostname:
      location.hostname == "localhost" ||
      location.hostname == "dev.condivision.cloud"
        ? "demo.condivision.cloud"
        : location.hostname,
    selectedGroup: null,
    loading: true,
    labels: {},
    translatedLabels: [],
    //   {
    //     id: "2",
    //     module: "28",
    //     placeholder: "QUOTE_MANAGER",
    //     content: "Quote Manager"
    //   },
    //   {
    //     id: "3",
    //     module: "53",
    //     placeholder: "add_table",
    //     content: "Add TableX"
    //   },
    //   {
    //     id: "4",
    //     module: "53",
    //     placeholder: "table_name",
    //     content: "Table Name"
    //   },
    //   {
    //     id: "5",
    //     module: "53",
    //     placeholder: "table_number",
    //     content: "Table Number"
    //   },
    //   {
    //     id: "6",
    //     module: "53",
    //     placeholder: "customer_table_name",
    //     content: "Customers Table Name"
    //   },
    //   { id: "7", module: "53", placeholder: "type", content: "Type Type" },
    //   { id: "8", module: "53", placeholder: "round", content: "Round Round" },
    //   {
    //     id: "9",
    //     module: "53",
    //     placeholder: "square",
    //     content: "Square Square"
    //   },
    //   {
    //     id: "10",
    //     module: "53",
    //     placeholder: "rectangular",
    //     content: "Rectangular Rectangular"
    //   },
    //   { id: "11", module: "53", placeholder: "oval", content: "Oval Oval" },
    //   { id: "12", module: "53", placeholder: "size", content: "Size Size" },
    //   { id: "13", module: "53", placeholder: "small", content: "Small Small" },
    //   {
    //     id: "14",
    //     module: "53",
    //     placeholder: "medium",
    //     content: "Medium Medium"
    //   },
    //   { id: "15", module: "53", placeholder: "large", content: "Large Large" },
    //   {
    //     id: "16",
    //     module: "53",
    //     placeholder: "border_color",
    //     content: "Border Color"
    //   },
    //   {
    //     id: "17",
    //     module: "53",
    //     placeholder: "backgound_color",
    //     content: "Backgound Color"
    //   },
    //   { id: "18", module: "53", placeholder: "border", content: "Border " },
    //   { id: "19", module: "53", placeholder: "solid", content: "Solid" },
    //   { id: "20", module: "53", placeholder: "dashed", content: "Dashed" },
    //   { id: "21", module: "53", placeholder: "none", content: "None" },
    //   { id: "22", module: "53", placeholder: "create", content: "Create" },
    //   {
    //     id: "23",
    //     module: "53",
    //     placeholder: "table_inserted",
    //     content: "Table Inserted"
    //   },
    //   {
    //     id: "24",
    //     module: "53",
    //     placeholder: "guest_list",
    //     content: "Guest lList"
    //   },
    //   { id: "25", module: "53", placeholder: "surname", content: "Surname" },
    //   { id: "26", module: "53", placeholder: "name", content: "Name" },
    //   { id: "27", module: "53", placeholder: "adults", content: "Adults" },
    //   { id: "28", module: "53", placeholder: "child", content: "Child" },
    //   { id: "29", module: "53", placeholder: "chairs", content: "Chairs" },
    //   {
    //     id: "30",
    //     module: "53",
    //     placeholder: "high_chairs",
    //     content: "High Chairs"
    //   },
    //   { id: "31", module: "53", placeholder: "note", content: "Note" },
    //   { id: "32", module: "53", placeholder: "actions", content: "Actions" },
    //   {
    //     id: "33",
    //     module: "53",
    //     placeholder: "there_are_no_guests_at_this_table",
    //     content: "There are no guests at this table"
    //   },
    //   {
    //     id: "34",
    //     module: "53",
    //     placeholder: "new_guest",
    //     content: "New guest"
    //   },
    //   { id: "35", module: "53", placeholder: "surname", content: "Name" },
    //   { id: "36", module: "53", placeholder: "name", content: "Surname" },
    //   { id: "37", module: "53", placeholder: "adults", content: "Adults" },
    //   { id: "38", module: "53", placeholder: "child", content: "Child" },
    //   { id: "39", module: "53", placeholder: "chairs", content: "Chairs" },
    //   {
    //     id: "40",
    //     module: "53",
    //     placeholder: "high_chairs",
    //     content: "High Chairs"
    //   },
    //   { id: "41", module: "53", placeholder: "note", content: "Note" },
    //   {
    //     id: "42",
    //     module: "53",
    //     placeholder: "save_and_add_again",
    //     content: "Save and add again"
    //   },
    //   { id: "43", module: "53", placeholder: "save", content: "Save" },
    //   { id: "44", module: "53", placeholder: "close", content: "Close" },
    //   { id: "45", module: "53", placeholder: "edit", content: "Edit" },
    //   { id: "46", module: "53", placeholder: "table", content: "Table" },
    //   { id: "47", module: "53", placeholder: "preview", content: "Preview" },
    //   { id: "48", module: "53", placeholder: "close", content: "Close" },
    //   { id: "49", module: "53", placeholder: "print", content: "Print" },
    //   {
    //     id: "50",
    //     module: "53",
    //     placeholder: "download_png",
    //     content: "Download png"
    //   },
    //   {
    //     id: "51",
    //     module: "53",
    //     placeholder: "download_jpg",
    //     content: "Download jpg"
    //   },
    //   {
    //     id: "52",
    //     module: "53",
    //     placeholder: "you_must_select_a_table_to_open_its_guest_list",
    //     content: "You must select a table to open its guest list"
    //   },
    //   { id: "53", module: "53", placeholder: "delete", content: "Delete" }
    // ],
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
    SET_TRANSLATED_LABELS(state, payload) {
      state.translatedLabels.push(payload);
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
    printTitle(state) {
      return {
        eventDate: state.layout.board_event_date,
        eventName: state.layout.layout_name
      };
    }
  }
});
