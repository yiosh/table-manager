<template>
  <v-layout>
    <v-toolbar flat dark color="#424242" class="cnv-toolbar">
      <v-toolbar-title>{{ layoutName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat @click="handleClick('create-table')">
        <i class="fas fa-plus icon-margin"></i>
        Aggiungi Tavolo
      </v-btn>
      <v-divider v-if="selectedGroup != null" vertical></v-divider>

      <v-btn
        v-if="selectedGroup != null"
        flat
        ref="edit-table"
        @click="handleClick('edit-table')"
      >
        <i class="far fa-edit icon-margin"></i>
        Modifica Tavolo
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
    EditTableForm
  },
  data: () => ({
    selectedGroup: null
  }),
  computed: {
    layoutName() {
      return this.$store.state.layout.layout_name;
    }
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
              message: "Seleziona una tabella da modificare"
            };
            this.$store.dispatch("notification/add", notification, {
              root: true
            });
          }
          break;
      }
    }
  },
  created() {
    EventBus.$on("table-select", group => {
      this.selectedGroup = group;
    });

    EventBus.$on("table-unselect", () => {
      this.selectedGroup = null;
    });

    EventBus.$on("edit-table-dblclick", () => {
      EventBus.$emit("edit-table-select");
    });
  }
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
