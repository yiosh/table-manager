<template>
  <v-app style="background:#d8d8d8; padding: 2em;">
    <v-content v-show="loading === false && error === false">
      <div class="main-container">
        <v-layout row wrap justify-center align-content-center>
          <v-flex xs12 align-self-center style="margin: auto">
            <Canvas></Canvas>
          </v-flex>
        </v-layout>
      </div>
    </v-content>

    <Sidebar v-show="loading == false && error === false"></Sidebar>
    <BaseNotification
      v-for="notification in notifications"
      :notification="notification"
      :key="notification.id"
    ></BaseNotification>
  </v-app>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import { mapState } from "vuex";
import BaseNotification from "@/components/baseComponents/BaseNotification";
import { EventBus } from "./event-bus.js";

export default {
  name: "Home",
  components: {
    Sidebar,
    Canvas,
    BaseNotification,
  },
  data: () => ({
    title: null,
    orientation: 0,
  }),
  watch: {
    layoutName() {
      document.title = `${this.layoutName} - Table Planner v5`;
    },
  },
  computed: {
    layout() {
      return this.$store.state.layout;
    },
    layoutName() {
      return this.$store.state.layout.layout_name;
    },
    loading() {
      return this.$store.state.loading;
    },
    error() {
      return this.$store.state.error;
    },
    ...mapState("notification", ["notifications"]),
  },
  methods: {
    // handleDrawer() {
    //   EventBus.$emit("handle-drawer");
    // },
    log(e) {
      console.log("e", e);
    },
    getQueryVariable(variable) {
      let query = window.location.search.substring(1);
      let vars = query.split("&");
      for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    },
  },
  mounted() {
    document.title = this.$store.state.layout.layout_name
      ? this.$store.state.layout.layout_name + " - Table Planner v5"
      : "Table Planner v5";
    const layoutId = this.getQueryVariable("layout_id");
    if (!layoutId) {
      alert('Please add a "layout_id paramenter!"');
    } else {
      this.$store.dispatch("setLayout", layoutId);
      this.$store.dispatch("setLanguageLabels", "en");
      if (!this.$store.state.error) {
        this.$store.dispatch("table/fetchTableTypes", null, { root: true });
        this.$store.dispatch("guest/getGuestTypes");
        this.$store.dispatch("table/getTables", layoutId, { root: true });
      }
    }
    document.addEventListener("dblclick", (event) => {
      console.log("trigger");
      if (
        event.target.tagName == "CANVAS" &&
        this.$store.state.selectedGroup !== null
      ) {
        console.log("trigger2");

        EventBus.$emit("guest-list-select");
      }
    });
  },
  created() {
    this.$store.dispatch("startProgress");
  },
};
</script>

<style scoped>
* {
  font-family: "Poppins", sans-serif;
}

.main-container {
  display: grid;
  margin: auto;
  height: 100%;
}
.progress-circle {
  flex: none;
}

@media print {
  /* .v-application a {
    color: black !important;
  }

  body * {
    visibility: hidden;
  }

  .v-card__text,
  .v-card__title,
  .v-data-table {
    margin: 0 !important;
    padding: 0 !important;
  }
  */

  #print,
  #print * {
    visibility: visible;
    border-bottom: none;
  }
  /*

  #title {
    visibility: hidden;
  }

  .v-main {
    padding: 0 !important;
  }
  */

  #print {
    margin: 0;
    padding: 0;
    height: 100%;
    left: 0;
    top: 0;
  }

  /* * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  } */

  /* body * {
    visibility: hidden;
  } */

  /* #print,
  #print *,
  .d-print-block {
    visibility: visible;
  }
  #print {
    position: absolute;
    left: 0;
    top: 0;
  }
  #hideprint,
  .d-print-none {
    visibility: hidden !important;
  } */
}
</style>
