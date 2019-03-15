<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title
            >Elenco degli Ospiti - {{ tableName }}</v-toolbar-title
          >
          <v-spacer></v-spacer>

          <v-btn icon @click="dialog = false">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-toolbar flat color="white">
            <v-spacer></v-spacer>
            <v-dialog v-model="guestDialog" max-width="500px">
              <v-btn slot="activator" color="primary" dark class="mb-2"
                >Crea Nuovo Ospite</v-btn
              >
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm6 md6>
                        <v-text-field
                          v-model="editedItem.nome"
                          label="Nome"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md6>
                        <v-text-field
                          v-model="editedItem.cognome"
                          label="Cognome"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-select
                          item-text="text"
                          item-value="value"
                          v-model.number="editedItem.guest_type"
                          :items="guestTypes"
                          label="Tipo Ospite"
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm6 md3>
                        <v-text-field
                          v-model.number="editedItem.peoples"
                          :rules="numberRules"
                          label="Persone"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md3>
                        <v-text-field
                          v-model.number="editedItem.baby"
                          :rules="numberRules"
                          label="Bambini"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md3>
                        <v-text-field
                          v-model.number="editedItem.chairs_only"
                          :rules="numberRules"
                          label="Sedie"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md3>
                        <v-text-field
                          v-model.number="editedItem.high_chair"
                          :rules="numberRules"
                          label="Seggiolone"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          v-model="editedItem.note_intolleranze"
                          label="Nota"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close"
                    >Chiudi</v-btn
                  >
                  <v-btn color="blue darken-1" flat @click="save">Salva</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
          <v-data-table
            :headers="headers"
            :items="guests(this.tableId)"
            rows-per-page-text="Righe per pagina"
            :rows-per-page-items="[5, 10, 25, { text: 'Tutti', value: -1 }]"
            no-data-text="Non ci sono ospiti in questo tavolo"
          >
            <template slot="items" slot-scope="props">
              <td>{{ props.item.nome }}</td>
              <td>{{ props.item.cognome }}</td>
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
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="dialog = false"
            >Chiudi</v-btn
          >
        </v-card-actions>
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
      tableId: null,
      tableName: "",
      dialog: false,
      guestDialog: false,
      dialogm1: "",
      guestTypes: [
        {
          text: "Organizzatore",
          value: 1
        },
        {
          text: "Festeggiato",
          value: 2
        },
        {
          text: "Ospite",
          value: 3
        },
        {
          text: "Ospite VIP",
          value: 4
        },
        {
          text: "Operatore",
          value: 5
        }
      ],
      headers: [
        { text: "Nome", value: "nome" },
        { text: "Cognome", value: "cognome" },
        { text: "People", value: "peoples" },
        { text: "Babies", value: "baby" },
        { text: "Chairs", value: "chairs_only" },
        { text: "Highchairs", value: "high_chair" },
        { text: "Note", value: "note_intolleranze" },
        { text: "Azioni", value: "nome", sortable: false }
      ],
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
    formTitle() {
      return this.editedIndex === -1 ? "Crea Nuovo Ospite" : "Modifica Ospite";
    },
    // guests() {
    //   return this.$store.getters.guests(this.tableId);
    // },
    ...mapState(["guest"]),
    ...mapGetters({ guests: "guest/guests" })
  },
  methods: {
    editItem(item) {
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
        `Sei sicuro di voler eliminare a ${guest.nome} ${guest.cognome}?`
      ) &&
        // Delete Guest
        this.$store.dispatch("guest/deleteGuest", guest);
    },
    close() {
      this.guestDialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      if (this.editedIndex > -1) {
        // Update existing guest
        let guest = this.editedItem;
        this.$store.dispatch("guest/updateGuest", guest);
      } else {
        // Create a New Guest
        let guest = this.editedItem;
        const tableId = this.tableId;
        this.$store.dispatch("guest/addGuest", { tableId, guest });
      }
      this.close();
    }
  },
  created() {
    EventBus.$on("table-select", group => {
      let table = group.attrs.table;
      this.tableId = table.id;
      this.tableName = table.textConfig.name;
    });

    EventBus.$on("guest-list-select", () => {
      if (this.$store.state.selectedGroup != null) {
        this.dialog = true;
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
