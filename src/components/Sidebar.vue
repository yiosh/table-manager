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
              <img src="../assets/condivision.jpeg" />
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>Condivision Cloud Beta</v-list-tile-title>
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
          @click.stop="handleDialog(item.icon)"
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
    <PrintCanvas></PrintCanvas>
    <!-- <TableSelector></TableSelector> -->
  </v-layout>
</template>

<script>
// import TableSelector from "./TableSelector";
import GuestList from "./GuestList";
import PrintCanvas from "./PrintCanvas";
import { EventBus } from "../event-bus.js";

export default {
  name: "Sidebar",
  components: {
    // TableSelector,
    GuestList,
    PrintCanvas
  },
  data: () => ({
    drawer: true,
    templateLayout: false,
    items: [],
    mini: true,
    right: null,
    labels: {
      you_must_select_a_table_to_open_its_guest_list:
        "You must select a table to open its guest list"
    }
  }),
  methods: {
    handleDialog(element) {
      switch (element) {
        case "people":
          if (this.$store.state.selectedGroup != null) {
            EventBus.$emit("guest-list-select");
            this.$store.commit("GUEST_LIST_DIALOG", true);
          } else {
            const notification = {
              type: "warning",
              message: this.labels
                .you_must_select_a_table_to_open_its_guest_list
            };
            this.$store.dispatch("notification/add", notification, {
              root: true
            });
          }
          break;
        case "print":
          EventBus.$emit("preview-select");
          break;
      }
    }
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

      this.items = [{ title: "Preview", icon: "print", ref: "print" }];
      if (this.$store.state.layout.evento_id !== "0") {
        this.items.unshift({
          title: "Guest List",
          icon: "people",
          ref: "guestlist"
        });
      }
    });
  }
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
