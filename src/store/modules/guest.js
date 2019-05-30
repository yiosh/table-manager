import TMService from "@/services/TMService";
import { EventBus } from "@/event-bus.js";

export const namespaced = true;

export const state = {
  guests: [],
  guestTypes: [],
  adultCounter: 0,
  babyCounter: 0
};

export const mutations = {
  GET_GUEST_TYPES(state, payload) {
    if (payload.length > 0) {
      payload.forEach(guest => {
        state.guestTypes.push(guest);
      });
    }
  },
  GET_GUESTS(state, payload) {
    if (payload.length > 0) {
      payload.forEach(guest => {
        state.guests.push(guest);
      });
    }
    EventBus.$emit("fetch-done");
  },
  ADD_GUEST(state, newGuest) {
    state.guests.push(newGuest);
  },
  UPDATE_GUEST(state, updatedGuest) {
    let index = state.guests.findIndex(guest => {
      return guest.id == updatedGuest.id;
    });
    console.log("updatedGuest", updatedGuest);
    Object.assign(state.guests[index], updatedGuest);
  },
  DELETE_GUEST(state, guest) {
    let index = state.guests.findIndex(guestFound => {
      return guestFound.id == guest.id;
    });

    state.guests.splice(index, 1);
  }
};

export const actions = {
  getGuests({ commit, dispatch }, layoutId) {
    TMService.getGuests(layoutId)
      .then(response => {
        // handle success
        return commit("GET_GUESTS", response.data.dati);
      })
      .catch(error => {
        // handle error
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il recupero degli ospiti: " +
            error.message
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  getGuestTypes({ commit, dispatch }) {
    TMService.getGuestTypes()
      .then(response => {
        // handle success
        console.log("GuestTypes", response.data);
        return commit("GET_GUEST_TYPES", response.data.dati);
      })
      .catch(error => {
        // handle error
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il recupero degli ospiti: " +
            error.message
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  addGuest({ commit, dispatch, rootState }, { tableId, guest }) {
    const layoutId = rootState.layout.id;
    return TMService.addGuest(layoutId, tableId, guest)
      .then(response => {
        if (response.data.esito) {
          guest.id = response.data.dati.id;
          guest.table_id = tableId;
          const newGuest = guest;
          commit("ADD_GUEST", newGuest);

          const notification = {
            type: "success",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return guest;
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .then(guest => {
        dispatch("updateGuestCounters", guest);
      })
      .catch(error => {
        console.log("error", error);
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'aggiunta dell'ospite: " +
            error.message
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  updateGuest({ commit, dispatch }, guest) {
    TMService.updateGuest(guest)
      .then(response => {
        if (response.data.esito) {
          const updatedGuest = response.data.dati[0];
          commit("UPDATE_GUEST", updatedGuest);

          const notification = {
            type: "success",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return updatedGuest;
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .then(updatedGuest => {
        dispatch("updateGuestCounters", updatedGuest);
        dispatch("handleIfNote", { tableId: guest.table_id });
      })
      .catch(error => {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'aggiornamento del ospite: " +
            error.message
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  deleteGuest({ commit, dispatch }, guest) {
    TMService.deleteGuest(guest.id)
      .then(response => {
        if (response.data.esito) {
          commit("DELETE_GUEST", guest);

          const notification = {
            type: "success",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return guest;
        } else {
          const notification = {
            type: "error",
            message: response.data.info_txt
          };
          dispatch("notification/add", notification, { root: true });
          return false;
        }
      })
      .then(guest => {
        dispatch("updateGuestCounters", guest);
        dispatch("handleIfNote", { tableId: guest.table_id });
      })
      .catch(function(error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante l'eliminazione del ospite: " +
            error.message
        };
        dispatch("notification/add", notification, { root: true });
      });
  },
  handleIfNote({ state, dispatch }, payload) {
    console.log("payload", payload);
    let tableGuests = state.guests.filter(
      guest => guest.table_id == payload.tableId
    );
    let test = tableGuests.find(guest => guest.note_intolleranze != "");
    console.log("test", test);

    if (test == undefined) {
      dispatch(
        "table/handleAsterisc",
        { tableId: payload.tableId, state: false },
        { root: true }
      );
    } else {
      dispatch(
        "table/handleAsterisc",
        { tableId: payload.tableId, state: true },
        { root: true }
      );
    }
  },
  updateGuestCounters({ rootState }, updatedGuest) {
    console.log("updatedGuest", updatedGuest);
    let groupIndex = rootState.table.groups.findIndex(group => {
      return group.table.id == updatedGuest.table_id;
    });

    let counters = {
      people: 0,
      babies: 0,
      chairs: 0,
      highchairs: 0,
      text: ""
    };

    let seraleCounters = {
      people: 0,
      babies: 0,
      chairs: 0,
      highchairs: 0,
      text: ""
    };
    console.log("state", rootState);

    let guests = state.guests
      ? state.guests.filter(guest => {
          return guest.table_id == updatedGuest.table_id;
        })
      : [];

    if (guests.length > 0) {
      guests.forEach(guest => {
        if (guest.guest_type == 4) {
          if (Number(guest.peoples) > 0) {
            seraleCounters.people += Number(guest.peoples);
          }
          if (Number(guest.baby) > 0) {
            seraleCounters.babies += Number(guest.baby);
          }
          if (Number(guest.chairs_only) > 0) {
            seraleCounters.chairs += Number(guest.chairs_only);
          }
          if (Number(guest.high_chair) > 0) {
            seraleCounters.highchairs += Number(guest.high_chair);
          }
        } else {
          if (Number(guest.peoples) > 0) {
            counters.people += Number(guest.peoples);
          }
          if (Number(guest.baby) > 0) {
            counters.babies += Number(guest.baby);
          }
          if (Number(guest.chairs_only) > 0) {
            counters.chairs += Number(guest.chairs_only);
          }
          if (Number(guest.high_chair) > 0) {
            counters.highchairs += Number(guest.high_chair);
          }
        }
      });
    }

    const showTablesTotal = rootState.labels.show_tables_total
      ? `${rootState.labels.show_tables_total}: `
      : "";
    const peoplesLetter = rootState.labels.peoples_letter
      ? `${rootState.labels.peoples_letter}: `
      : "P";
    const babyLetter = rootState.labels.baby_letter
      ? `${rootState.labels.baby_letter}: `
      : "B";
    const chairsLetter = rootState.labels.chairs_only_letter
      ? `${rootState.labels.chairs_only_letter}: `
      : "S";
    const highChairLetter = rootState.labels.high_chair_letter
      ? `${rootState.labels.high_chair_letter}: `
      : "H";

    counters.text = `${
      counters.people > 0 ? peoplesLetter + counters.people : ""
    } ${counters.babies > 0 ? babyLetter + counters.babies : ""} ${
      counters.chairs > 0 ? chairsLetter + counters.chairs : ""
    } ${counters.highchairs > 0 ? highChairLetter + counters.highchairs : ""}`;

    seraleCounters.text = 
      seraleCounters.people > 0 ? peoplesLetter + seraleCounters.people : "" +
      seraleCounters.babies > 0 ? babyLetter + seraleCounters.babies : "" +
      seraleCounters.chairs > 0 ? chairsLetter + seraleCounters.chairs : "" +
      seraleCounters.highchairs > 0 ? highChairLetter + seraleCounters.highchairs : "";

    let total = 0;
    total =
      counters.people +
      counters.babies +
      counters.chairs +
      counters.highchairs +
      seraleCounters.people +
      seraleCounters.babies +
      seraleCounters.chairs +
      seraleCounters.highchairs;

    rootState.table.groups[groupIndex].guestCounters.text = counters.text;
    rootState.table.groups[groupIndex].guestSeraleCounters.text = seraleCounters.text;
    rootState.table.groups[groupIndex].guestCountersTotal.text =
      showTablesTotal + total;
  }
};

export const getters = {
  guestTypes: state => {
    let guestTypesArray = state.guestTypes;
    let newArray = [];
    guestTypesArray.forEach(element => {
      let number = parseInt(element.id);
      let guestTypeObject = {
        text: element.label,
        value: number
      };
      newArray.push(guestTypeObject);
    });
    return newArray;
  },
  guests: state => tableId => {
    return state.guests.filter(guest => guest.table_id === tableId);
  },
  guestTotals(state, getters, rootState) {
    const guests = state.guests;
    let guestTotals = {
      people: 0,
      babies: 0,
      chairs: 0,
      highchairs: 0
    };

    let peopleLabel = rootState.labels.peoples_label
      ? rootState.labels.peoples_label
      : "PAX";
    let babiesLabel = rootState.labels.baby_label
      ? rootState.labels.baby_label
      : "Baby";
    let chairsLabel = rootState.labels.chairs_only_label
      ? rootState.labels.chairs_only_label
      : "Sedie";
    let highchairsLabel = rootState.labels.high_chair_label
      ? rootState.labels.high_chair_label
      : "0/2";

    guests.forEach(guest => {
      if (Number(guest.peoples) > 0) {
        guestTotals.people += Number(guest.peoples);
      }
      if (Number(guest.baby) > 0) {
        guestTotals.babies += Number(guest.baby);
      }
      if (Number(guest.chairs_only) > 0) {
        guestTotals.chairs += Number(guest.chairs_only);
      }
      if (Number(guest.high_chair) > 0) {
        guestTotals.highchairs += Number(guest.high_chair);
      }
    });

    // Text for total counters in the canvas footer
    let totalText = "TOTALE:\n";
    totalText += peopleLabel + ": " + guestTotals.people + ", ";
    totalText += babiesLabel + ": " + guestTotals.babies + ", ";
    totalText += chairsLabel + ": " + guestTotals.chairs + ", ";
    totalText += highchairsLabel + ": " + guestTotals.highchairs;

    let y = rootState.layout.orientation == 1 ? 1150 : 750;

    let total = {
      name: "totaleCounter",
      text: totalText,
      fontSize: 18,
      fontFamily: "Poppins",
      fontStyle: "bold",
      fill: "black",
      width: 600,
      x: 14,
      y
    };
    return total;
  },
  guestTotalsV2(state, getters, rootState) {
    let counterText = "";

    const guestTypesArray = state.guestTypes;
    for (let index = 1; index <= guestTypesArray.length; index++) {
      let adultCounter = 0;
      let babyCounter = 0;
      let guestType = guestTypesArray[index - 1];

      state.guests.forEach(guest => {
        if (guest.guest_type == guestType.id) {
          if (guest.peoples) {
            adultCounter += parseInt(guest.peoples);
          }

          if (guest.baby) {
            babyCounter += parseInt(guest.baby);
          }
        }
      });
      if (adultCounter > 0 || babyCounter > 0) {
        counterText += `${guestType.label}: `;
        if (adultCounter > 0) {
          counterText += `Adulti ${adultCounter}`;
          if (babyCounter > 0) {
            counterText += ",";
          }
        }

        if (babyCounter > 0) {
          counterText += ` Bambini ${babyCounter}`;
        }

        counterText += `\n`;
      }
    }

    let y = rootState.layout.orientation == 1 ? 1120 : 720;

    let total = {
      name: "totaleCounter",
      text: counterText,
      fontSize: 16,
      fontFamily: "Poppins",
      fontStyle: "bold",
      fill: "black",
      width: 600,
      draggable: true,
      x: 14,
      y
    };

    return total;
  }
};
