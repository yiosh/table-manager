<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title>
            Resume
          </v-toolbar-title>
          <v-btn icon class="ml-4" @click="printDialogContent">
            <v-icon>print</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-data-table
            id="table-print"
            :headers="headers"
            :items="items"
            disable-initial-sort
            hide-actions
            :pagination.sync="pagination"
            :no-data-text="labels.there_are_no_guests_at_this_table"
          >
            <template slot="items" slot-scope="props">
              <tr>
                <td class="border-top">{{ props.item.table_name }}</td>
                <!-- <td>{{ props.item.table_number }}</td> -->
                <td class="border-top">
                  <strong>{{ props.item.tot_seats }}</strong>
                </td>
                <td class="border-top">
                  <strong>{{ props.item.tot_peoples }}</strong>
                </td>
                <td class="border-top">
                  <strong>{{ props.item.tot_baby }}</strong>
                </td>
                <td class="border-top">
                  <strong>{{ props.item.tot_chairs_only }}</strong>
                </td>
                <td class="border-top">
                  <strong>{{ props.item.tot_high_chair }}</strong>
                </td>
                <template v-if="info.show_tables_menu == 1">
                  <td class="border-top">
                    <strong>{{ props.item.tot_menu_speciali }}</strong>
                  </td>
                </template>

                <td class="border-top">{{ props.item.note_intolleranze }}</td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { EventBus } from "../event-bus.js";
import { mapState, mapGetters } from "vuex";
import TMService from "@/services/TMService";

