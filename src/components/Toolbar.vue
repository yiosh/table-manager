<template>
  <v-layout>
    <v-toolbar flat dark color="#424242" class="cnv-toolbar">
      <v-toolbar-title>Table Planner</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="blockBoard != 1" flat @click="handleClick('create-table')">
        <i class="fas fa-plus icon-margin"></i>
        {{ labels.add_table }}
      </v-btn>
      <v-divider v-if="selectedGroup != null" vertical></v-divider>

      <v-btn
        v-if="selectedGroup != null && blockBoard != 1"
        flat
        ref="edit-table"
        @click="handleClick('edit-table')"
      >
        <i class="far fa-edit icon-margin"></i>
        {{ labels.edit }} {{ labels.table }}
      </v-btn>

      <v-divider v-if="selectedGroup != null" vertical></v-divider>

      <v-btn
        v-if="selectedGroup != null && blockBoard != 1"
        flat
        ref="duplicate-table"
        @click="handleClick('duplicate-table')"
      >
        <i class="far fa-clone icon-margin"></i>
        Duplica {{ labels.table }}
      </v-btn>
    </v-toolbar>
    <CreateTableForm></CreateTableForm>
    <EditTableForm></EditTableForm>
  </v-layout>
</template>

<script>
import CreateTableForm from "./CreateTableForm";
import EditTableForm from "./EditTableForm";
import { EventBus } from "../event-bus.js";

export default {
  name: "Toolbar",
  components: {
    CreateTableForm,
    EditTableForm,
  },
  data: () => ({
    labelsEn: {
      add_table: "Add Table",
      edit: "Edit",
      table: "Table",
    },
    labels: {
      add_table: "Aggiungi tavolo",
      edit: "Modifica",
      table: "Tavolo",
    },
    selectedGroup: null,
  }),
  computed: {
    layoutName() {
      return this.$store.state.layout.layout_name;
    },
    blockBoard() {
      // return 0;

      return this.$store.getters.getInfo.block_board;
    },
  },
  methods: {
    handleClick(payload) {
      switch (payload) {
        case "create-table":
          EventBus.$emit("create-table-select");
          break;
        case "edit-table":
          if (this.selectedGroup) {
            EventBus.$emit("edit-table-select");
          } else {
            const notification = {
              type: "warning",
              message: "Seleziona un tavolo da modificare",
            };
            this.$store.dispatch("notification/add", notification, {
              root: true,
            });
          }
          break;

        case "duplicate-table":
          EventBus.$emit("duplicate-table", this.selectedGroup.attrs.table.id);
          break;
      }
    },
  },
  created() {
    // EventBus.$on("fetch-done", () => {
    //   const translatedLabels = this.$store.state.translatedLabels;
    //   const labels = this.labels;

    //   for (const translatedLabel of translatedLabels) {
    //     for (const label in labels) {
    //       if (translatedLabel.placeholder === label) {
    //         labels[label] = translatedLabel.content;
    //       }
    //     }
    //   }
    // });

    EventBus.$on("table-select", (group) => {
      this.selectedGroup = group;
    });

    EventBus.$on("table-unselect", () => {
      this.selectedGroup = null;
    });

    EventBus.$on("edit-table-dblclick", () => {
      EventBus.$emit("edit-table-select");
    });
  },
};
</script>

<style scoped>
.icon-margin {
  margin-right: 0.4em;
}

.cnv-toolbar {
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
}
</style>
