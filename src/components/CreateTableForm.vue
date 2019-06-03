<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-toolbar flat color="#424242" dark>
          <v-toolbar-title>Aggiungi Tavolo</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn icon @click="dialog = false">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>

        <v-form
          @submit.prevent="
            createTable(
              createTableForm.text,
              createTableForm.number,
              createTableForm.nomeCliente,
              Number(createTableForm.size),
              1,
              1,
              createTableForm.type,
              groupsLength,
              100,
              100,
              Number(createTableForm.angolare),
              [],
              true,
              createTableForm.borderColor,
              createTableForm.backgroundColor,
              createTableForm.borderType
            )
          "
          ref="createForm"
          :rules="rules"
          v-model="valid"
        >
          <v-container>
            <v-layout>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="createTableForm.text"
                  label="Nome Tavolo"
                  required
                ></v-text-field>
              </v-flex>

              <v-flex xs12 md6>
                <v-text-field
                  v-model.number="createTableForm.number"
                  label="Numero Tavolo"
                  :rules="numberRules"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12>
                <v-text-field
                  v-model="createTableForm.nomeCliente"
                  label="Nome Tavolo Cliente"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 class="py-2">
                <p>Tipo</p>
                <v-btn-toggle v-model="createTableForm.type" mandatory>
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
              <v-flex xs12 sm6 md6 class="py-2">
                <p>Dimensione</p>
                <v-btn-toggle v-model="createTableForm.size" mandatory>
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
                <compact-picker v-model="createTableForm.borderColor" />
              </v-flex>
              <v-flex xs12 sm6 md6 class="py-2">
                <p>Bordo</p>
                <v-radio-group v-model="createTableForm.borderType">
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
                <compact-picker v-model="createTableForm.backgroundColor" />
              </v-flex>
            </v-layout>
          </v-container>
          <v-divider></v-divider>
          <v-container>
            <v-layout justify-end>
              <v-flex xs12>
                <v-btn :disabled="!valid" type="submit" dark color="green"
                  >Crea</v-btn
                >
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
import { mapGetters } from "vuex";
import { Compact } from "vue-color";