export default {
  name: "GuestResume",
  data: (vue) => {
    return {
      pagination: {
        sortBy: "id",
        descending: true,
        rowsPerPage: -1,
      },
      nome_tavolo_cliente: null,
      note_tavolo_cliente: null,
      currentTable: null,
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
      editedIndex: -1,
      editedItem: {
        id: null,
        nome: "",
        cognome: "",
        peoples: 0,
        baby: 0,
        chairs_only: 0,
        high_chair: 0,
        note_intolleranze: "",
        guest_type: 3,
        menu1: 0,
        menu2: 0,
        menu3: 0,
        menu4: 0,
      },
      defaultItem: {
        id: null,
        nome: "",
        cognome: "",
        peoples: 0,
        baby: 0,
        chairs_only: 0,
        high_chair: 0,
        note_intolleranze: "",
        guest_type: 3,
        menu1: 0,
        menu2: 0,
        menu3: 0,
        menu4: 0,
      },
      numberRules: [
        (v) => typeof v === "number" || "Per favore inserisci un numero",
        (v) =>
          Number(v) <= Number(vue.info.max_seats_each_row) ||
          "Per favore inserisci un numero minore o uguale a " +
            vue.info.max_seats_each_row,
      ],
      numberRules2: [
        (v) => typeof v === "number" || "Per favore inserisci un numero",
      ],
      items: [],
    };
  },
  watch: {
    nome(newValue) {
      this.editedItem.nome =
        newValue.charAt(0).toUpperCase() + newValue.slice(1);
    },
    cognome(newValue) {
      this.editedItem.cognome =
        newValue.charAt(0).toUpperCase() + newValue.slice(1);
    },
  },
  computed: {
    nome() {
      return this.editedItem.nome;
    },
    cognome() {
      return this.editedItem.cognome;
    },
    guestListDialog() {
      return this.$refs.dialog.isActive;
    },
    placeholderLabels() {
      return this.$store.state.labels;
    },
    formTitle() {
      return this.editedIndex === -1
        ? this.labels.create_new_guest
        : this.labels.edit_guest;
    },
    tableList() {
      const tables = this.$store.getters["table/getTables"];
      let options = [];
      tables.forEach((t) => {
        if (!t.table_name.includes("HIDDEN")) {
          options.push({
            text: `${t.table_name} ${t.table_number}`,
            value: Number(t.id),
          });
        }
      });
      return options;
    },
    currentGroup() {
      const groups = this.$store.getters["table/getGroups"];
      const group = groups.find((g) => g.table.id == this.tableId);
      return group;
    },
    layoutId() {
      return this.$store.state.layout.id;
    },
    info() {
      return this.$store.getters.getInfo;
    },
    headers() {
      if (this.info.show_tables_menu == 1) {
        return [
          // { placeholder: "table_number", text: "N. Tavolo", value: "table_number" },
          {
            placeholder: "table_name",
            text: "Nome tavolo",
            value: "table_name",
          },
          {
            placeholder: "tot_seats",
            text: "Tot. Posti",
            width: "10%",
            value: "tot_seats",
          },
          {
            placeholder: "tot_peoples",
            text: `Tot. ${this.info.peoples_label}`,
            width: "10%",

            value: "tot_peoples",
          },
          {
            placeholder: "tot_baby",
            text: `Tot. ${this.info.baby_label}`,
            width: "10%",

            value: "tot_baby",
          },
          {
            placeholder: "tot_chairs_only",
            text: `Tot. ${this.info.chairs_only_label}`,
            width: "10%",

            value: "tot_chairs_only",
          },
          {
            placeholder: "tot_high_chair",
            text: `Tot. ${this.info.high_chair_label}`,
            width: "10%",

            value: "tot_high_chair",
          },
          {
            placeholder: "tot_menu_speciali",
            text: "Tot. Pasti speciali",
            width: "10%",

            value: "tot_menu_speciali",
          },
          {
            placeholder: "note_intolleranze",
            text: "Note",
            value: "note_intolleranze",
          },
        ];
      } else {
        return [
          {
            placeholder: "table_name",
            text: "Nome tavolo",
            value: "table_name",
          },
          {
            placeholder: "tot_seats",
            width: "10%",

            text: "Tot. Posti",
            value: "tot_seats",
          },
          {
            placeholder: "tot_peoples",
            text: `Tot. ${this.info.peoples_label}`,
            width: "10%",

            value: "tot_peoples",
          },
          {
            placeholder: "tot_baby",
            text: `Tot. ${this.info.baby_label}`,
            width: "10%",

            value: "tot_baby",
          },
          {
            placeholder: "tot_chairs_only",
            text: `Tot. ${this.info.chairs_only_label}`,
            width: "10%",

            value: "tot_chairs_only",
          },
          {
            placeholder: "tot_high_chair",
            text: `Tot. ${this.info.high_chair_label}`,
            width: "10%",

            value: "tot_high_chair",
          },
          {
            placeholder: "note_intolleranze",
            text: "Note",
            value: "note_intolleranze",
          },
        ];
      }
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

    ...mapState(["guest"]),
    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" }),
  },
  methods: {
    printDialogContent() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("table-print").innerHTML;

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
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
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
  .border-top {
    border-top: 1px solid black;
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
    calculateTotSeats(item) {
      let total = 0;
      total += Number(item.tot_peoples);
      total += Number(item.tot_baby);
      total += Number(item.tot_chairs_only);
      total += Number(item.tot_high_chair);
      return total;
    },
    async getResume() {
      try {
        const response = await TMService.getResume(this.layoutId);
        // console.log("response", response);
        let tables = response.data.dati;
        tables = tables.filter((t) => {
          if (!t.table_name.includes("HIDDEN")) {
            return t;
          }
        });
        let totSeats = 0;
        let totPeoples = 0;
        let totBaby = 0;
        let totChairsOnly = 0;
        let totHighChair = 0;
        let totMenuSpeciali = 0;

        for (let index = 0; index < tables.length; index++) {
          const element = tables[index];

          element.tot_seats = this.calculateTotSeats(element);
          totSeats += element.tot_seats;
          if (element.tot_peoples) {
            totPeoples += Number(element.tot_peoples);
          }
          if (element.tot_baby) {
            totBaby += Number(element.tot_baby);
          }
          if (element.tot_chairs_only) {
            totChairsOnly += Number(element.tot_chairs_only);
          }
          if (element.tot_high_chair) {
            totHighChair += Number(element.tot_high_chair);
          }
          if (this.info.show_tables_menu == 1) {
            totMenuSpeciali += Number(element.tot_menu_speciali);
          }
        }

        tables.push({
          table_name: "TOTALE",
          tot_seats: totSeats,
          tot_peoples: totPeoples,
          tot_baby: totBaby,
          tot_chairs_only: totChairsOnly,
          tot_high_chair: totHighChair,
          tot_menu_speciali: totMenuSpeciali,
        });
        this.items = tables;
      } catch (error) {
        console.log("resumeerror", error);
      }
    },
    onInput(event) {
      // Prevent the default input event from being triggered,
      // which would cause the input value to be updated before the watch function is called.
      event.preventDefault();
    },
    updateTableName(string) {
      let updatedItem = {
        id: this.tableId,
        nomeCliente: string,
        layoutId: this.layoutId,
      };

      console.log("updatedItem", updatedItem);

      // if (
      //   JSON.stringify(this.editedItem) !== JSON.stringify(this.defaultItem)
      // ) {
      this.$store.dispatch("table/updateClientName", updatedItem);
      // this.defaultItem = Object.assign({}, updatedItem);
      this.$store.state.stage.draw();
    },
    updateTableNote(string) {
      let updatedItem = {
        id: this.tableId,
        noteCliente: string,
        layoutId: this.layoutId,
      };

      console.log("updatedItem", updatedItem);

      // if (
      //   JSON.stringify(this.editedItem) !== JSON.stringify(this.defaultItem)
      // ) {
      this.$store.dispatch("table/updateClientNote", updatedItem);
      // this.defaultItem = Object.assign({}, updatedItem);
      this.$store.state.stage.draw();
    },
    changeTable(id) {
      let guest = Object.assign(this.editedItem);
      guest.table_id = id;
      // this.$store.dispatch("guest/updateGuest", guest);
    },
    // totalpastiCheck(guest) {
    //   const maxSeats = Number(this.maxSeats);
    // },
    maxSeatsCheck(newGuest) {
      if (Number(this.tableId) != Number(newGuest.table_id)) {
        return false;
      }
      console.log("guest", newGuest);
      const maxSeats = Number(this.maxSeats);
      let guests = JSON.parse(JSON.stringify(this.guests(this.tableId)));
      const index = guests.findIndex((guest) => guest.id === newGuest.id);
      if (index !== -1) {
        guests[index] = Object.assign({}, newGuest);
      } else {
        guests.push(newGuest);
      }
      let totalPasti = 0;
      let totalPeople = 0;
      for (const guest of guests) {
        totalPeople += Number(guest.baby);
        totalPeople += Number(guest.chairs_only);
        totalPeople += Number(guest.high_chair);
        totalPeople += Number(guest.peoples);

        if (this.placeholderLabels.menu1) {
          totalPasti += Number(guest.menu1);
          totalPasti += Number(guest.menu2);
          totalPasti += Number(guest.menu3);
          totalPasti += Number(guest.menu4);
        }
      }
      if (this.placeholderLabels.menu1) {
        console.log("w", totalPasti, totalPeople);
        if (totalPeople > maxSeats || totalPasti > maxSeats) {
          console.log("went too far", totalPasti, totalPeople);
          return true;
        } else {
          console.log("ok", totalPasti, totalPeople);
          return false;
        }
      }

      if (totalPeople > maxSeats) {
        return true;
      } else {
        return false;
      }
    },
    closeDialog() {
      this.dialog = false;
    },
    editItem(item) {
      console.log("item", item);
      this.editForm = true;
      console.log("item", item);
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
      // this.editedItem.nome_cliente = this.guest.
      // nome_tavolo_cliente = this.currentTable = Number(item.table_id);
      this.guestDialog = true;
    },
    deleteGuest(guest) {
      confirm(
        `${this.labels.delete_guest_confirm} ${guest.nome} ${guest.cognome}?`
      ) &&
        // Delete Guest
        this.$store.dispatch("guest/deleteGuest", guest);
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
    save() {
      let guest = Object.assign({}, this.editedItem);
      console.log("guest", guest);
      // guest.table_id = this.editedItem.table_id;
      console.log("up", guest);
      console.log("isItMax", this.maxSeatsCheck(guest));
      if (this.maxSeatsCheck(guest)) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Hai inserito più ospiti o pasti, di quelli consentiti da questo tavolo",
        };
        this.$store.dispatch("notification/add", notification, { root: true });
        return;
      }
      console.log("isItMax", this.maxSeatsCheck(guest));
      if (guest.note_intolleranze != "") {
        const payload = {
          tableId: this.tableId,
          state: true,
        };
        this.$store.dispatch("table/handleAsterisc", payload);
      }
      if (this.editedIndex > -1) {
        // Update existing guest
        this.$store.dispatch("guest/updateGuest", guest);
        this.$store.dispatch("table/getTables", this.layoutId, {
          root: true,
        });
        this.close();
      } else {
        // Create a New Guest

        const tableId = this.editedItem.table_id;
        this.$store.dispatch("guest/addGuest", { tableId, guest });
        document.getElementById("cognomefield").focus();
      }
      if (!this.saveAndContinue) {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.close();
      } else {
        const tId = this.editedItem.table_id;

        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem.table_id = tId;
      }
      //
    },
  },
  created() {
    this.getResume();

    EventBus.$on("data-updated", () => {
      this.getResume();
    });

    let v = this;

    EventBus.$on("table-resume-select", () => {
      console.log("yes");
      v.dialog = true;
    });
  },
};
</script>
