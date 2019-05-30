<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-toolbar flat color="#424242" dark>
          <v-toolbar-title>Modifica Tavolo</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn icon @click="dialog = false">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>

        <v-form v-model="valid" @submit.prevent="save">
          <v-container>
            <v-layout>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="editedItem.text"
                  label="Nome"
                  required
                ></v-text-field>
              </v-flex>

              <v-flex xs12 md6>
                <v-text-field
                  v-model.number="editedItem.number"
                  :rules="numberRules"
                  label="Numero"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12>
                <v-text-field
                  v-model="editedItem.nomeCliente"
                  label="Nome Tavolo Cliente"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 class="py-2">
                <p>Tipo</p>
                <v-btn-toggle v-model="editedItem.type" mandatory>
                  <v-btn
                    v-for="tableType in table.tableTypes"
                    flat
                    :value="tableTypeParser(tableType.id)"
                    :key="tableType.id"
                    >{{ tableType.label }}</v-btn
                  >
                </v-btn-toggle>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 md5 class="py-2">
                <p>Dimensione</p>
                <v-btn-toggle v-model.number="editedItem.size" mandatory>
                  <v-btn flat :value="Number(30)">Piccolo</v-btn>
                  <v-btn flat :value="Number(60)">Medio</v-btn>
                  <v-btn flat :value="Number(90)">Grande</v-btn>
                </v-btn-toggle>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 md6 class="py-2">
                <p>
                  Colore Bordo
                </p>
                <compact-picker v-model="editedItem.borderColor" />
              </v-flex>
              <v-flex xs12 sm6 md6 class="py-2">
                <p>Bordo</p>
                <v-radio-group v-model="editedItem.borderType">
                  <v-radio
                    v-for="borderOption in borderOptions"
                    :key="borderOption.id"
                    :label="borderOption.label"
                    :value="borderOption.value"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 class="py-2">
                <p>Colore Sfondo</p>
                <compact-picker v-model="editedItem.backgroundColor" />
              </v-flex>
            </v-layout>
          </v-container>
          <v-divider></v-divider>
          <v-container>
            <v-layout justify-end>
              <v-flex xs12>
                <v-btn :disabled="!valid" type="submit" dark color="green"
                  >Salva</v-btn
                >
                <v-btn @click="remove" flat color="error">Elimina</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { EventBus } from "../event-bus.js";
import { mapState } from "vuex";
import { Compact } from "vue-color";

