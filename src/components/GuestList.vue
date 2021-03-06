<template>
  <v-layout row justify-center @click="log">
    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title
            >{{ labels.list_of_guests }} - {{ tableName }}
            {{ tableNumber == 0 ? "" : tableNumber }}
            {{ clientName }} {{ maxSeats ? `(Max ${maxSeats})` : "" }}</v-toolbar-title
          >
          <v-spacer></v-spacer>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-toolbar flat color="white">
            <v-spacer></v-spacer>
            <v-dialog v-model="guestDialog" max-width="500px">
              <v-btn slot="activator" color="primary" dark class="mb-2"
                >{{ labels.create_new_guest }}
              </v-btn>
              <v-card>
                <v-form @submit.prevent="save">
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
                            v-model="editedItem.cognome"
                            :label="labels.surname"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="editedItem.nome"
                            :label="labels.name"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.peoples"
                            :rules="numberRules"
                            :label="labels.adults"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.baby"
                            :rules="numberRules"
                            :label="labels.child"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.chairs_only"
                            :rules="numberRules"
                            :label="labels.chairs"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md3>
                          <v-text-field
                            v-model.number="editedItem.high_chair"
                            :rules="numberRules"
                            :label="labels.high_chairs"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                          <v-text-field
                            v-model="editedItem.note_intolleranze"
                            :label="labels.note"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                          <v-select
                            item-text="text"
                            item-value="value"
                            v-model.number="editedItem.guest_type"
                            :items="guestTypes"
                            :label="labels.guest_type"
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
                    <v-btn color="success" dark type="submit">{{
                      labels.save
                    }}</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click="close">{{
                      labels.close
                    }}</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
          </v-toolbar>
          <v-data-table
            :headers="labels.headers"
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
              <td>{{ props.item.chairs_only }}</td>
              <td>{{ props.item.high_chair }}</td>
              <td>{{ props.item.note_intolleranze }}</td>
              <td>
                <v-icon small class="mr-2" @click="editItem(props.item)"
                  >edit</v-icon
                >
                <v-icon small @click="deleteGuest(props.item)">delete</v-icon>
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

