<template>
  <v-dialog persistent v-model="dialog" max-width="500px">
    <v-btn
      v-if="info.block_guests == 0"
      slot="activator"
      @click="editedItem.table_id = Number(tableId)"
      color="primary"
      dark
      class="mb-2 hidden-print-only"
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
                  @input="onInput($event, 'cognome')"
                  v-model="editedItem.cognome"
                  :label="labels.surname"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  v-model="editedItem.nome"
                  @input="onInput($event, 'nome')"
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
              <v-flex xs12 sm6 md3>
                <v-text-field
                  v-model.number="editedItem.chairs_only"
                  :rules="numberRules"
                  :label="info.chairs_only_label"
                  type="number"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3>
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

                <v-flex xs12 sm6 md3>
                  <v-text-field
                    v-model.number="editedItem.menu1"
                    :rules="numberRules"
                    :label="placeholderLabels.menu1"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md3>
                  <v-text-field
                    v-model.number="editedItem.menu2"
                    :rules="numberRules"
                    :label="placeholderLabels.menu2"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md3>
                  <v-text-field
                    v-model.number="editedItem.menu3"
                    :rules="numberRules"
                    :label="placeholderLabels.menu3"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md3>
                  <v-text-field
                    type="number"
                    v-model.number="editedItem.menu4"
                    :rules="numberRules2"
                    :label="placeholderLabels.menu4"
                  ></v-text-field>
                </v-flex>
              </template>
              <!-- End New Guest Section -->
              <v-flex xs12>
                <v-text-field
                  v-model="editedItem.note_intolleranze"
                  :placeholder="info.note_placeholder"
                  :label="labels.note"
                ></v-text-field>
              </v-flex>
              <!-- <v-flex xs12>
                          <v-select
                            item-text="text"
                            item-value="value"
                            v-model.number="editedItem.guest_type"
                            :items="guestTypes"
                            :label="labels.guest_type"
                          ></v-select>
                        </v-flex> -->
              <v-flex xs12>
                <v-select
                  item-text="text"
                  item-value="value"
                  v-model.number="editedItem.table_id"
                  :items="tableList"
                  @change="changeTable"
                  label="Associa al tavolo"
                ></v-select>
              </v-flex>
              <v-flex xs12 v-if="eIndex < 0">
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
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  name: "GuestEditDialog",
  props: {
    labels: Object,
    tableId: Number,
    tableList: Array,
    guestEditDialog: Boolean,
    itemSelected: Object,
    eIndex: Number,
    table: Object,
  },
  data: (vue) => ({
    valid: true,
    dialog: false,
    editForm: false,

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
    saveAndContinue: true,
  }),
  computed: {
    layoutId() {
      return this.$store.state.layout.id;
    },
    info() {
      return this.$store.getters.getInfo;
    },
    placeholderLabels() {
      return this.$store.state.labels;
    },
    formTitle() {
      return this.eIndex === -1
        ? this.labels.create_new_guest
        : this.labels.edit_guest;
    },
    maxSeats() {
      if (this.table) {
        return Number(this.table.max_seats);
      }
      return 0;
    },
    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" }),
  },
  watch: {
    guestEditDialog() {
      this.dialog = this.guestEditDialog;
    },
    dialog() {
      if (this.dialog == false) {
        this.$emit("dialog-closed");
        this.editedItem = Object.assign(this.editedItem, this.defaultItem);
      }
    },
    nome(newValue) {
      this.editedItem.nome =
        newValue.charAt(0).toUpperCase() + newValue.slice(1);
    },
    cognome(newValue) {
      this.editedItem.cognome =
        newValue.charAt(0).toUpperCase() + newValue.slice(1);
    },
    itemSelected() {
      this.editedItem = Object.assign({}, this.itemSelected);
    },
  },
  methods: {
    onInput(newValue, field) {
      this.editedItem[field] =
        newValue.charAt(0).toUpperCase() + newValue.slice(1);
      // Prevent the default input event from being triggered,
      // which would cause the input value to be updated before the watch function is called.
      // event.preventDefault();
    },
    changeTable(id) {
      let guest = Object.assign(this.editedItem);
      guest.table_id = id;
      // this.$store.dispatch("guest/updateGuest", guest);
    },
    close() {
      if (this.editForm) {
        this.editForm = false;
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
        }, 300);
      }

      if (this.dialog) {
        this.dialog = false;
      }
    },
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
      let maxReached = false;

      for (const guest of guests) {
        const sumPeople =
          Number(guest.baby) +
          Number(guest.chairs_only) +
          Number(guest.high_chair) +
          Number(guest.peoples);
        totalPeople += sumPeople;
        // console.log(
        //   "sumPeople",
        //   sumPeople,
        //   this.info.max_seats_each_row,
        //   guest
        // );
        if (sumPeople > Number(this.info.max_seats_each_row)) {
          maxReached = true;
        }
        // totalPeople += Number(guest.baby);
        // totalPeople += Number(guest.chairs_only);
        // totalPeople += Number(guest.high_chair);
        // totalPeople += Number(guest.peoples);

        if (this.info.show_tables_menu == 1) {
          const sumMenus =
            Number(guest.menu1) +
            Number(guest.menu2) +
            Number(guest.menu3) +
            Number(guest.menu4);
          totalPasti += sumMenus;
          // console.log(
          //   "sumMenus",
          //   sumMenus,
          //   this.info.max_seats_each_row,
          //   guest
          // );
          if (sumMenus > Number(this.info.max_seats_each_row)) {
            maxReached = true;
          }
          // totalPasti += Number(guest.menu1);
          // totalPasti += Number(guest.menu2);
          // totalPasti += Number(guest.menu3);
          // totalPasti += Number(guest.menu4);
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
      if (this.eIndex > -1) {
        // Update existing guest
        this.$store.dispatch("guest/updateGuest", guest);
        this.$store.dispatch("table/getTables", this.layoutId, {
          root: true,
        });
        this.close();
      } else {
        // Create a New Guest

        const tableId = this.tableId;
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
    // maxSeatsCheck(newGuest) {
    //   if (Number(this.tableId) != Number(newGuest.table_id)) {
    //     return false;
    //   }
    //   console.log("guest", newGuest);
    //   const maxSeats = Number(this.maxSeats);
    //   let guests = JSON.parse(JSON.stringify(this.guests(this.tableId)));
    //   const index = guests.findIndex((guest) => guest.id === newGuest.id);
    //   if (index !== -1) {
    //     guests[index] = Object.assign({}, newGuest);
    //   } else {
    //     guests.push(newGuest);
    //   }
    //   let totalPasti = 0;
    //   let totalPeople = 0;
    //   for (const guest of guests) {
    //     totalPeople += Number(guest.baby);
    //     totalPeople += Number(guest.chairs_only);
    //     totalPeople += Number(guest.high_chair);
    //     totalPeople += Number(guest.peoples);

    //     if (this.placeholderLabels.menu1) {
    //       totalPasti += Number(guest.menu1);
    //       totalPasti += Number(guest.menu2);
    //       totalPasti += Number(guest.menu3);
    //       totalPasti += Number(guest.menu4);
    //     }
    //   }
    //   if (this.placeholderLabels.menu1) {
    //     if (totalPeople > maxSeats || totalPasti > maxSeats) {
    //       console.log("went too far", totalPasti, totalPeople);
    //       return true;
    //     } else {
    //       console.log("ok", totalPasti, totalPeople);
    //       return false;
    //     }
    //   }

    //   if (totalPeople > maxSeats) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
  },
};
</script>
