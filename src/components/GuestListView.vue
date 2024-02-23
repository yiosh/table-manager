<template>
  <v-card :elevation="0" flat>
    <v-card-text class="px-0">
      <v-toolbar flat color="white" class="hidden-print-only">
        <!-- <v-text-field
          id="nometavolocliente"
          light
          class=""
          ref="cognomefield"
          hide-details
          v-model="nome_tavolo_cliente"
          @change="updateTableName"
          label="Nome tavolo cliente"
        ></v-text-field>
        <v-text-field
          id="notetavolo"
          class="ml-2"
          ref="notefield"
          hide-details
          light
          v-model="note_tavolo_cliente"
          @change="updateTableNote"
          placeholder="Note tavolo"
        >
          <template v-slot:append>
            <v-icon dark @click="updateTableNote">mdi-content-save</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          id="numeroalternativo"
          light
          ref="numeroalternativofield"
          hide-details
          class="ml-2"
          v-model="numero_alternativo"
          @change="updateNumberoAlternativo"
          label="Numero alternativo"
        ></v-text-field> -->
        <v-spacer></v-spacer>

        <GuestEditDialog
          :table="table"
          :labels="labels"
          :tableList="tableList"
          :guestEditDialog="guestEditDialog"
          :eIndex="editedIndex"
          :itemSelected="editedItem"
          :tableId="tableId"
          @dialog-closed="
            guestEditDialog = false;
            editedIndex = -1;
          "
        />
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="guests(this.tableId)"
        disable-initial-sort
        hide-actions
        :pagination.sync="pagination"
        :no-data-text="labels.there_are_no_guests_at_this_table"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.cognome }}</td>
          <td>{{ props.item.nome }}</td>
          <td>{{ props.item.peoples }}</td>
          <td>{{ props.item.baby }}</td>
          <td v-if="info.show_chairs_only != 0">
            {{ props.item.chairs_only }}
          </td>
          <td v-if="info.show_high_chair != 0">{{ props.item.high_chair }}</td>
          <template v-if="info.show_tables_menu != 0">
            <td>{{ props.item.menu1 }}</td>
            <td>{{ props.item.menu2 }}</td>
            <td>{{ props.item.menu3 }}</td>
            <td>{{ props.item.menu4 }}</td>
          </template>

          <td>{{ props.item.note_intolleranze }}</td>

          <td class="d-flex">
            <v-icon small class="mr-2" @click="editItem(props.item)"
              >edit</v-icon
            >
            <v-icon small @click="deleteGuest(props.item)">delete</v-icon>
          </td>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import GuestEditDialog from "./GuestEditDialog.vue";
