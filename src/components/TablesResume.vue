<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title>
            Report
          </v-toolbar-title>
          <v-btn icon class="ml-4" @click="printDialogContent">
            <v-icon>print</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text id="table-print">
          <h3>{{ layout.layout_name }}</h3>
          <v-data-table
            :headers="headers"
            :items="items"
            disable-initial-sort
            hide-actions
            :pagination.sync="pagination"
            :no-data-text="labels.there_are_no_guests_at_this_table"
          >
            <template slot="items" slot-scope="props">
              <tr>
                <td class="border-all">
                  {{ props.item.table_name }} {{ props.item.table_number }}
                </td>
                <td class="border-all">
                  {{ props.item.nome_cliente }}
                  <br />
                  <small class="red--text text--lighten-1">{{
                    props.item.note_tavolo
                  }}</small>
                </td>
                <td class="border-all">
                  <strong>{{
                    info.show_tables_menu == 1
                      ? Number(props.item.tot_seats) +
                        Number(props.item.tot_menu_speciali)
                      : props.item.tot_seats
                  }}</strong>
                </td>
                <td class="border-all">
                  <strong>{{ props.item.tot_peoples }}</strong>
                </td>
                <td class="border-all">
                  <strong>{{ props.item.tot_baby }}</strong>
                </td>
                <td v-if="info.show_chairs_only != 0" class="border-all">
                  <strong>{{ props.item.tot_chairs_only }}</strong>
                </td>
                <td v-if="info.show_high_chair != 0" class="border-all">
                  <strong>{{ props.item.tot_high_chair }}</strong>
                </td>
                <template v-if="info.show_tables_menu == 1">
                  <td class="border-all">
                    <strong>{{ props.item.tot_menu_speciali }}</strong>
                  </td>
                </template>

                <td class="border-all">{{ props.item.note_intolleranze }}</td>
              </tr>
            </template>
            <template v-slot:footer>
              <td class="border-all">
                {{ tablesTotal.table_name }}
              </td>
              <td class="border-all"></td>
              <td class="border-all">
                <strong>{{
                  info.show_tables_menu == 1
                    ? tablesTotal.tot_seats
                    : tablesTotal.tot_seats
                }}</strong>
              </td>
              <td class="border-all">
                <strong>{{ tablesTotal.tot_peoples }}</strong>
              </td>
              <td class="border-all">
                <strong>{{ tablesTotal.tot_baby }}</strong>
              </td>
              <td v-if="info.show_chairs_only != 0" class="border-all">
                <strong>{{ tablesTotal.tot_chairs_only }}</strong>
              </td>
              <td v-if="info.show_high_chair != 0" class="border-all">
                <strong>{{ tablesTotal.tot_high_chair }}</strong>
              </td>
              <template v-if="info.show_tables_menu == 1">
                <td class="border-all">
                  <strong>{{ tablesTotal.tot_menu_speciali }}</strong>
                </td>
              </template>

              <td class="border-all"></td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { EventBus } from "../event-bus.js";
import TMService from "@/services/TMService";

export default {
  name: "GuestResume",
  data: () => {
    return {
      pagination: {
        sortBy: "id",
        descending: true,
        rowsPerPage: -1,
      },
      dialog: false,
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
      items: [],
      tablesTotal: {
        table_name: "TOTALE",
        tot_seats: 0,
        tot_peoples: 0,
        tot_baby: 0,
        tot_chairs_only: 0,
        tot_high_chair: 0,
        tot_menu_speciali: 0,
      },
    };
  },

  computed: {
    layoutId() {
      return this.$store.state.layout.id;
    },
    layout() {
      return this.$store.state.layout;
    },
    info() {
      return this.$store.getters.getInfo;
    },
    headers() {
      let indexAdded = 5;
      let arr = [
        {
          placeholder: "table_name",
          text: "Numero tavolo",
          value: "table_number",
        },
        {
          placeholder: "nome_cliente",
          text: "Nome tavolo",
          value: "nome_cliente",
        },
        {
          placeholder: "tot_seats",
          width: "10%",

          text: "Tot. Posti",
          value: "tot_seats",
        },
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
        let toAdd = [
          {
            placeholder: "tot_menu_speciali",
            text: "Tot. Pasti speciali",
            width: "10%",

            value: "tot_menu_speciali",
          },
        ];
        arr = arr.slice(0, indexAdded).concat(toAdd, arr.slice(indexAdded));
      }
      return arr;
    },
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
  td {
    border: 1px solid black;
  }
  table {
    border-collapse: collapse;
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
        if (this.info.show_tables_menu == 1) {
          totSeats += totMenuSpeciali;
        }

        this.tablesTotal = {
          table_name: "TOTALE",
          tot_seats: totSeats,
          tot_peoples: totPeoples,
          tot_baby: totBaby,
          tot_chairs_only: totChairsOnly,
          tot_high_chair: totHighChair,
          tot_menu_speciali: totMenuSpeciali,
        };
        this.items = tables;
      } catch (error) {
        console.log("resumeerror", error);
      }
    },

    closeDialog() {
      this.dialog = false;
    },
  },
  created() {
    this.getResume();

    EventBus.$on("data-updated", () => {
      this.getResume();
    });

    let v = this;

    EventBus.$on("table-resume-select", () => {
      v.dialog = true;
    });
  },
};
</script>
