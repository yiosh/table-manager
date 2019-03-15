<template>
  <v-app style="background:#d8d8d8">
    <!-- <v-container fluid fill-height v-show="loading == true">
      <v-layout fill-height>
        <v-flex class="text-xs-center" align-self-center>
          <v-progress-circular
            align-self-center
            style="margin: auto"
            :size="70"
            :width="7"
            color="blue"
            indeterminate
          ></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-container>-->
    <!-- <v-toolbar v-show="loading == false" app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Condivision Cloud Beta</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>-->
    <v-content v-show="loading == false">
      <div class="main-container">
        <v-layout row wrap justify-center align-content-center>
          <v-flex xs12 align-self-center style="margin: auto">
            <Canvas></Canvas>
          </v-flex>
        </v-layout>
      </div>
    </v-content>
    <Sidebar v-show="loading == false"></Sidebar>
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
import { EventBus } from "./event-bus.js";
import { mapState } from "vuex";
import BaseNotification from "@/components/baseComponents/BaseNotification";

export default {
  name: "Home",
  components: {
    Sidebar,
    Canvas,
    BaseNotification
  },
  data: () => ({
    title: null
    // loading: true
  }),
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
    ...mapState("notification", ["notifications"])
  },
  methods: {
    handleDrawer() {
      EventBus.$emit("handle-drawer");
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
    }
  },
  mounted() {
    document.title = this.$store.state.layout.layout_name
      ? this.$store.state.layout.layout_name + " - Table Manager V2"
      : "Table Manager V2";
  },
  created() {
    this.$store.dispatch("startProgress");
    const layoutId = this.getQueryVariable("layout_id");
    const orientation = this.$store.state.layout.orientation;
    if (!layoutId) {
      alert('Please add a "layout_id paramenter!"');
    } else {
      if (orientation == 1) {
        this.$store.dispatch("setOrientation", {
          width: 1200,
          height: 792
        });
      }

      this.$store.dispatch("setLayout", layoutId);
      this.$store.dispatch("table/fetchTableTypes", null, { root: true });
      this.$store.dispatch("table/getTables", layoutId, { root: true });
    }
  }
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
</style>
