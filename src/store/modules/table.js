import TMService from "@/services/TMService";
import _find from "lodash/find";
import _findIndex from "lodash/findIndex";

export const namespaced = true;

export const state = {
  groups: [],
  tablesFetched: [],
  tableTypes: [],
  createTableForm: {
    type: "circle",
    size: "small",
    text: "",
    number: "",
  },
  counter: 0,
};

export const mutations = {
  GET_TABLES(state, payload) {
    state.groups = [];
    state.tablesFetched = [];
    state.tablesFetched = payload;
  },
  FETCH_TABLE_TYPES(state, payload) {
    state.tableTypes = payload;
  },
  DELETE_TABLE(state, id) {
    let indexToRemove = _findIndex(state.groups, (group) => {
      return group.table.id == id;
    });
    state.groups.splice(indexToRemove, 1);
  },
  ADD_TABLE(state, table) {
    state.groups.push(table);
    state.counter++;
  },
  HANDLE_ASTERISC(state, payload) {
    console.log("payload", payload);

    const groupToEdit = _find(state.groups, (group) => {
      return group.table.id == payload.tableId;
    });

    if (groupToEdit) {
      groupToEdit.asteriscTextConfig.state = payload.state;
    }

    console.log("groupToEdit", groupToEdit);
  },
  UPDATE_TABLE_CLIENT_NAME(state, table) {
    const groupToEdit = _find(state.groups, (group) => {
      return group.table.id == table.id;
    });
    console.log("groupToEdit", table);

    groupToEdit.nomeClienteText.nomeCliente = table.nomeCliente;
    groupToEdit.nomeClienteText.text = table.nomeCliente;
    const tableToEdit = groupToEdit.table;
    tableToEdit.textConfig.nomeCliente = table.nomeCliente;
    table.rootState.stage.draw();
  },
  UPDATE_TABLE(state, table) {
    const groupToEdit = _find(state.groups, (group) => {
      return group.table.id == table.id;
    });

    const tableToEdit = groupToEdit.table;
    if (table.typeId == 2) {
      tableToEdit.tableConfig.radius = table.size;
    }

    if (table.typeId == 3) {
      tableToEdit.tableConfig.height = table.size;
      tableToEdit.tableConfig.width = table.size;
    }

    if (table.typeId == 4) {
      tableToEdit.tableConfig.height = table.size;
      tableToEdit.tableConfig.width = table.size * 2;
    }

    if (table.typeId == 5) {
      tableToEdit.tableConfig.radiusX = table.size * 2;
      tableToEdit.tableConfig.radiusY = table.size;
    }

    tableToEdit.tableConfig.stroke = table.borderColor
      ? `#${table.borderColor}`
      : "#000000";

    tableToEdit.tableConfig.strokeWidth = 2;
    tableToEdit.tableConfig.borderType = table.borderType;
    tableToEdit.tableConfig.dashEnabled =
      table.borderType == "trattegiato" ? true : false;
    tableToEdit.tableConfig.strokeEnabled =
      table.borderType == "nessuno" ? false : true;

    if (tableToEdit.textConfig) {
      tableToEdit.textConfig.fill = table.borderColor
        ? `#${table.borderColor}`
        : "#000000";
    }

    if (groupToEdit.guestCounters) {
      groupToEdit.guestCounters.fill = table.borderColor
        ? `#${table.borderColor}`
        : "#000000";
    }

    if (groupToEdit.guestCountersTotal) {
      groupToEdit.guestCountersTotal.fill = table.borderColor
        ? `#${table.borderColor}`
        : "#000000";
    }

    tableToEdit.tableConfig.fill = `#${table.backgroundColor}`;

    // console.log("groupToEdit", groupToEdit);

    let type;
    switch (table.typeId) {
      case 2:
        type = "circle";
        break;

      case 3:
        type = "square";
        break;

      case 4:
        type = "rectangle";
        break;

      case 5:
        type = "ellipse";
        break;
    }

    tableToEdit.tableConfig.scaleX = table.scaleX;
    tableToEdit.tableConfig.scaleY = table.scaleY;
    tableToEdit.type = type;
    tableToEdit.tableConfig.rotation = Number(table.angolare);
    tableToEdit.textConfig.name = table.tableName;
    tableToEdit.textConfig.rotation = Number(table.angolare);
    tableToEdit.textConfig.number = table.tableNumber;
    tableToEdit.textConfig.text =
      table.tableName + (table.tableNumber == 0 ? "" : table.tableNumber);
    tableToEdit.textConfig.nomeCliente = table.nomeCliente;
    tableToEdit.textConfig.maxSeats = table.maxSeats;
  },
};

