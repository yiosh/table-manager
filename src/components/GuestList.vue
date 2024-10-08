<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title>
            {{ labels.list_of_guests }} - {{ tableName }}
            {{ tableNumber == 0 ? "" : tableNumber }}
            {{ clientName }}
            {{ maxSeats ? `(Max ${maxSeats})` : "" }}
          </v-toolbar-title>
          <v-text-field
            id="nometavolocliente"
            light
            class="ml-2"
            ref="cognomefield"
            hide-details
            solo
            :readonly="info.block_guests == 1"
            v-model="nome_tavolo_cliente"
            @change="updateTableName"
            label="Nome tavolo cliente"
          ></v-text-field>
          <v-text-field
            id="notetavolo"
            class="ml-2"
            ref="notefield"
            hide-details
            solo
            light
            :readonly="info.block_guests == 1"
            v-model="note_tavolo_cliente"
            @change="updateTableNote"
            placeholder="Note tavolo"
          >
            <template v-slot:append>
              <v-icon dark @click="updateTableNote">mdi-content-save</v-icon>
            </template>
          </v-text-field>
          <v-spacer></v-spacer>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-toolbar flat color="white">
            <v-spacer></v-spacer>
            <MigrationDialog
              :tableId="tableId"
              :layout="layout"
              :tableNumber="tableNumber"
              :maxSeats="maxSeats"
              :numberOfGuests="numberOfGuests"
            />
            <v-dialog v-model="guestDialog" max-width="500px" persistent>
              <v-btn
                v-if="info.block_guests == 0"
                slot="activator"
                @click="editedItem.table_id = Number(tableId)"
                color="primary"
                dark
                class="mb-2"
                >{{ labels.create_new_guest }}</v-btn
              >
              <v-card>
                <v-form v-model="valid" @submit.prevent="save">
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            id="cognomefield"
                            ref="cognomefield"
                            @input="onInput"
                            v-model="editedItem.cognome"
                            :label="labels.surname"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="editedItem.nome"
                            @input="onInput"
                            :label="labels.name"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.peoples"
                            :rules="numberRules"
                            :label="info.peoples_label"
                            type="number"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.baby"
                            :rules="numberRules"
                            :label="info.baby_label"
                            type="number"
                          ></v-text-field>
                        </v-flex>
                        <v-flex v-if="info.show_chairs_only == 1" xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.chairs_only"
                            :rules="numberRules"
                            :label="info.chairs_only_label"
                            type="number"
                          ></v-text-field>
                        </v-flex>
                        <v-flex v-if="info.show_high_chair == 1" xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.high_chair"
                            :rules="numberRules"
                            :label="info.high_chair_label"
                            type="number"
                          ></v-text-field>
                        </v-flex>

                        <!-- New Guest Section -->
                        <template v-if="info.show_tables_menu">
                          <v-flex xs12>
                            <v-toolbar flat height="24" dark color="#424242">
                              <v-toolbar-title>PASTI SPECIALI</v-toolbar-title>
                            </v-toolbar>
                          </v-flex>

                          <v-flex v-if="placeholderLabels.menu1" xs12 sm6 md3>
                            <v-text-field
                              v-model.number="editedItem.menu1"
                              :rules="numberRules"
                              :label="placeholderLabels.menu1"
                            ></v-text-field>
                          </v-flex>

                          <v-flex v-if="placeholderLabels.menu2" xs12 sm6 md3>
                            <v-text-field
                              v-model.number="editedItem.menu2"
                              :rules="numberRules"
                              :label="placeholderLabels.menu2"
                            ></v-text-field>
                          </v-flex>

                          <v-flex v-if="placeholderLabels.menu3" xs12 sm6 md3>
                            <v-text-field
                              v-model.number="editedItem.menu3"
                              :rules="numberRules"
                              :label="placeholderLabels.menu3"
                            ></v-text-field>
                          </v-flex>

                          <v-flex v-if="placeholderLabels.menu4" xs12 sm6 md3>
                            <v-text-field
                              v-model.number="editedItem.menu4"
                              :rules="numberRules2"
                              :label="placeholderLabels.menu4"
                            ></v-text-field>
                          </v-flex>
                        </template>
                        -->
                        <!-- End New Guest Section -->
                        <v-flex xs12>
                          <v-text-field
                            v-model="editedItem.note_intolleranze"
                            :placeholder="info.note_placeholder"
                            :label="labels.note"
                            placeholder="Note intolleranze, allergie o esigenze speciali"
                          ></v-text-field>
                        </v-flex>
                        <v-flex v-if="info.show_guest_types == 1" xs12>
                          <v-select
                            item-text="text"
                            item-value="value"
                            v-model.number="editedItem.guest_type"
                            :items="guestTypes"
                            :label="labels.guest_type"
                          ></v-select>
                        </v-flex>

                        <v-flex xs12>
                          <v-select
                            item-text="text"
                            item-value="value"
                            v-model.number="editedItem.table_id"
                            :items="tableList"
                            label="Associa al tavolo"
                          ></v-select>
                        </v-flex>
                        <v-flex xs12 v-if="!editForm">
                          <v-checkbox
                            v-model="saveAndContinue"
                            :label="labels.save_and_continue"
                          ></v-checkbox>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      :disabled="valid == false"
                      color="success"
                      class="white--text"
                      type="submit"
                    >
                      {{ labels.save }}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click="close">
                      {{ labels.close }}
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
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
              <td v-if="info.show_high_chair != 0">
                {{ props.item.high_chair }}
              </td>
              <template v-if="info.show_tables_menu == 1">
                <td v-if="info.menu1">{{ props.item.menu1 }}</td>
                <td v-if="info.menu2">{{ props.item.menu2 }}</td>
                <td v-if="info.menu3">{{ props.item.menu3 }}</td>
                <td v-if="info.menu4">{{ props.item.menu4 }}</td>
              </template>

              <td>{{ props.item.note_intolleranze }}</td>

              <td class="d-flex">
                <v-icon
                  v-if="info.block_guests == 0"
                  small
                  class="mr-2"
                  @click="editItem(props.item)"
                  >edit</v-icon
                >
                <v-icon
                  v-if="info.block_guests == 0"
                  small
                  @click="deleteGuest(props.item)"
                  >delete</v-icon
                >
              </td>
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
import MigrationDialog from "./MigrationDialog";

