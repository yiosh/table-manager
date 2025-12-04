<template>
  <div>
    <v-dialog v-model="dialog" max-width="700px">
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          @click="getOtherTables"
          color="primary"
          dark
          class="mb-2"
          >Importa Ospiti</v-btn
        >
      </template>
      <v-card>
        <v-card-title>
          <v-toolbar-title>
            Importare Ospiti
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false"><v-icon>clear</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-card>
            <v-list two-line>
              <template v-for="(item, index) in items">
                <v-list-tile
                  v-if="!item.table_name.includes('HIDDEN TABLE')"
                  :key="`${item.id}-list-item`"
                  ripple
                >
                  <v-list-tile-content>
                    <v-list-tile-title
                      >{{ item.layout_name }} / {{ item.table_name }}
                      {{ item.table_number }} / Tot. {{ item.tot_ospiti }}
                      <v-icon color="grey">
                        person
                      </v-icon></v-list-tile-title
                    >
                    <v-list-tile-subtitle
                      v-if="numberOfGuests + item.tot_ospiti > maxSeats"
                      ><small class="caption red--text"
                        >Gli ospiti in questo tavolo superano il numero massimo
                        di posti a sedere nel tavolo a importare.</small
                      ></v-list-tile-subtitle
                    >
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-progress-circular
                      v-if="item.loading"
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                    <v-tooltip v-else bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          v-on="on"
                          @click="handleImport(item)"
                          :disabled="
                            numberOfGuests + item.tot_ospiti > maxSeats
                          "
                        >
                          <v-icon color="success">
                            download
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>Importa</span>
                    </v-tooltip>
                  </v-list-tile-action>
                </v-list-tile>
                <v-divider
                  v-if="
                    index + 1 < items.length &&
                      !item.table_name.includes('HIDDEN TABLE')
                  "
                  :key="index"
                ></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TMService from "@/services/TMService";

export default {
  name: "MigrationDialog",
  props: ["layout", "tableId", "tableNumber", "maxSeats", "numberOfGuests"],
  data: () => ({
    dialog: false,
    guestHeaders: [
      { text: "Ospite", value: "nome" },

      { text: "Tot", value: "table_name" },
    ],

    guestPagination: {
      sortBy: "id",
      descending: true,
      rowsPerPage: -1,
    },
    loading: true,
    items: [],
    tableIdFetched: null,
    selected: [],
  }),
  computed: {
    info() {
      return this.$store.getters.getInfo;
    },
    selectedSeatsCount() {
      let total = 0;
      if (this.selected.length) {
        this.selected.map((i) => {
          total += Number(i.tot);
        });
      }
      return total;
    },
  },
  methods: {
    async handleImport(item) {
      item.loading = true;
      let params = `&token=1&table_id=${item.id}&layout_id=${
        this.layout.id
      }&new_table_id=${this.tableId}`;

      try {
        const response = await TMService.copyGuests(params);
        if (response.data.esito == "OK") {
          this.$store.dispatch("guest/getGuests", this.layout.id, {
            root: true,
          });
          const notification = {
            type: "success",
            multiLine: true,
            message: response.data.info_txt,
          };
          this.$store.dispatch("notification/add", notification, {
            root: true,
          });
          this.$emit("imported", item);
        }
      } catch (error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il import dei ospiti: " +
            error.message,
        };
        this.$store.dispatch("notification/add", notification, { root: true });
      } finally {
        item.loading = false;
      }
    },

    async getOtherTables() {
      if (this.tableId == this.tableIdFetched) {
        return;
      }
      this.tableIdFetched = this.tableId;

      this.loading = true;
      const tableId = this.tableId;
      const layoutId = this.layout.id;
      const eventoId = this.layout.evento_id_parsed;
      const tableNumber = this.tableNumber;
      try {
        const response = await TMService.getOtherTables({
          tableId,
          layoutId,
          eventoId,
          tableNumber,
        });
        if (response.data.esito == "OK") {
          let items = response.data.dati;
          items.forEach((element) => {
            element.loading = false;
          });
          this.items = items;
        }
      } catch (error) {
        const notification = {
          type: "error",
          multiLine: true,
          message:
            "Si è verificato un problema durante il recupero dei altri tavoli: " +
            error.message,
        };
        this.$store.dispatch("notification/add", notification, { root: true });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
