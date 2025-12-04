<template>
  <v-dialog v-model="guestDialog" max-width="500px" persistent>
    <v-btn slot="activator" color="primary" dark class="mb-2"
      >Tavolo Report</v-btn
    >
    <v-card id="print">
      <!-- <v-card-title>
        <span class="headline">{{ tableName }} {{ tableNumber }}</span>
      </v-card-title> -->

      <!-- <v-card-text>
        <v-container grid-list-md class="py-0">
          <v-layout wrap>
            <v-flex xs4> </v-flex>
            <v-flex xs4 class="d-flex justify-center">
              <small v-if="topGuests.length" v-for="guest in topGuests"
                >{{ guest.cognome }} {{ guest.nome }}</small
              >
            </v-flex>
            <v-flex xs4> </v-flex>
          </v-layout>

          <v-layout wrap>
            <v-flex
              xs4
              style="flex-direction: column;"
              class="d-flex justify-end"
            >
              <p
                v-if="leftGuests.length"
                v-for="guest in leftGuests"
                class="py-0 mb-2"
                style="text-align: end;"
              >
                <small>{{ guest.cognome }} {{ guest.nome }}</small>
              </p>
            </v-flex>
            <v-flex xs4 class="d-flex justify-center">
              <div
                v-if="computedTableSelected"
                :style="{
                  width:
                    Math.round(
                      Number(computedTableSelected.tableConfig.width) *
                        computedTableSelected.tableConfig.scaleX
                    ) + 'px',
                  height:
                    Math.round(
                      computedTableSelected.tableConfig.height *
                        computedTableSelected.tableConfig.scaleY
                    ) + 'px',
                  border: '2px solid #000000',
                }"
              ></div>
            </v-flex>
            <v-flex xs4 class="py-2">
              <p
                v-if="rightGuests.length"
                v-for="guest in rightGuests"
                class="py-0 mb-2"
              >
                <small>{{ guest.cognome }} {{ guest.nome }}</small>
              </p>
            </v-flex>
          </v-layout>

          <v-layout wrap>
            <v-flex xs4> </v-flex>
            <v-flex xs4>
              <small v-if="bottomGuests.length" v-for="guest in bottomGuests"
                >{{ guest.cognome }} {{ guest.nome }}</small
              >
            </v-flex>
            <v-flex xs4> </v-flex>
          </v-layout>
        </v-container>
      </v-card-text> -->
      <div id="print" ref="captureElement" class="table-container-wrapper">
        <div class="custom-card" v-if="computedTableSelected">
          <div class="custom-card-title">
            <span class="headline"> {{ tableName }} {{ tableNumber }} </span>
          </div>

          <div class="custom-card-text">
            <div class="custom-grid-container">
              <div class="guest-row top-row">
                <div class="guest-col col-1"></div>
                <div class="guest-col col-2 center-content">
                  <small
                    v-if="topGuests && topGuests.length"
                    v-for="(guest, index) in topGuests"
                    :key="'top-' + index"
                    class="guest-name"
                  >
                    {{ guest.cognome }} {{ guest.nome }}
                  </small>
                </div>
                <div class="guest-col col-3"></div>
              </div>

              <div class="guest-row middle-row">
                <div class="guest-col col-1 right-align-content">
                  <p
                    v-if="leftGuests && leftGuests.length"
                    v-for="(guest, index) in leftGuests"
                    :key="'left-' + index"
                    class="guest-label mb-2"
                  >
                    <small>{{ guest.cognome }} {{ guest.nome }}</small>
                  </p>
                </div>

                <div class="guest-col col-2 center-content">
                  <div
                    :style="{
                      width:
                        Math.round(
                          Number(
                            computedTableSelected.tableConfig.width
                              ? computedTableSelected.tableConfig.width
                              : 150
                          ) * computedTableSelected.tableConfig.scaleX
                        ) + 'px',
                      height:
                        Math.round(
                          Number(
                            computedTableSelected.tableConfig.height
                              ? computedTableSelected.tableConfig.height
                              : 150
                          ) * computedTableSelected.tableConfig.scaleY
                        ) + 'px',
                      border: '2px solid #000000',
                      borderRadius:
                        computedTableSelected.type == 'circle' ? '50%' : 0,
                    }"
                  ></div>
                </div>

                <div class="guest-col col-3">
                  <p
                    v-if="rightGuests && rightGuests.length"
                    v-for="(guest, index) in rightGuests"
                    :key="'right-' + index"
                    class="guest-label mb-2"
                  >
                    <small>{{ guest.cognome }} {{ guest.nome }}</small>
                  </p>
                </div>
              </div>

              <div class="guest-row bottom-row">
                <div class="guest-col col-1"></div>
                <div class="guest-col col-2 center-content">
                  <small
                    v-if="bottomGuests && bottomGuests.length"
                    v-for="(guest, index) in bottomGuests"
                    :key="'bottom-' + index"
                    class="guest-name"
                  >
                    {{ guest.cognome }} {{ guest.nome }}
                  </small>
                </div>
                <div class="guest-col col-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <v-card-actions>
        <v-btn flat @click="printElm">
          <v-icon class="mr-2">print</v-icon>Stampa
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">
          {{ labels.close }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { EventBus } from "../event-bus.js";
import { mapState, mapGetters } from "vuex";
import MigrationDialog from "./MigrationDialog";

export default {
  name: "TableReport",
  components: {
    MigrationDialog,
  },
  data: (vue) => {
    return {
      pagination: {
        sortBy: "id",
        descending: true,
        rowsPerPage: -1,
      },
      saveAndContinue: true,
      editForm: false,
      tableId: null,
      tableName: "",
      tableNumber: "",
      maxSeats: "",
      clientName: "",
      dialog: false,
      valid: true,
      guestDialog: false,
      labels: {
        list_of_guests: "Elenco degli ospiti",
        create_new_guest: "Aggiungi ospiti",
        surname: "Cognome",
        name: "Nome",
        adults: "Adulti",
        child: "Bambino",
        chairs: "Sedie",
        high_chairs: "Seggioloni",
        menu1: "Celiachia",
        menu2: "No lattosio",
        menu3: "Vegano",
        menu4: "Vegetariano",
        note: "Nota",
        guest_type: "Tipo di ospite",
        save_and_continue: "Salva e continua",
        save: "Salva",
        close: "Chiudi",
        there_are_no_guests_at_this_table: "Non ci sono ospiti a questo tavolo",
        edit_guest: "Modifica ospite",
        delete_guest_confirm: "Sei sicuro di voler cancellare l'ospite ",
      },
      tableSelected: null,
    };
  },

  computed: {
    layout() {
      return this.$store.state.layout;
    },

    info() {
      return this.$store.getters.getInfo;
    },
    numberOfGuests() {
      const guests = this.guests(this.tableId);
      let total = 0;

      guests.forEach((g) => {
        total += Number(g.peoples);
        total += Number(g.baby);
        total += Number(g.chairs_only);
        total += Number(g.high_chair);
      });
      return total;
    },
    leftGuests() {
      return this.guestsFromTable.filter((g) => {
        if (g.side_seat == 0) {
          return g;
        }
      });
    },
    topGuests() {
      return this.guestsFromTable.filter((g) => {
        if (g.side_seat == 1) {
          return g;
        }
      });
    },
    rightGuests() {
      return this.guestsFromTable.filter((g) => {
        if (g.side_seat == 2) {
          return g;
        }
      });
    },
    bottomGuests() {
      return this.guestsFromTable.filter((g) => {
        if (g.side_seat == 3) {
          return g;
        }
      });
    },
    computedTableSelected() {
      return this.tableSelected;
    },
    guestsFromTable() {
      return this.guests(this.tableId);
    },
    ...mapState(["guest"]),
    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" }),
  },
  methods: {
    onInput(event) {
      // Prevent the default input event from being triggered,
      // which would cause the input value to be updated before the watch function is called.
      event.preventDefault();
    },
    updateTableName(string) {
      let updatedItem = {
        id: this.tableId,
        nomeCliente: string,
        layoutId: this.layout.id,
      };

      this.$store.dispatch("table/updateClientName", updatedItem, true);
      this.$store.state.stage.draw();
    },
    updateTableNote(string) {
      let updatedItem = {
        id: this.tableId,
        noteCliente: string,
        layoutId: this.layout.id,
      };

      this.$store.dispatch("table/updateClientNote", updatedItem);
      this.$store.state.stage.draw();
    },
    maxSeatsCheck(newGuest, tableId = null) {
      tableId = tableId ? tableId : this.tableId;
      if (tableId == null) {
        if (Number(tableId) != Number(newGuest.table_id)) {
          return false;
        }
      }
      const maxSeats = Number(this.maxSeats);
      let guests = JSON.parse(JSON.stringify(this.guests(tableId)));
      const index = guests.findIndex((guest) => guest.id === newGuest.id);
      if (index !== -1) {
        guests[index] = Object.assign({}, newGuest);
      } else {
        guests.push(newGuest);
      }
      let totalPasti = 0;
      let totalPeople = 0;
      let maxReached = false;
      for (const guest of guests) {
        const sumPeople =
          Number(guest.baby) +
          Number(guest.chairs_only) +
          Number(guest.high_chair) +
          Number(guest.peoples);
        totalPeople += sumPeople;
        if (sumPeople > Number(this.info.max_seats_each_row)) {
          maxReached = true;
        }

        if (this.info.show_tables_menu == 1) {
          const sumMenus =
            Number(guest.menu1) +
            Number(guest.menu2) +
            Number(guest.menu3) +
            Number(guest.menu4);
          totalPasti += sumMenus;
          if (sumMenus > Number(this.info.max_seats_each_row)) {
            maxReached = true;
          }
        }
      }
      if (this.info.show_tables_menu == 1) {
        if (totalPasti > maxSeats) {
          maxReached = true;
        }
      }

      if (totalPeople > maxSeats) {
        maxReached = true;
      }

      if (maxReached) {
        return true;
      } else {
        return false;
      }
    },
    closeDialog() {
      this.dialog = false;
    },
    editItem(item) {
      this.editForm = true;
      item.peoples = Number(item.peoples);
      item.baby = Number(item.baby);
      item.chairs_only = Number(item.chairs_only);
      item.high_chair = Number(item.high_chair);
      item.guest_type = Number(item.guest_type);
      item.menu1 = Number(item.menu1);
      item.menu2 = Number(item.menu2);
      item.menu3 = Number(item.menu3);
      item.menu4 = Number(item.menu4);
      item.table_id = Number(item.table_id);

      this.editedIndex = this.guest.guests.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.guestDialog = true;
    },
    close() {
      if (this.editForm) {
        this.editForm = false;
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        }, 300);
      }

      if (this.guestDialog) {
        this.guestDialog = false;
      }
    },
    printElm() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("print").innerHTML;

      // Get all stylesheets HTML
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }

      // Open the print window
      const WinPrint = window.open(
        "",
        "",
        "left=0,top=0,width=794,height=1123,toolbar=0,scrollbars=0,status=0"
      );

      WinPrint.document.write(`<!DOCTYPE html>
<html>
  <head>
    ${stylesHtml}
    <style>
    @media print {
  .v-btn, .v-icon, .v-toolbar {
    display: none !important;
  }
  .v-datatable__expand-content {
    border-bottom: 2px solid black;
  }
    .vertical-rectangle {
  /* The height is greater than the width to make it vertical/long */
  width: 100px;
  height: 600px;

  /* Styling for visibility */
  background-color: #3498db; /* A blue color */
  border: 2px solid #000000;
}
}
</style>
  </head>
  <body>
    ${prtHtml}
  </body>
</html>`);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    },
  },
  created() {
    let v = this;

    // On table select grab the table's id and other data
    EventBus.$on("table-select", (group) => {
      let table = group.attrs.table;
      this.tableId = table.id;
      // this.$store.commit("SET_CURRENT_TABLE_ID", table.id);
      this.tableName = table.textConfig.name;
      if (table.textConfig.maxSeats) {
        this.maxSeats = table.textConfig.maxSeats;
      }

      this.tableNumber = table.textConfig.number;
      this.clientName = table.textConfig.nomeCliente;
      this.tableSelected = table;
    });
  },
};
</script>

