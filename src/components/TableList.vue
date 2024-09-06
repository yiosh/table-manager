<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" scrollable>
      <v-card>
        <v-toolbar flat dark color="#424242">
          <v-toolbar-title>
            Elenco dei tavoli
          </v-toolbar-title>
          <v-btn icon class="ml-4" @click="printElm">
            <v-icon>print</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <v-text-field
            id="numeroalternativo"
            light
            solo
            style="max-width: 300px;"
            ref="numeroalternativofield"
            hide-details
            class="mr-2 hidden-print-only"
            v-model="search"
            label="Ricerca"
            prepend-inner-icon="search"
          ></v-text-field>

          <v-btn icon @click="closeDialog">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text id="print" class="pa-0">
          <v-data-table
            :headers="headers"
            :items="tables"
            :search="search"
            hide-actions
            :expand="true"
            disable-initial-sort
          >
            <!-- :pagination.sync="pagination" -->
            <template slot="headerCell" slot-scope="props">
              <v-tooltip v-if="props.header.value == 'toggle'" bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" @click="toggleAll">{{
                    toggled ? "expand_less" : "expand_more"
                  }}</v-icon>
                </template>
                <span>
                  {{ toggled ? "Chiudi" : "Apri" }}
                </span>
              </v-tooltip>
              <span v-else>{{ props.header.text }}</span>
            </template>
            <template v-slot:items="props">
              <tr class="grey lighten-4">
                <td class="border-bottom-grey">
                  <div>{{ props.item.text }}</div>
                </td>
                <td class="border-bottom-grey">
                  <v-text-field
                    id="nometavolocliente"
                    light
                    ref="cognomefield"
                    @click.stop=""
                    hide-details
                    class="pb-2"
                    v-model="props.item.nome_cliente"
                    @change="updateTableName($event, props.item)"
                    :placeholder="
                      props.item.nome_cliente
                        ? props.item.nome_cliente
                        : 'Nome tavolo cliente'
                    "
                  ></v-text-field>
                </td>
                <td class="border-bottom-grey">
                  <v-text-field
                    id="notetavolo"
                    ref="notefield"
                    hide-details
                    @click.stop=""
                    light
                    class="pb-2"
                    v-model="props.item.note_tavolo"
                    @change="updateTableNote($event, props.item)"
                    :placeholder="
                      props.item.note_tavolo
                        ? props.item.note_tavolo
                        : 'Note tavolo'
                    "
                  >
                    <template v-slot:append>
                      <v-icon dark @click="updateTableNote"
                        >mdi-content-save</v-icon
                      >
                    </template>
                  </v-text-field>
                </td>
                <td
                  v-if="Number(info.numero_alternativo != 0)"
                  class="border-bottom-grey"
                >
                  <v-text-field
                    id="numeroalternativo"
                    light
                    @click.stop=""
                    ref="numeroalternativofield"
                    hide-details
                    class="pb-2"
                    v-model="props.item.numero_alternativo"
                    @change="updateNumberoAlternativo($event, props.item)"
                    :placeholder="
                      props.item.numero_alternativo
                        ? props.item.numero_alternativo
                        : 'Numero alternativo'
                    "
                  ></v-text-field>
                </td>

                <td
                  :ref="`expand-${props.item.id}`"
                  style="cursor: pointer;"
                  class="text-xs-right border-bottom-grey"
                  @click="props.expanded = !props.expanded"
                >
                  <v-icon>{{
                    props.expanded ? "expand_less" : "expand_more"
                  }}</v-icon>
                </td>
              </tr>
            </template>
            <template v-slot:expand="props">
              <GuestListView
                :table="props.item"
                :tableList="tableList"
                :tableId="props.item.value"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import GuestListView from "./GuestListView.vue";

export default {
  name: "TableList",
  components: { GuestListView },
  props: {
    tableListDialog: Boolean,
  },
  data: (vue) => {
    return {
      expanded: [],
      search: "",
      pagination: {
        rowsPerPage: -1,
      },
      tableId: null,
      dialog: false,
      toggled: false,
    };
  },
  watch: {
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
        return this.tables.filter((t) =>
          t.text.toUpperCase().includes(this.search.toUpperCase())
        );
      }
      return this.tables;
    },
    guestListDialog() {
      return this.$refs.dialog.isActive;
    },
    placeholderLabels() {
      return this.$store.state.labels;
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
    tables() {
      const tables = this.$store.getters["table/getTables"];
      let options = [];
      tables.forEach((t) => {
        if (!t.table_name.includes("HIDDEN")) {
          t.text = `${t.table_name} ${t.table_number}`;
          t.value = Number(t.id);

          options.push(t);
        }
      });
      return options;
    },
    layoutId() {
      return this.$store.state.layout.id;
    },
    info() {
      return this.$store.getters.getInfo;
    },
    headers() {
      let headers = [
        {
          text: "Numero tavolo",
          value: "text",
        },
        {
          text: "Nome tavolo",
          value: "nome_cliente",
        },
        {
          text: "Note tavolo",

          value: "note_tavolo",
        },
        {
          text: "",
          align: "end",

          sortable: false,
          value: "toggle",
        },
      ];
      if (this.info.numero_alternativo != 0) {
        headers.splice(3, 0, {
          text: "Numero alternativo",

          value: "numero_alternativo",
        });
      }
      return headers;
    },
  },
  methods: {
    toggleAll() {
      for (let index = 0; index < this.tables.length; index++) {
        const element = this.tables[index];

        this.$refs[`expand-${element.id}`].click();
      }
      this.toggled = !this.toggled;
    },
    printElm() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("print").innerHTML;

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
  .v-datatable__expand-content {
    border-bottom: 2px solid black;
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
    updateNumberoAlternativo(string, table) {
      let updatedItem = {
        id: table.id,
        numeroAlternativo: string,
        layoutId: this.layoutId,
      };

      console.log("updatedItem", updatedItem);

      this.$store.dispatch("table/updateNumeroAlternativo", updatedItem);
      this.$store.state.stage.draw();
    },
    updateTableName(string, table) {
      console.log(string, table);
      let updatedItem = {
        id: table.id,
        nomeCliente: string,
        layoutId: this.layoutId,
      };

      console.log("updatedItem", updatedItem);

      this.$store.dispatch("table/updateClientName", updatedItem);

      this.$store.state.stage.draw();
    },
    onInput(event) {
      // Prevent the default input event from being triggered,
      // which would cause the input value to be updated before the watch function is called.
      event.preventDefault();
    },
    updateTableNote(string, table) {
      let updatedItem = {
        id: table.id,
        noteCliente: string,
        layoutId: this.layoutId,
      };
      console.log("updatedItem", updatedItem);

      this.$store.dispatch("table/updateClientNote", updatedItem);
      this.$store.state.stage.draw();
    },

    closeDialog() {
      this.dialog = false;
    },
  },
};
</script>

<style>
th[aria-label=": Not sorted."] {
  text-align: end;
}
.border-bottom-grey {
  border-bottom: 1px solid rgb(161, 161, 161);
}
@media print {
  .v-btn,
  .v-icon {
    display: none !important;
  }
}
</style>