import { mapState, mapGetters } from "vuex";
export default {
  name: "GuestListView",
  props: {
    tableId: Number,
    tableList: Array,
    table: Object,
  },
  components: {
    GuestEditDialog,
  },
  data: (vue) => ({
    pagination: {
      sortBy: "id",
      descending: true,
      rowsPerPage: -1,
    },
    nome_tavolo_cliente: null,
    note_tavolo_cliente: null,
    numero_alternativo: null,
    saveAndContinue: true,
    editForm: false,
    tableName: "",
    tableNumber: "",
    maxSeats: "",
    clientName: "",
    dialog: false,
    valid: true,
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
    guestEditDialog: false,
  }),
  computed: {
    currentTable() {
      const tables = this.$store.getters["table/getTables"];
      return tables.find((t) => t.id == this.tableId);
    },
    layoutId() {
      return this.$store.state.layout.id;
    },
    info() {
      return this.$store.getters.getInfo;
    },
    // headers() {
    //   if (this.info.show_tables_menu == 1) {
    //     return [
    //       { placeholder: "surname", text: "Cognome", value: "cognome" },
    //       { placeholder: "name", text: "Nome", value: "nome" },
    //       {
    //         placeholder: "adults",
    //         text: this.info.peoples_label,
    //         value: "peoples",
    //       },
    //       { placeholder: "child", text: this.info.baby_label, value: "baby" },
    //       {
    //         placeholder: "chairs",
    //         text: this.info.chairs_only_label,
    //         value: "chairs_only",
    //       },
    //       {
    //         placeholder: "highchairs",
    //         text: this.info.high_chair_label,
    //         value: "high_chair",
    //       },
    //       {
    //         placeholder: "noglutine",
    //         text: "No glutine",
    //         value: "menu1",
    //       },
    //       {
    //         placeholder: "nolattosio",
    //         text: "No lattosio",
    //         value: "menu2",
    //       },
    //       { placeholder: "vegano", text: "Vegano", value: "menu3" },
    //       {
    //         placeholder: "vegetariano",
    //         text: "Vegetariano",
    //         value: "menu4",
    //       },
    //       {
    //         placeholder: "note",
    //         text: "Nota",
    //         value: "note_intolleranze",
    //       },
    //       {
    //         placeholder: "actions",
    //         text: "Azioni",
    //         value: "nome",
    //         sortable: false,
    //       },
    //     ];
    //   } else {
    //     return [
    //       { placeholder: "surname", text: "Cognome", value: "cognome" },
    //       { placeholder: "name", text: "Nome", value: "nome" },
    //       {
    //         placeholder: "adults",
    //         text: this.info.peoples_label,
    //         value: "peoples",
    //       },
    //       { placeholder: "child", text: this.info.baby_label, value: "baby" },
    //       {
    //         placeholder: "chairs",
    //         text: this.info.chairs_only_label,
    //         value: "chairs_only",
    //       },
    //       {
    //         placeholder: "highchairs",
    //         text: this.info.high_chair_label,
    //         value: "high_chair",
    //       },

    //       {
    //         placeholder: "note",
    //         text: "Nota",
    //         value: "note_intolleranze",
    //       },
    //       {
    //         placeholder: "actions",
    //         text: "Azioni",
    //         value: "nome",
    //         sortable: false,
    //       },
    //     ];
    //   }

    // },
    headers() {
      let indexAdded = 4;
      let arr = [
        { placeholder: "surname", text: "Cognome", value: "cognome" },
        { placeholder: "name", text: "Nome", value: "nome" },
        {
          placeholder: "adults",
          text: this.info.peoples_label,
          value: "peoples",
        },
        { placeholder: "child", text: this.info.baby_label, value: "baby" },

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

      if (this.info.show_chairs_only != 0) {
        arr = arr.slice(0, indexAdded).concat(
          [
            {
              placeholder: "chairs",
              text: this.info.chairs_only_label,
              value: "chairs_only",
            },
          ],
          arr.slice(indexAdded)
        );
        indexAdded++;
      }

      if (this.info.show_high_chair != 0) {
        arr = arr.slice(0, indexAdded).concat(
          [
            {
              placeholder: "highchairs",
              text: this.info.high_chair_label,
              value: "high_chair",
            },
          ],
          arr.slice(indexAdded)
        );
        indexAdded++;
      }
      if (this.info.show_tables_menu != 0) {
        let toAdd = [
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
        ];
        arr = arr.slice(0, indexAdded).concat(toAdd, arr.slice(indexAdded));
      }
      return arr;
    },
    ...mapState(["guest"]),

    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" }),
  },
  methods: {
    deleteGuest(guest) {
      confirm(
        `${this.labels.delete_guest_confirm} ${guest.nome} ${guest.cognome}?`
      ) &&
        // Delete Guest
        this.$store.dispatch("guest/deleteGuest", guest);
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
    updateNumberoAlternativo(string) {
      console.log("yes");
      let updatedItem = {
        id: this.tableId,
        numeroAlternativo: string,
        layoutId: this.layoutId,
      };

      console.log("updatedItem", updatedItem);

      // if (
      //   JSON.stringify(this.editedItem) !== JSON.stringify(this.defaultItem)
      // ) {
      this.$store.dispatch("table/updateNumeroAlternativo", updatedItem);
      // this.defaultItem = Object.assign({}, updatedItem);
      this.$store.state.stage.draw();
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
      this.guestEditDialog = true;
    },
  },
  mounted() {
    if (this.currentTable) {
      this.nome_tavolo_cliente = this.currentTable.nome_cliente;
      this.note_tavolo_cliente = this.currentTable.note_tavolo;
      this.numero_alternativo = this.currentTable.numero_alternativo;
    }
  },
};
</script>