<style scoped>
/* Styling for the overall card structure */
.custom-card {
  border-bottom: 1px solid #ccc; /* Simple border for v-card elevation/outline */
  margin-top: 20px; /* Space between cards */
  padding: 16px; /* Inner padding */
}

.custom-card-title {
  padding-bottom: 8px;
}

.headline {
  font-size: 1.5rem; /* Equivalent to Vuetify's headline */
  font-weight: 500;
}

.custom-card-text {
  /* Remove Vuetify's py-0 equivalent padding if desired */
}

/* Layout for the Seating Arrangement (v-container/v-layout/v-flex replacement) */
.custom-grid-container {
  display: flex;
  flex-direction: column;
}

.guest-row {
  display: flex;
  width: 100%;
}

.guest-col {
  /* Simulates v-flex xs4 (12/3 = 4) */
  flex-basis: 33.333333%;
  max-width: 33.333333%;
  padding: 8px 4px; /* Small padding */
}

/* Specific Layout Adjustments */
.center-content {
  display: flex;
  justify-content: center; /* Equivalent to d-flex justify-center */
  align-items: center;
  flex-wrap: wrap; /* Allow guests to wrap if needed */
}

.right-align-content {
  display: flex;
  flex-direction: column; /* To stack the p tags */
  justify-content: flex-end; /* Equivalent to justify-end */
  align-items: flex-end; /* To align text to the right side of the column */
}

.guest-name {
  margin: 0 4px; /* Space between names in top/bottom rows */
}

/* Paragraph styling for left/right guests */
.guest-label {
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 8px; /* Equivalent to mb-2 */
  line-height: 1.2;
}

.guest-label:last-child {
  margin-bottom: 0; /* Remove margin from last element */
}

.right-align-content .guest-label {
  text-align: right; /* Equivalent to style="text-align: end;" */
}

/* Styling for the table visual placeholder */
.table-visual-placeholder {
  /* This is where the tableFormatted.styles will apply. */
  /* Example style for a circular table when tableFormatted.styles is not defined: */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid black;
}
.vertical-rectangle {
  /* The height is greater than the width to make it vertical/long */
  width: 100px;
  height: 300px;

  /* Styling for visibility */
  background-color: #3498db; /* A blue color */
  border: 2px solid #000000;
}

@media print {
  .v-btn,
  .v-icon {
    display: none !important;
  }
}
</style>