export default {
  name: "CreateTableForm",
  components: {
    "compact-picker": Compact
  },
  data: () => ({
    numberRules: [
      v => typeof v === "number" || "Per favore inserisci un numero"
    ],
    guestTypeLabel: "",
    dialog: false,
    valid: true,
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
    createTableForm: {
      type: "circle",
      size: 30,
      scaleX: 1,
      scaleY: 1,
      angolare: 0,
      text: "",
      number: 0,
      nomeCliente: "",
      borderColor: "#000000",
      backgroundColor: "#ffffff",
      borderType: "intero"
    },
    nameRules: [v => !!v || "Inserisci nome tavolo per procedere"]
  }),
  computed: {
    rules() {
      const rules = [];

      if (this.createTableForm.number != "Number") {
        const rule = `Si prega di inserire un numero`;

        rules.push(rule);
      }

      return rules;
    },
    customAngolareVal() {
      return this.createTableForm.angolare == 0 ||
        this.createTableForm.angolare == 45 ||
        this.createTableForm.angolare == 90 ||
        this.createTableForm.angolare == 180
        ? 91
        : this.createTableForm.angolare;
    },
    ...mapState(["table", "guest"]),
    ...mapGetters({ groupsLength: "table/groupsLength", guestTypes: "guest/guestTypes" })
  },
  watch: {
    match: "validateField",
    max: "validateField",
    model: "validateField"
  },
  methods: {
    validateField() {
      this.$refs.createForm.validate();
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
          id = "2";
          break;

        case "square":
          id = "3";
          break;

        case "rectangle":
          id = "4";
          break;

        case "ellipse":
          id = "5";
          break;
      }
      return id;
    },
    // Create table using tableTypes array and user input
    createTable(
      name,
      number = "",
      nomeCliente = "",
      size,
      scaleX = 1,
      scaleY = 1,
      type,
      id,
      x = 100,
      y = 100,
      angolare = 0,
      newTable = false,
      tableGuests = [],
      borderColor = "#000000",
      backgroundColor,
      borderType
    ) {
      let strokeEnabled = true;
      if (borderType == "nessuno") {
        strokeEnabled = false;
      }

      let dashEnabled = false;
      if (borderType === "trattegiato") {
        dashEnabled = true;
      }
      // console.log("b", borderColor, "ba", backgroundColor);
      // borderColor =
      //   typeof borderColor != "object" ? borderColor : borderColor.hex;
      // if ((borderColor == "#" || borderColor == "") && noBorder === false) {
      //   borderColor = "#000000";
      // }
      // console.log("borderColor", borderColor);
      backgroundColor =
        typeof backgroundColor != "object"
          ? backgroundColor
          : backgroundColor.hex;
      if (backgroundColor == "#" || backgroundColor == "") {
        backgroundColor = "#ffffff";
      }

      let guests = this.$store.getters["guest/guests"](id);
      let guestCounter = 0;
      let hasNote = false;

      if (guests.length > 0) {
        guests.forEach(guest => {
          if (guest.note_intolleranze != "") {
            hasNote = true;
          }
        });
      }

      let uID =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
      let tableGroup;
      let groupName = "g" + uID;
      let tableName = "g" + uID + "-tbl";
      let textName = name ? name : "g" + uID + "-txt";
      let guestCounterName = "gc" + uID;
      let guestCounterTotalName = "gct" + uID;
      let guestSeraleCounterName = "gsc" + uID;
      let table = {};

      let textConfig = {
        name: textName,
        number,
        text: name + " " + (number == 0 ? "" : number),
        fontSize: 16,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: size / 2,
        offsetX: size / 2,
        nomeCliente
      };

      let nomeClienteText = {
        name: textName,
        number,
        text: nomeCliente,
        fontSize: 14,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: size / 4 - 7,
        offsetX: size / 2,
        nomeCliente
      };

      let ellipseTextConfig = {
        name: textName,
        number,
        text: name + " " + (number == 0 ? "" : number),
        fontSize: 16,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: size / 2,
        offsetX: size / 2,
        nomeCliente
      };

      let rettangoloTextConfig = {
        name: textName,
        number,
        text: name + " " + (number == 0 ? "" : number),
        fontSize: 16,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        padding: 5,
        offsetY: size / 2,
        offsetX: (size * 2) / 2,
        nomeCliente
      };

      let asteriscTextConfig = {
        state: hasNote ? true : false,
        name: textName,
        text: "*",
        fontSize: 18,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: "red",
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: size / 1.5,
        // offsetX: size,
        nomeCliente
      };

      let offsetX = size / 3;
      let offsetY = (size / 5) * -1;

      if (type == "ellipse") {
        offsetY = (size / 10) * -1;
        offsetX = size / 2;
      }

      let guestCounters = {
        name: guestCounterName,
        text: "",
        fontSize: 12,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: nomeCliente ? offsetY - size / 4 : offsetY - size / 4 + 7,
        offsetX,
        counters: {
          people: 0,
          babies: 0,
          chairs: 0,
          highchairs: 0
        }
      };

      let guestSeraleCounters = {
        name: guestSeraleCounterName,
        text: "",
        fontSize: 12,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: nomeCliente ? offsetY - size / 4 - 10 : offsetY - size / 4 - 5,
        offsetX,
        counters: {
          people: 0,
          babies: 0,
          chairs: 0,
          highchairs: 0
        }
      };

      let seraLabel = {
        name: "sl" + uID,
        text: this.guestTypes[3].text,
        fontSize: 12,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: nomeCliente ? offsetY - size / 4 - 10 : offsetY - size / 4 - 5,
        offsetX: offsetX + (this.guestTypes[3].text.length * 7)
      };

      let guestCountersTotal = {
        name: guestCounterTotalName,
        text: "",
        fontSize: 12,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: borderColor,
        align: "center",
        verticalAlign: "middle",
        rotation: angolare,
        offsetY: offsetY - size / 4,
        offsetX,
        total: 0
      };

      if (tableGuests.length > 0) {
        tableGuests.forEach(guest => {
          if (guest.guest_type == 4) {
            if (Number(guest.peoples) > 0) {
              guestSeraleCounters.counters.people += Number(guest.peoples);
              guestCountersTotal.total += Number(guest.peoples);
            }
            if (Number(guest.baby) > 0) {
              guestSeraleCounters.counters.babies += Number(guest.baby);
              guestCountersTotal.total += Number(guest.baby);
            }
            if (Number(guest.chairs_only) > 0) {
              guestSeraleCounters.counters.chairs += Number(guest.chairs_only);
              guestCountersTotal.total += Number(guest.chairs_only);
            }
            if (Number(guest.high_chair) > 0) {
              guestSeraleCounters.counters.highchairs += Number(
                guest.high_chair
              );
              guestCountersTotal.total += Number(guest.high_chair);
            }
          } else {
            if (Number(guest.peoples) > 0) {
              guestCounters.counters.people += Number(guest.peoples);
              guestCountersTotal.total += Number(guest.peoples);
            }
            if (Number(guest.baby) > 0) {
              guestCounters.counters.babies += Number(guest.baby);
              guestCountersTotal.total += Number(guest.baby);
            }
            if (Number(guest.chairs_only) > 0) {
              guestCounters.counters.chairs += Number(guest.chairs_only);
              guestCountersTotal.total += Number(guest.chairs_only);
            }
            if (Number(guest.high_chair) > 0) {
              guestCounters.counters.highchairs += Number(guest.high_chair);
              guestCountersTotal.total += Number(guest.high_chair);
            }
          }
        });
      }

      const showTablesTotal = this.$store.state.labels.show_tables_total;
      const peoplesLetter = this.$store.state.labels.peoples_letter;
      const babyLetter = this.$store.state.labels.baby_letter;
      const chairsLetter = this.$store.state.labels.chairs_only_letter;
      const highChairLetter = this.$store.state.labels.high_chair_letter;

      if (showTablesTotal) {
        if (guestCountersTotal.total > 0) {
          guestCountersTotal.text = `T: ` + guestCountersTotal.total;
        }
      } else {
        guestCountersTotal.text = "";
      }

      if (guestCounters.counters.people > 0) {
        guestCounters.text += peoplesLetter
          ? `${peoplesLetter}:` + guestCounters.counters.people
          : "P" + guestCounters.counters.people;
      }

      if (guestCounters.counters.babies > 0) {
        guestCounters.text += babyLetter
          ? ` ${babyLetter}:` + guestCounters.counters.babies
          : " B" + guestCounters.counters.babies;
      }

      if (guestCounters.counters.chairs > 0) {
        guestCounters.text += chairsLetter
          ? ` ${chairsLetter}:` + guestCounters.counters.chairs
          : " S" + guestCounters.counters.chairs;
      }

      if (guestCounters.counters.highchairs > 0) {
        guestCounters.text += highChairLetter
          ? ` ${highChairLetter}:` + guestCounters.counters.highchairs
          : " H" + guestCounters.counters.highchairs;
      }

      // Serale Counters
      if (guestSeraleCounters.counters.people > 0) {
        guestSeraleCounters.text += peoplesLetter
          ? `${peoplesLetter}:` + guestSeraleCounters.counters.people
          : "P" + guestSeraleCounters.counters.people;
      }

      if (guestSeraleCounters.counters.babies > 0) {
        guestSeraleCounters.text += babyLetter
          ? ` ${babyLetter}:` + guestSeraleCounters.counters.babies
          : " B" + guestSeraleCounters.counters.babies;
      }

      if (guestSeraleCounters.counters.chairs > 0) {
        guestSeraleCounters.text += chairsLetter
          ? ` ${chairsLetter}:` + guestSeraleCounters.counters.chairs
          : " S" + guestSeraleCounters.counters.chairs;
      }

      if (guestSeraleCounters.counters.highchairs > 0) {
        guestSeraleCounters.text += highChairLetter
          ? ` ${highChairLetter}:` + guestSeraleCounters.counters.highchairs
          : " H" + guestSeraleCounters.counters.highchairs;
      }

      switch (type) {
        case "circle":
          table = {
            id: id ? id : null,
            type,
            textConfig,
            tableConfig: {
              name: tableName,
              radius: size,
              scaleX,
              scaleY,
              rotation: angolare,
              fill: backgroundColor,
              stroke: borderColor,
              strokeEnabled: strokeEnabled,
              strokeWidth: 2,
              dash: [10, 5],
              dashEnabled: dashEnabled
            }
          };
          break;
        case "square":
          table = {
            id: id ? id : null,
            type,
            textConfig,
            tableConfig: {
              name: tableName,
              width: size,
              height: size,
              scaleX,
              scaleY,
              offsetX: size / 2,
              offsetY: size / 2,
              rotation: angolare,
              fill: backgroundColor,
              stroke: borderColor,
              strokeEnabled: strokeEnabled,
              strokeWidth: 2,
              dash: [10, 5],
              dashEnabled: dashEnabled
            }
          };
          break;
        case "rectangle":
          table = {
            id: id ? id : null,
            type,
            textConfig: rettangoloTextConfig,
            tableConfig: {
              name: tableName,
              width: size * 2,
              height: size,
              scaleX,
              scaleY,
              offsetX: (size * 2) / 2,
              offsetY: size / 2,
              rotation: angolare,
              fill: backgroundColor,
              stroke: borderColor,
              strokeEnabled: strokeEnabled,
              strokeWidth: 2,
              dash: [10, 5],
              dashEnabled: dashEnabled
            }
          };
          break;
        case "ellipse":
          table = {
            id: id ? id : null,
            type: type,
            textConfig: ellipseTextConfig,
            tableConfig: {
              name: tableName,
              radiusX: size * 2,
              radiusY: size,
              scaleX,
              scaleY,
              rotation: angolare,
              fill: backgroundColor,
              stroke: borderColor,
              strokeEnabled: strokeEnabled,
              strokeWidth: 2,
              dash: [10, 5],
              dashEnabled: dashEnabled
            }
          };
          break;
      }

      let group = {
        name: groupName,
        x,
        y,
        rotation: 0,
        width: 100,
        height: 100,
        draggable: true,
        guestCounters,
        nomeClienteText,
        table
      };

      // Add guest counters total once all calculations are done
      group.guestCountersTotal = guestCountersTotal;
      group.guestSeraleCounters = guestSeraleCounters;
      group.seraLabel = seraLabel;
      group.asteriscTextConfig = asteriscTextConfig;

      const details = {
        layoutId: this.$store.state.layout.id,
        typeId: this.tableTypeDeparser(type),
        tableName: name,
        tableNumber: number,
        tableGroup: tableGroup ? tableGroup : 0,
        size,
        x,
        y,
        angolare,
        nomeCliente,
        borderColor: borderColor,
        borderType,
        backgroundColor
      };

      let payload = {
        isNew: false,
        group,
        details: null
      };

      if (newTable) {
        payload.isNew = true;
        payload.details = details;
      }
      this.$store.dispatch("table/addTable", payload);
      this.dialog = false;
    }
  },
  created() {
    EventBus.$on("fetch-done", () => {
      let tablesFetched = this.table.tablesFetched;
      let tablesFetchedLength = tablesFetched.length;
      let guests = this.guest.guests;
      let tableGuests = [];
      if (tablesFetchedLength > 0) {
        tablesFetched.forEach(payload => {
          tableGuests = guests.filter(guest => {
            return guest.table_id == payload.id;
          });
          this.createTable(
            payload.table_name,
            Number(payload.table_number),
            payload.nome_cliente,
            Number(payload.size),
            Number(payload.scale_x),
            Number(payload.scale_y),
            this.tableTypeParser(payload.type_id),
            payload.id,
            Number(payload.x),
            Number(payload.y),
            Number(payload.angolare),
            false,
            tableGuests,
            `#${payload.border_color}`,
            `#${payload.background_color}`,
            payload.border_type
          );
        });
      }
    });

    EventBus.$on("create-table-select", () => {
      this.dialog = true;
    });
  }
};
</script>