export default {
  name: "GuestList",
  data() {
    return {
      pagination: {
        sortBy: "id",
        descending: true,
        rowsPerPage: -1
      },
      saveAndContinue: true,
      editForm: false,
      tableId: null,
      tableName: "",
      tableNumber: "",
      maxSeats: "",
      clientName: "",
      dialog: false,
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
      labels: {
        list_of_guests: "Elenco degli ospiti",
        create_new_guest: "Crea nuovo ospite",
        surname: "Cognome",
        name: "Nome",
        adults: "Adulti",
        child: "Bambino",
        chairs: "Sedie",
        high_chairs: "Seggioloni",
        note: "Nota",
        guest_type: "Tipo di ospite",
        save_and_continue: "Salva e continua",
        save: "Salva",
        close: "Chiudi",
        there_are_no_guests_at_this_table: "Non ci sono ospiti a questo tavolo",
        edit_guest: "Modifica ospite",
        delete_guest_confirm: "Sei sicuro di voler cancellare l'ospite ",
        headers: [
          { placeholder: "surname", text: "Cognome", value: "cognome" },
          { placeholder: "name", text: "Nome", value: "nome" },
          { placeholder: "adults", text: "Adulti", value: "peoples" },
          { placeholder: "child", text: "Baby", value: "baby" },
          { placeholder: "chairs", text: "Sedie", value: "chairs_only" },
          {
            placeholder: "highchairs",
            text: "Seggioloni",
            value: "high_chair"
          },
          { placeholder: "note", text: "Nota", value: "note_intolleranze" },
          {
            placeholder: "actions",
            text: "Azioni",
            value: "nome",
            sortable: false
          }
        ]
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
        guest_type: 3
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
        guest_type: 3
      },
      numberRules: [
        v => typeof v === "number" || "Per favore inserisci un numero"
      ]
    };
  },
  computed: {
    guestListDialog() {
      return this.$$refs.dialog.isActive;
    },
    // peopleLabel() {
    //   if (this.$store.state.labels.peoples_label) {
    //     return this.$store.state.labels.peoples_label;
    //   } else {
    //     return "Persone";
    //   }
    // },
    // babyLabel() {
    //   if (this.$store.state.labels.baby_label) {
    //     return this.$store.state.labels.baby_label;
    //   } else {
    //     return "Bambini";
    //   }
    // },
    // chairsLabel() {
    //   if (this.$store.state.labels.chairs_only_label) {
    //     return this.$store.state.labels.chairs_only_label;
    //   } else {
    //     return "Sedie";
    //   }
    // },
    // highChairsLabel() {
    //   if (this.$store.state.labels.high_chair_label) {
    //     return this.$store.state.labels.high_chair_label;
    //   } else {
    //     return "Seggiolone";
    //   }
    // },
    formTitle() {
      return this.editedIndex === -1
        ? this.labels.create_new_guest
        : this.labels.edit_guest;
    },
    ...mapState(["guest"]),
    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" })
  },
  methods: {
    log() {
      console.log("this");
    },
    maxSeatsCheck(newGuest) {
      const maxSeats = Number(this.maxSeats);
      let guests = JSON.parse(JSON.stringify(this.guests(this.tableId)));
      const index = guests.findIndex(guest => guest.id === newGuest.id);
      if (index !== -1) {
        guests[index] = Object.assign({}, newGuest);
      } else {
        guests.push(newGuest);
      }
      let totalPeople = 0;
      for (const guest of guests) {
        totalPeople += Number(guest.baby);
        totalPeople += Number(guest.chairs_only);
        totalPeople += Number(guest.high_chair);
        totalPeople += Number(guest.peoples);
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
      this.editForm = true;
      console.log("item", item);
      item.peoples = Number(item.peoples);
      item.baby = Number(item.baby);
      item.chairs_only = Number(item.chairs_only);
      item.high_chair = Number(item.high_chair);
      item.guest_type = Number(item.guest_type);

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
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        }, 300);
      }

      if (this.guestDialog) {
        this.guestDialog = false;
      }
    },
    save() {
      let guest = this.editedItem;
      if (this.maxSeatsCheck(guest)) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Hai inserito più ospiti di quelli consentiti da questo tavolo"
        };
        this.$store.dispatch("notification/add", notification, { root: true });
        return;
      }
      console.log("isItMax", this.maxSeatsCheck(guest));
      if (guest.note_intolleranze != "") {
        const payload = {
          tableId: this.tableId,
          state: true
        };
        this.$store.dispatch("table/handleAsterisc", payload);
      }
      if (this.editedIndex > -1) {
        // Update existing guest
        this.$store.dispatch("guest/updateGuest", guest);
        this.close();
      } else {
        // Create a New Guest
        const tableId = this.tableId;
        this.$store.dispatch("guest/addGuest", { tableId, guest });
        this.editedItem = Object.assign({}, this.defaultItem);
        document.getElementById("cognomefield").focus();
      }
      if (!this.saveAndContinue) {
        this.close();
      }
      //
    }
  },
  mounted() {
    // Set dynamic guest list labels if they exist
    // if (this.$store.state.labels != {}) {
    //   this.headers[2].text = this.$store.state.labels.peoples_label;
    //   this.headers[3].text = this.$store.state.labels.baby_label;
    //   this.headers[4].text = this.$store.state.labels.chairs_only_label;
    //   this.headers[5].text = this.$store.state.labels.high_chair_label;
    // }
  },
  created() {
    EventBus.$on("fetch-done", () => {
      // const translatedLabels = this.$store.state.translatedLabels;
      // const labels = this.labels;
      // for (const translatedLabel of translatedLabels) {
      //   if (
      //     translatedLabel.placeholder === "surname" ||
      //     translatedLabel.placeholder === "name" ||
      //     translatedLabel.placeholder === "adults" ||
      //     translatedLabel.placeholder === "child" ||
      //     translatedLabel.placeholder === "chairs" ||
      //     translatedLabel.placeholder === "high_chairs" ||
      //     translatedLabel.placeholder === "actions"
      //   ) {
      //     for (const header of labels.headers) {
      //       if (translatedLabel.placeholder === header.placeholder) {
      //         header.text = translatedLabel.content;
      //       }
      //     }
      //   }
      //   for (const label in labels) {
      //     if (translatedLabel.placeholder === label) {
      //       labels[label] = translatedLabel.content;
      //     }
      //   }
      // }
    });

    // On table select grab the table's id and other data
    EventBus.$on("table-select", group => {
      let table = group.attrs.table;
      this.tableId = table.id;
      this.tableName = table.textConfig.name;
      if (table.textConfig.maxSeats) {
        this.maxSeats = table.textConfig.maxSeats;
      }
      this.tableNumber = table.textConfig.number;
      this.clientName = table.textConfig.nomeCliente;
    });

    EventBus.$on("guest-list-select", () => {
      if (this.$store.state.selectedGroup != null) {
        this.dialog = true;
        // console.log("vm", this);
      } else {
        const notification = {
          type: "warning",
          message:
            "Devi selezionare un tavolo per aprire la sua lista degli ospiti"
        };
        this.$store.dispatch("notification/add", notification, { root: true });
      }
    });
  }
};
</script>