export default {
  name: "EditTableForm",
  components: {
    "compact-picker": Compact
  },
  data: () => ({
    valid: true,
    numberRules: [
      v => typeof v === "number" || "Per favore inserisci un numero"
    ],
    layer: null,
    dialog: false,
    tableClientName: false,
    borderOptions: [
      {
        id: 1,
        label: "Intero",
        value: "intero"
      },
      {
        id: 2,
        label: "Trattegiato",
        value: "trattegiato"
      },
      {
        id: 3,
        label: "Nessuno",
        value: "nessuno"
      }
    ],
    // Default values
    editedItem: {
      id: "",
      type: "circle",
      size: 30,
      scaleX: "1",
      scaleY: "1",
      angolare: 0,
      text: "",
      number: "",
      nomeCliente: "",
      borderColor: "#000000",
      backgroundColor: "#ffffff",
      borderType: "intero"
    },
    defaultItem: {
      id: "",
      type: "circle",
      size: 30,
      scaleX: "1",
      scaleY: "1",
      angolare: 0,
      text: "",
      number: "",
      nomeCliente: "",
      borderColor: "#000000",
      backgroundColor: "#ffffff",
      borderType: "intero"
    },
    // tableTypes: [],
    angolareRules: [
      v => !!v || "Angolare è richiesto ",
      v => v < 360 || "Angolare deve essere inferiore a 360°"
    ],
    nameRules: [v => !!v || "Nome è richiesto"]
  }),
  computed: {
    groupsLength() {
      return this.$store.getters.groupsLength;
    },
    tableTypes() {
      return this.$store.state.tableTypes;
    },
    customAngolareVal() {
      return this.editedItem.angolare == 0 ||
        this.editedItem.angolare == 45 ||
        this.editedItem.angolare == 90 ||
        this.editedItem.angolare == 180
        ? 91
        : this.editedItem.angolare;
    },
    ...mapState(["table"])
  },
  methods: {
    defaultColor(value) {
      if (!value) {
        this.editedItem.borderColor = "#000000";
      }
    },
    enforceMandatory() {
      this.angolareCustom == true;
    },
    angolareCustomClick() {
      this.angolareCustom = false;
    },
    // Parses from table id into Konva shape
    tableTypeParser(id) {
      let type;
      switch (id) {
        case "2":
          type = "circle";
          break;

        case "3":
          type = "square";
          break;

        case "4":
          type = "rectangle";
          break;

        case "5":
          type = "ellipse";
          break;
      }
      return type;
    },
    tableTypeDeparser(type) {
      let id;
      switch (type) {
        case "circle":
          id = 2;
          break;

        case "square":
          id = 3;
          break;

        case "rectangle":
          id = 4;
          break;

        case "ellipse":
          id = 5;
          break;
      }
      return id;
    },
    fetchSelectedTable(group) {
      let table = group.attrs.table;
      // console.log("table", table);
      let size;

      if (table.type == "circle") {
        size = table.tableConfig.radius;
      }
      if (table.type == "square" || table.type == "rectangle") {
        size = table.tableConfig.height;
      }
      if (table.type == "ellipse") {
        size = table.tableConfig.radiusY;
      }

      let borderType = "intero";

      if (table.tableConfig.dashEnabled) {
        borderType = "trattegiato";
      }
      if (!table.tableConfig.strokeEnabled) {
        borderType = "nessuno";
      }

      let item = {
        id: table.id,
        type: table.type,
        size: Number(size),
        scaleX: parseFloat(table.tableConfig.scaleX),
        scaleY: parseFloat(table.tableConfig.scaleY),
        angolare: Number(table.tableConfig.rotation),
        text: table.textConfig.name,
        number: table.textConfig.number,
        nomeCliente: table.textConfig.nomeCliente,
        borderColor: table.tableConfig.stroke,
        backgroundColor: table.tableConfig.fill,
        borderType
      };
      this.editedItem = Object.assign({}, item);
      this.defaultItem = Object.assign({}, item);
    },
    save() {
      let angolare =
        (this.editedItem.angolare + this.defaultItem.angolare) % 360;

      if (this.editedItem.angolare == this.defaultItem.angolare) {
        angolare = this.editedItem.angolare;
      }

      if (this.editedItem.angolare == 0) {
        angolare = 0;
      }

      let borderColor =
        typeof this.editedItem.borderColor != "object"
          ? this.editedItem.borderColor
          : this.editedItem.borderColor.hex;
      let backgroundColor =
        typeof this.editedItem.backgroundColor != "object"
          ? this.editedItem.backgroundColor
          : this.editedItem.backgroundColor.hex;

      let updatedItem = {
        layoutId: this.$store.state.layout.id,
        id: this.editedItem.id,
        typeId: this.tableTypeDeparser(this.editedItem.type),
        size: this.editedItem.size,
        scaleX: this.editedItem.scaleX,
        scaleY: this.editedItem.scaleY,
        angolare,
        tableName: this.editedItem.text,
        tableNumber: this.editedItem.number,
        nomeCliente: this.editedItem.nomeCliente,
        borderColor: this.editedItem.borderColor.replace("#", ""),
        backgroundColor: backgroundColor.replace("#", ""),
        borderType: this.editedItem.borderType
      };

      console.log("updatedItem", updatedItem);

      if (
        JSON.stringify(this.editedItem) !== JSON.stringify(this.defaultItem)
      ) {
        this.$store.dispatch("table/updateTable", updatedItem);
        this.defaultItem = Object.assign({}, updatedItem);
        this.$store.state.stage.draw();
      }
      this.dialog = false;
    },
    remove() {
      let answer = confirm("You sure you want to remove this table?");
      console.log("Confirm", answer);
      if (confirm) {
        let item = {
          layoutId: this.$store.state.layout.id,
          id: this.editedItem.id
        };
        this.$store.dispatch("table/deleteTable", item);
      }
      this.dialog = false;
    }
  },
  mounted() {
    this.layer = this.$store.state.layer;
  },
  created() {
    EventBus.$on("table-select", group => {
      this.fetchSelectedTable(group);
    });

    EventBus.$on("edit-table-select", () => {
      this.dialog = true;
    });
  }
};
</script>
