<template>
  <v-dialog v-model="guestDialog" max-width="500px" persistent>
    <v-btn slot="activator" color="primary" dark class="mb-2"
      >Tavolo Report</v-btn
    >
    <v-card id="print">
      <v-card-title>
        <span class="headline">{{ tableName }} {{ tableNumber }}</span>
      </v-card-title>

      <v-card-text>
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
      </v-card-text>

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

<style>
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
