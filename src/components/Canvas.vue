<template>
  <v-card
    class="cnv-canvas elevation-2"
    :class="{
      horizontal: orientation == 0,
      vertical: orientation == 1
    }"
    style="margin: auto"
  >
    <Toolbar></Toolbar>
    <v-stage
      :style="{ backgroundImage: `url(${stageBackground})` }"
      @click="stageClick"
      ref="stage"
      :config="stageConfig"
    >
      <v-layer ref="layer">
        <v-rect
          v-if="imageSrc"
          ref="background"
          :config="backgroundConfig"
          @click="stageClick"
        ></v-rect>
        <v-group
          :ref="group.name"
          @click="tableSelect(group.name)"
          @dragend="moveTable"
          v-for="group in table.groups"
          :config="group"
          :key="group.name"
        >
          <v-circle
            v-if="group.table.type === 'circle'"
            :ref="group.table.tableConfig.name"
            @click="tableSelect(group.name)"
            @dblclick="dblClick"
            @transformend="handleTableTransform"
            :config="group.table.tableConfig"
          ></v-circle>
          <v-rect
            v-if="
              group.table.type === 'square' || group.table.type === 'rectangle'
            "
            @click="tableSelect(group.name)"
            :ref="group.table.tableConfig.name"
            @transformend="handleTableTransform"
            :config="group.table.tableConfig"
          ></v-rect>
          <v-ellipse
            v-if="group.table.type === 'ellipse'"
            @click="tableSelect(group.name)"
            :ref="group.table.tableConfig.name"
            @transformend="handleTableTransform"
            :config="group.table.tableConfig"
          ></v-ellipse>
          <v-text
            :ref="group.table.textConfig.name"
            :config="group.table.textConfig"
          ></v-text>
          <v-text
            :ref="group.guestCounters.name"
            :config="group.guestCounters"
          ></v-text>
        </v-group>
        <v-text ref="totaleCounter" :config="guestTotals"></v-text>
      </v-layer>
    </v-stage>
    <v-divider></v-divider>
  </v-card>
</template>

<script>
import axios from "axios";
import Toolbar from "./Toolbar";
import { EventBus } from "../event-bus.js";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Canvas",
  components: {
    Toolbar
  },
  data: () => ({
    dialog: false,
    selectedTable: null,
    otherBackground: null
  }),
  computed: {
    imageSrc() {
      let src = this.$store.state.layout.mappa || "";
      return src;
    },
    backgroundConfig() {
      let image = new Image();
      image.src = this.imageSrc;

      let config = {
        x: 0,
        y: 0,
        width: 1200,
        height: 792,
        fillPatternImage: image
      };

      if (this.$store.state.layout.orientation == 1) {
        config.width = 792;
        config.height = 1200;
      }

      return config;
    },
    stageBackground() {
      let url;
      if (this.$store.state.layout.orientation == 0) {
        url = `https://${this.hostname}/fl_app/tableManager/assets/grid.png`;
      }
      if (this.$store.state.layout.orientation == 1) {
        url = `https://${
          this.hostname
        }/fl_app/tableManager/assets/vertical-grid.png`;
      }

      return url;
    },
    hostname() {
      return this.$store.state.hostname;
    },
    orientation() {
      return this.$store.state.layout.orientation;
    },
    stageConfig() {
      return this.$store.state.configKonva;
    },
    ...mapState(["table"]),
    ...mapGetters({ guestTotals: "guest/guestTotals" })
  },
  methods: {
    log(e) {
      console.log(e);
    },
    dblClick() {
      if (this.selectedTable) {
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
    moveTable(e) {
      let group = e.target.attrs;
      let table = group.table;
      let layout_id = this.$store.state.layout.id;

      axios
        .get(
          `https://${
            this.hostname
          }/fl_api/tables-v1/?move_table&token=1&table_id=${
            table.id
          }&layout_id=${layout_id}&x=${group.x}&y=${group.y}`
        )
        .then(function(response) {
          console.log("Response", response);
        })
        .catch(function(error) {
          console.log(error);
        });
      // console.log(table);
    },
    handleTableTransform(event) {
      let shape = event.target.attrs;
      let tableId = this.selectedTable.attrs.table.id;
      let layoutId = this.$store.state.layout.id;
      let rotation = shape.rotation.toFixed(2);
      console.log("tableId", tableId);
      axios
        .get(
          `https://${
            this.hostname
          }/fl_api/tables-v1/?rotate_table&token=1&table_id=${tableId}&layout_id=${layoutId}&angolare=${rotation}`
        )
        .then(function(response) {
          console.log("Response", response);
        })
        .catch(function(error) {
          console.log(error);
        });
      console.log("Shape transformed", rotation);
    },
    stageClick(e) {
      let stage = this.$store.state.stage;
      console.log(e);
      // if click on empty area - remove all transformers
      if (e.target === stage) {
        if (this.$store.state.selectedGroup != null) {
          this.$store.dispatch("selectGroup", null);
          stage.find("Transformer").destroy();
          stage.draw();
          EventBus.$emit("table-unselect");
          return;
        }
      }
    },
    tableSelect(groupName) {
      let stage = this.$store.state.stage;
      let group = stage.find("." + groupName)[0];

      // let shape = _.find(group.children, child => {
      //   return child.nodeType === "Shape";
      // });

      if (this.$store.state.selectedGroup != group.attrs) {
        let name = "." + String(groupName) + "-tbl";
        stage.find("Transformer").destroy();
        // create new transformer
        var tr = new window.Konva.Transformer({
          rotateEnabled: true,
          resizeEnabled: false,
          rotationSnaps: [0, 90, 180, 270]
        });

        let layer = this.$refs.layer.getStage(tr);
        tr.attachTo(stage.find(name)[0]);
        group.add(tr);
        layer.add(group);
        layer.draw();

        this.selectedTable = group;
        this.$store.dispatch("selectGroup", group.attrs);
        EventBus.$emit("table-select", group);
      }
    }
  },
  mounted() {
    this.$store.dispatch("setStage", this.$refs.stage.getStage());
    this.$store.dispatch("setLayer", this.$refs.layer);
    // if (this.$store.state.layout.mappa) {
    //   this.otherBackground = this.$store.state.layout.mappa;
    //   // this.$store.state.stage.draw();
    // }
  }
};
</script>

<style scoped>
.vertical {
  width: 792px;
  /* height: 1200px; */
}

.horizontal {
  width: 1200px;
}

.cnv-canvas {
  border-radius: 0.5em;
}
</style>
