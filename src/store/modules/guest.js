import TMService from "@/services/TMService";
import { EventBus } from "@/event-bus.js";

export const namespaced = true;

export const state = {
  guests: []
};

export const mutations = {
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
  addGuest({ commit, dispatch, rootState }, { tableId, guest }) {
    const layoutId = rootState.layout.id;
    return TMService.addGuest(layoutId, tableId, guest)
      .then(response => {
        guest.id = response.data.id;
        guest.table_id = tableId;
        const newGuest = guest;
        commit("ADD_GUEST", newGuest);
        const notification = {
          type: "success",
          message: "Ospite aggiunto!"
        };
        dispatch("notification/add", notification, { root: true });
        return guest;
      })
      .then(guest => {
        dispatch("updateGuestCounters", guest);
      })
      .catch(error => {
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
        const updatedGuest = response.data.dati[0];
        commit("UPDATE_GUEST", updatedGuest);
        const notification = {
          type: "success",
          message: "Ospite aggiornato!"
        };
        dispatch("notification/add", notification, { root: true });
        return updatedGuest;
      })
      .then(updatedGuest => {
        dispatch("updateGuestCounters", updatedGuest);
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
      .then(() => {
        commit("DELETE_GUEST", guest);
        const notification = {
          type: "success",
          message: "Ospite rimosso!"
        };
        dispatch("notification/add", notification, { root: true });
        return guest;
      })
      .then(guest => {
        dispatch("updateGuestCounters", guest);
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

    let guests = state.guests.filter(guest => {
      return guest.table_id == updatedGuest.table_id;
    });

    guests.forEach(guest => {
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
    });

    counters.text = `${counters.people > 0 ? "P" + counters.people : ""} ${
      counters.babies > 0 ? "B" + counters.babies : ""
    } ${counters.chairs > 0 ? "S" + counters.chairs : ""} ${
      counters.highchairs > 0 ? "XS" + counters.highchairs : ""
    }`;

    rootState.table.groups[groupIndex].guestCounters.text = counters.text;
  }
};

export const getters = {
  guests: state => tableId => {
    return state.guests.filter(guest => guest.table_id === tableId);
  },
  guestTotals(state) {
    const guests = state.guests;
    let guestTotals = {
      people: 0,
      babies: 0,
      chairs: 0,
      highchairs: 0
    };

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

    let totalText = "TOTALE:\n";
    totalText += "Persone: " + guestTotals.people + ",";
    totalText += " Bambini: " + guestTotals.babies + ",";
    totalText += " Sedie: " + guestTotals.chairs + ",";
    totalText += " Seggiolone: " + guestTotals.highchairs;

    let total = {
      name: "totaleCounter",
      text: totalText,
      fontSize: 18,
      fontFamily: "Poppins",
      fontStyle: "bold",
      fill: "black",
      width: 600,
      x: 14,
      y: 750
    };
    return total;
  }
};