export default {
  name: "GuestList",
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
    "editedItem.table_id"(newId, oldId) {
      if (newId) {
        if (this.maxSeatsCheck(this.editedItem, newId)) {
          const notification = {
            type: "error",
            multiLine: true,
            message:
              "Non ci sono abbastanza posti su quel tavolo per spostare lì questo ospite",
          };
          this.$store.dispatch("notification/add", notification, {
            root: true,
          });
          console.log("tableIds", oldId, newId);
          if (newId != oldId) {
            setTimeout(() => {
              this.editedItem.table_id = oldId;
            }, 500);
          }
        }
      }
    },
  },
  computed: {
    nome() {
      return this.editedItem.nome;
    },
    cognome() {
      return this.editedItem.cognome;
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
    layout() {
      return this.$store.state.layout;
    },

    info() {
      return this.$store.getters.getInfo;
    },
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
      if (this.info.show_tables_menu == 1) {
        let toAdd = [];

        if (this.info.menu1) {
          toAdd.push({
            placeholder: "noglutine",
            text: this.info.menu1,
            value: "menu1",
          });
        }
        if (this.info.menu2) {
          toAdd.push({
            placeholder: "nolattosio",
            text: this.info.menu2,
            value: "menu2",
          });
        }
        if (this.info.menu3) {
          toAdd.push({
            placeholder: "vegano",
            text: this.info.menu3,
            value: "menu3",
          });
        }
        if (this.info.menu4) {
          toAdd.push({
            placeholder: "vegetariano",
            text: this.info.menu4,
            value: "menu4",
          });
        }
        arr = arr.slice(0, indexAdded).concat(toAdd, arr.slice(indexAdded));
      }
      return arr;
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

      console.log("updatedItem", updatedItem);

      this.$store.dispatch("table/updateClientName", updatedItem);
      this.$store.state.stage.draw();
    },
    updateTableNote(string) {
      let updatedItem = {
        id: this.tableId,
        noteCliente: string,
        layoutId: this.layout.id,
      };

      console.log("updatedItem", updatedItem);

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
      console.log("item", item);
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
          const tableId = JSON.parse(JSON.stringify(this.editedItem.table_id));
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedItem.table_id = tableId;
          this.editedIndex = -1;
          console.log("e", this.editedItem);
        }, 300);
      }

      if (this.guestDialog) {
        this.guestDialog = false;
      }
    },
    save() {
      let guest = Object.assign({}, this.editedItem);

      // CHECK IF THERE IS ATLEAST ONE GUEST
      const sumPeople =
        Number(guest.baby) +
        Number(guest.chairs_only) +
        Number(guest.high_chair) +
        Number(guest.peoples);

      if (sumPeople < 1) {
        const notification = {
          type: "error",
          multiLine: true,
          message: "È necessario che almeno un ospite sia aggiunto al tavolo",
        };
        this.$store.dispatch("notification/add", notification, { root: true });
        return;
      }
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
        this.$store.dispatch("table/getTables", this.layout.id, {
          root: true,
        });
        this.close();
      } else {
        // Create a New Guest

        const tableId = JSON.parse(JSON.stringify(this.editedItem.table_id));
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
    let v = this;

    // On table select grab the table's id and other data
    EventBus.$on("table-select", (group) => {
      let table = group.attrs.table;
      console.log("group", table.textConfig);
      this.tableId = table.id;
      this.$store.commit("SET_CURRENT_TABLE_ID", table.id);
      this.tableName = table.textConfig.name;
      if (table.textConfig.maxSeats) {
        this.maxSeats = table.textConfig.maxSeats;
      }
      v.nome_tavolo_cliente = table.textConfig.nomeCliente;
      v.note_tavolo_cliente = table.textConfig.noteCliente;

      this.tableNumber = table.textConfig.number;
      this.clientName = table.textConfig.nomeCliente;
    });

    EventBus.$on("update-table-fields", (payload) => {
      if (payload.nomeCliente) {
        v.nome_tavolo_cliente = payload.nomeCliente;
      }
      if (payload.noteCliente) {
        v.note_tavolo_cliente = payload.noteCliente;
      }
    });

    EventBus.$on("guest-list-select", () => {
      console.log("wtf");
      if (this.$store.state.selectedGroup != null) {
        this.dialog = true;
      } else {
        const notification = {
          type: "warning",
          message:
            "Devi selezionare un tavolo per aprire la sua lista degli ospiti",
        };
        this.$store.dispatch("notification/add", notification, { root: true });
      }
    });
  },
};
</script>