export const actions = {
  handleAsterisc({ commit, rootState }, payload) {
    commit("HANDLE_ASTERISC", payload);
    rootState.stage.draw();
  },
  getTables({ commit, dispatch }, layoutId) {
    TMService.getTables(layoutId)
      .then((response) => {
        this.tablesFetched = [];
        // handle success
        console.log("Tables Fetched:", response.data.dati);
        if (response.data.dati.length == 0) {
          dispatch("endProgress", null, { root: true });
          // const notification = {
          //   type: "error",
          //   multiLine: true,
          //   message: "Non siamo riusciti a trovare alcun tavolo"
          // };
          // dispatch("notification/add", notification, { root: true });
          return false;
        } else {
          commit("GET_TABLES", response.data.dati);
        }
        return layoutId;
      })
      .then((layoutId) => {
        dispatch("guest/getGuests", layoutId, { root: true });
      })
      .catch((error) => {
        // handle error
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il recupero dei tavoli: " +
            error.message,
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  fetchTableTypes({ commit, dispatch }) {
    TMService.fetchTableTypes()
      .then((response) => {
        // handle success
        let tableTypes = [];
        for (let index = 1; index < response.data.dati.length; index++) {
          tableTypes.push(response.data.dati[index]);
        }
        commit("FETCH_TABLE_TYPES", tableTypes);
      })
      .catch((error) => {
        // handle error
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il recupero dei tipi di tavoli: " +
            error.message,
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  moveTable({ commit, dispatch }, payload) {
    TMService.moveTable(payload)
      .then((response) => {
        console.log("response", response);
        payload.group.table.id = response.data.id;

        const notification = {
          type: "success",
          message: "Tavolo aggiunto!",
        };
        dispatch("notification/add", notification, { root: true });
      })
      .catch(function(error) {
        const notification = {
          type: "success",
          message:
            "Si è verificato un problema durante lo spostamento del tavolo: " +
            error.message,
        };
        dispatch("notification/add", notification, { root: true });
        console.log(error);
      });
  },
  addTable({ commit, dispatch, rootState }, payload) {
    if (payload.isNew === true) {
      console.log("payload", payload);
      TMService.addTable(payload.details)
        .then((response) => {
          console.log("response", response);
          if (response.data.esito) {
            payload.group.table.id = response.data.dati.id;

            const notification = {
              type: "success",
              message: response.data.info_txt,
            };

            dispatch("notification/add", notification, { root: true });
            dispatch("table/getTables", rootState.layout.id, {
              root: true,
            });
          } else {
            const notification = {
              type: "error",
              message: response.data.info_txt,
            };
            dispatch("notification/add", notification, { root: true });
            return false;
          }
        })
        .catch(function(error) {
          const notification = {
            type: "success",
            message:
              "Si è verificato un problema durante l'aggiunta del tavolo: " +
              error.message,
          };
          dispatch("notification/add", notification, { root: true });
          console.log(error);
        });
    }
    commit("ADD_TABLE", payload.group);
    if (state.counter == state.tablesFetched.length) {
      dispatch("endProgress", null, { root: true });
    }
  },
  deleteTable({ state, commit, dispatch, rootState }, table) {
    TMService.deleteTable({ layoutId: table.layoutId, tableId: table.id })
      .then((response) => {
        if (response.data.esito) {
          commit("DELETE_TABLE", table.id);

          const notification = {
            type: "success",
            message: response.data.info_txt,
          };
          dispatch("table/getTables", rootState.layout.id, {
            root: true,
          });
          dispatch("notification/add", notification, { root: true });
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt,
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .catch(function(error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'eliminazione del tavolo: " +
            error.message,
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  updateTable({ commit, dispatch, rootState }, payload) {
    TMService.updateTable(payload)
      .then((response) => {
        if (response.data.esito) {
          commit("UPDATE_TABLE", payload);

          const notification = {
            type: "success",
            message: response.data.info_txt,
          };
          dispatch("table/getTables", rootState.layout.id, {
            root: true,
          });
          dispatch("notification/add", notification, { root: true });
          return true;
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt,
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .then(() => {
        rootState.stage.draw();
      })
      .catch(function(error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'aggiornamento del tavolo: " +
            error.message,
        };
        console.log("error", error);
        dispatch("notification/add", notification, { root: true });
      });
  },
  updateClientName({ commit, dispatch, rootState }, payload) {
    TMService.updateClientName(payload)
      .then((response) => {
        if (response.data.esito) {
          payload.rootState = rootState;
          commit("UPDATE_TABLE_CLIENT_NAME", payload);

          const notification = {
            type: "success",
            message: response.data.info_txt,
          };
          dispatch("notification/add", notification, { root: true });
          return true;
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt,
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .then(() => {
        // rootState.stage.draw();
      })
      .catch(function(error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'aggiornamento del tavolo: " +
            error.message,
        };
        console.log("error", error);
        dispatch("notification/add", notification, { root: true });
      });
  },
};

export const getters = {
  groupsLength(state) {
    return state.groups.length;
  },
  getGroups() {
    return state.groups;
  },
  getTables() {
    return state.tablesFetched;
  },
};
