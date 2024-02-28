<template>
  <v-layout column wrap>
    <v-navigation-drawer
      right
      app
      dark
      :mini-variant="mini"
      class="cnv-sidebar elevation-2"
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar @click.stop="mini = !mini">
            <v-list-tile-avatar>
              <img :src="logo" />
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>Condivision Cloud</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn icon @click.stop="mini = !mini">
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-list class="pt-0" dense>
        <v-list-tile
          v-for="item in items"
          :key="item.title"
          @click.stop="handleDialog(item)"
        >
          <v-list-tile-action>
            <v-tooltip left slot="activator">
              <v-icon slot="activator">{{ item.icon }}</v-icon>
              <span>{{ item.title }}</span>
            </v-tooltip>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <GuestList v-if="this.$store.state.layout.evento_id != 0"></GuestList>
    <TablesResume v-if="this.$store.state.layout.evento_id != 0"></TablesResume>

    <TableList
      :tableListDialog="tableListDialog"
      @dialog-closed="tableListDialog = false"
    ></TableList>

    <PrintCanvas></PrintCanvas>
    <!-- <TableSelector></TableSelector> -->
  </v-layout>
</template>

<script>
// import TableSelector from "./TableSelector";
import GuestList from "./GuestList";
import TablesResume from "./TablesResume";

import TableList from "./TableList";

import PrintCanvas from "./PrintCanvas";
import { EventBus } from "../event-bus.js";
import { host } from "@/localHost";

export default {
  name: "Sidebar",
  components: {
    // TableSelector,
    GuestList,
    TablesResume,
    PrintCanvas,
    TableList,
  },
  data: () => ({
    drawer: true,
    templateLayout: false,
    items: [],
    mini: true,
    right: null,
    labelsEn: {
      you_must_select_a_table_to_open_its_guest_list:
        "You must select a table to open its guest list",
    },
    labels: {
      you_must_select_a_table_to_open_its_guest_list:
        "È necessario selezionare un tavolo per aprire il suo elenco di ospiti",
    },
    tableListDialog: false,
  }),
  computed: {
    logo() {
      let myHost = location.hostname;
      if (myHost === "localhost") {
        myHost = host;
      }
      return "https://" + myHost + "/set/img/condivision_emblem.png";
    },
  },
  methods: {
    handleDialog(element) {
      switch (element.icon) {
        // case "people":
        //   if (this.$store.state.selectedGroup != null) {
        //     EventBus.$emit("guest-list-select");
        //     this.$store.commit("GUEST_LIST_DIALOG", true);
        //   } else {
        //     const notification = {
        //       type: "warning",
        //       multiLine: true,
        //       message:
        //         "È necessario selezionare un tavolo per aprire il suo elenco di ospiti",
        //     };
        //     this.$store.dispatch("notification/add", notification, {
        //       root: true,
        //     });
        //   }
        //   break;
        case "format_list_numbered":
          window.open(element.href, "_blank");
          break;
        case "checklist":
          window.open(element.href, "_blank");
          break;
        case "people":
          EventBus.$emit("table-resume-select");
          console.log("worked");
          break;
        case "list":
          this.tableListDialog = true;
          break;
        case "print":
          EventBus.$emit("preview-select");
          break;
        case "fact_check":
          window.open(element.href, "_blank");
          break;
      }
    },
  },
  created() {
    EventBus.$on("fetch-done", () => {
      const translatedLabels = this.$store.state.translatedLabels;
      const labels = this.labels;

      for (const translatedLabel of translatedLabels) {
        for (const label in labels) {
          if (translatedLabel.placeholder === label) {
            labels[label] = translatedLabel.content;
          }
        }
      }

      this.items = [{ title: "Stampa Schema", icon: "print", ref: "print" }];
      if (this.$store.state.info.print_guest_needs) {
        this.items.unshift({
          title: "Lista Esigenze Speciali",
          icon: "format_list_numbered",
          ref: "printguestneeds",
          href: this.$store.state.info.print_tableau,
        });
      }
      if (this.$store.state.info.print_guest_list) {
        this.items.unshift({
          title: "Lista Ingresso",
          icon: "checklist",
          ref: "printguestlist",
          href: this.$store.state.info.print_tableau,
        });
      }
      if (this.$store.state.layout.evento_id !== "0") {
        this.items.unshift({
          title: "Elenco Tavoli",
          icon: "list",
          ref: "tablelist",
        });
        this.items.unshift({
          title: "Report Ospiti",
          icon: "people",
          ref: "guestlist",
        });
      }
      if (this.$store.state.info.print_tableau) {
        this.items.push({
          title: "Stampa Cavalieri",
          icon: "fact_check",
          ref: "printtableau",
          href: this.$store.state.info.print_tableau,
        });
      }
    });
  },
};
</script>

<style scoped>
.cnv-sidebar {
  margin-top: 1em !important;
  margin-bottom: 1em;
  margin-right: 1em;
  border-radius: 0.5em;
  height: auto !important;
  /* width: auto !important; */
}
</style>
