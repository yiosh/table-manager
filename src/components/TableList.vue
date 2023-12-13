<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" scrollable>
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title>
            Elenco dei tavoli
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-text-field
            id="numeroalternativo"
            light
            solo
            style="max-width: 300px;"
            ref="numeroalternativofield"
            hide-details
            class="mr-2"
            v-model="search"
            label="Ricerca"
            prepend-inner-icon="search"
          ></v-text-field>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-expansion-panel expand>
            <v-expansion-panel-content
              v-for="({ text, value }, i) in tableListFiltered"
              :key="i"
            >
              <template v-slot:header>
                <div>{{ text }}</div>
              </template>
              <v-card>
                <v-card-text
                  ><GuestListView :tableList="tableList" :tableId="value"
                /></v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { EventBus } from "../event-bus.js";
import { mapState, mapGetters } from "vuex";
import GuestListView from "./GuestListView.vue";

export default {
  name: "TableList",
  components: { GuestListView },
  props: {
    tableListDialog: Boolean,
  },
  data: (vue) => {
    return {
      search: "",
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
      // labelsEn: {
      //   list_of_guests: "List of Guests",
      //   create_new_guest: "Create New Guest",
      //   surname: "Surname",
      //   name: "Name",
      //   adults: "Adults",
      //   child: "Child",
      //   chairs: "Chairs",
      //   high_chairs: "High Chairs",
      //   note: "Note",
      //   guest_type: "Guest Type",
      //   save_and_continue: "Save and Continue",
      //   save: "Save",
      //   close: "Close",
      //   there_are_no_guests_at_this_table: "There are no guests at this table",
      //   edit_guest: "Edit Guest",
      //   delete_guest_confirm: "Are you sure you wish to delete guest ",
      //   headers: [
      //     { placeholder: "surname", text: "Surname", value: "cognome" },
      //     { placeholder: "name", text: "Name", value: "nome" },
      //     { placeholder: "adults", text: "Adults", value: "peoples" },
      //     { placeholder: "child", text: "Child", value: "baby" },
      //     { placeholder: "chairs", text: "Chairs", value: "chairs_only" },
      //     {
      //       placeholder: "highchairs",
      //       text: "Highchairs",
      //       value: "high_chair"
      //     },
      //     { placeholder: "note", text: "Note", value: "note_intolleranze" },
      //     {
      //       placeholder: "actions",
      //       text: "Actions",
      //       value: "nome",
      //       sortable: false
      //     }
      //   ]
      // },
      // headers: [
      //     { placeholder: "surname", text: "Cognome", value: "cognome" },
      //     { placeholder: "name", text: "Nome", value: "nome" },
      //     { placeholder: "adults", text: "Adulti", value: "peoples" },
      //     { placeholder: "child", text: "Baby", value: "baby" },
      //     { placeholder: "chairs", text: "Sedie", value: "chairs_only" },
      //     {
      //       placeholder: "highchairs",
      //       text: "Seggioloni",
      //       value: "high_chair"
      //     },
      //     { placeholder: "note", text: "Nota", value: "note_intolleranze" },
      //     {
      //       placeholder: "actions",
      //       text: "Azioni",
      //       value: "nome",
      //       sortable: false
      //     }
      //   ],
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
        // headers: [
        //   { placeholder: "surname", text: "Cognome", value: "cognome" },
        //   { placeholder: "name", text: "Nome", value: "nome" },
        //   { placeholder: "adults", text: "Adulti", value: "peoples" },
        //   { placeholder: "child", text: "Baby", value: "baby" },
        //   { placeholder: "chairs", text: "Sedie", value: "chairs_only" },
        //   {
        //     placeholder: "highchairs",
        //     text: "Seggioloni",
        //     value: "high_chair",
        //   },
        //   { placeholder: "noglutine", text: "No glutine", value: "menu1" },
        //   { placeholder: "nolattosio", text: "No lattosio", value: "menu2" },
        //   { placeholder: "vegano", text: "Vegano", value: "menu3" },
        //   { placeholder: "vegetariano", text: "Vegetariano", value: "menu4" },
        //   { placeholder: "note", text: "Nota", value: "note_intolleranze" },
        //   {
        //     placeholder: "actions",
        //     text: "Azioni",
        //     value: "nome",
        //     sortable: false,
        //   },
        // ],
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
    tableListDialog() {
      this.dialog = this.tableListDialog;
    },
    dialog() {
      if (this.dialog == false) {
        this.$emit("dialog-closed");
      }
    },
  },
  computed: {
    tableListFiltered() {
      if (this.search) {
        return this.tableList.filter((t) =>
          t.text.toUpperCase().includes(this.search.toUpperCase())
        );
      }
      return this.tableList;
    },
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
          { placeholder: "surname", text: "Cognome", value: "cognome" },
          { placeholder: "name", text: "Nome", value: "nome" },
          {
            placeholder: "adults",
            text: this.info.peoples_label,
            value: "peoples",
          },
          { placeholder: "child", text: this.info.baby_label, value: "baby" },
          {
            placeholder: "chairs",
            text: this.info.chairs_only_label,
            value: "chairs_only",
          },
          {
            placeholder: "highchairs",
            text: this.info.high_chair_label,
            value: "high_chair",
          },
          {
            placeholder: "noglutine",
            text: "No glutine",
            value: "menu1",
          },
          {
            placeholder: "nolattosio",
            text: "No lattosio",
            value: "menu2",
          },
          { placeholder: "vegano", text: "Vegano", value: "menu3" },
          {
            placeholder: "vegetariano",
            text: "Vegetariano",
            value: "menu4",
          },
          {
            placeholder: "note",
            text: "Nota",
            value: "note_intolleranze",
          },
          {
            placeholder: "actions",
            text: "Azioni",
            value: "nome",
            sortable: false,
          },
        ];
      } else {
        return [
          { placeholder: "surname", text: "Cognome", value: "cognome" },
          { placeholder: "name", text: "Nome", value: "nome" },
          {
            placeholder: "adults",
            text: this.info.peoples_label,
            value: "peoples",
          },
          { placeholder: "child", text: this.info.baby_label, value: "baby" },
          {
            placeholder: "chairs",
            text: this.info.chairs_only_label,
            value: "chairs_only",
          },
          {
            placeholder: "highchairs",
            text: this.info.high_chair_label,
            value: "high_chair",
          },
          {
            placeholder: "note",
            text: "Nota",
            value: "note_intolleranze",
          },
          {
            placeholder: "actions",
            text: "Azioni",
            value: "nome",
            sortable: false,
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
    // let v = this;
    // // On table select grab the table's id and other data
    // EventBus.$on("table-select", (group) => {
    //   let table = group.attrs.table;
    //   console.log("group", table.textConfig);
    //   this.tableId = table.id;
    //   this.$store.commit("SET_CURRENT_TABLE_ID", table.id);
    //   this.tableName = table.textConfig.name;
    //   if (table.textConfig.maxSeats) {
    //     this.maxSeats = table.textConfig.maxSeats;
    //   }
    //   v.nome_tavolo_cliente = table.textConfig.nomeCliente;
    //   v.note_tavolo_cliente = table.textConfig.noteCliente;
    //   this.tableNumber = table.textConfig.number;
    //   this.clientName = table.textConfig.nomeCliente;
    // });
    // EventBus.$on("guest-list-select", () => {
    //   if (this.$store.state.selectedGroup != null) {
    //     this.dialog = true;
    //     // console.log("vm", this);
    //   } else {
    //     const notification = {
    //       type: "warning",
    //       message:
    //         "Devi selezionare un tavolo per aprire la sua lista degli ospiti",
    //     };
    //     this.$store.dispatch("notification/add", notification, { root: true });
    //   }
    // });
  },
};
</script>
