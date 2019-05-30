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
            @transformend="handleTableTransform"
            :config="group.table.tableConfig"
          ></v-circle>
          <v-rect
            v-if="
              group.table.type === 'square' || group.table.type === 'rectangle'
            "
            :ref="group.table.tableConfig.name"
            @transformend="handleTableTransform"
            :config="group.table.tableConfig"
          ></v-rect>
          <v-ellipse
            v-if="group.table.type === 'ellipse'"
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
          <v-text
            v-if="group.guestSeraleCounters.text.replace(' ', '')"
            :ref="group.seraLabel.name"
            :config="group.seraLabel"
          ></v-text>
          <v-text
            :ref="group.guestSeraleCounters.name"
            :config="group.guestSeraleCounters"
          ></v-text>
          <v-text
            v-if="showTablesTotal"
            :ref="group.guestCountersTotal.name"
            :config="group.guestCountersTotal"
          ></v-text>

          <v-text
            v-if="showClientTableName"
            :ref="group.table.textConfig.nomeCliente + group.table.id"
            :config="group.nomeClienteText"
          ></v-text>
          <v-text
            v-if="group.asteriscTextConfig.state"
            :ref="group.asteriscTextConfig.name"
            :config="group.asteriscTextConfig"
          ></v-text>
        </v-group>
        <!-- <v-text ref="totaleCounter" :config="guestTotals"></v-text> -->
        <v-text ref="totaleCounterV2" :config="guestTotalsV2"></v-text>
        <v-text ref="title" :config="printTitle"></v-text>
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
    
    showTablesTotal() {
      let status =
        this.$store.state.labels.show_tables_total == 0 ? false : true;
      return status;
    },
    showClientTableName() {
      let status = this.$store.state.labels.show_tables_client_name;
      if (status == 0) {
        return false;
      } else {
        return true;
      }
    },
    printTitle() {
      const payload = this.$store.getters.printTitle;
      const eventDate =
        payload.eventDate != "0000-00-00" ? `- ${payload.eventDate}` : "";
      const eventName = payload.eventName;
      let textConfig = {
        name: "printTItle",
        text: `${eventName} ${eventDate}`,
        fontSize: 16,
        draggable: true,
        fontFamily: "Poppins",
        fontStyle: "bold",
        fill: "#000000",
        align: "left",
        verticalAlign: "middle",
        x: 10,
        y: 10
      };
      return textConfig;
    },
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
    ...mapGetters({
      // guestTotals: "guest/guestTotals",
      guestTotalsV2: "guest/guestTotalsV2"
    })
  },
  methods: {
    guestSeraleCounters(counters) {
      let count = 0;
      counters.forEach(element => {
        count += element;
      });
      return count;
    },
    log(e) {
      console.log(e);
      EventBus.$emit("guest-list-select");
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
          }/fl_api/tables-v2/?move_table&token=1&table_id=${
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
      let { scaleX, scaleY } = shape;
      console.log("shape", shape);
      if (shape.scaleX != 1 || shape.scaleY != 1) {
        axios
          .get(
            `https://${
              this.hostname
            }/fl_api/tables-v2/?scale_table&token=1&table_id=${tableId}&layout_id=${layoutId}&scale_x=${scaleX}&scale_y=${scaleY}`
          )
          .then(function(response) {
            console.log("Response", response);
          })
          .catch(function(error) {
            console.log(error);
          });
        console.log("Shape scaled", rotation);
      }
      axios
        .get(
          `https://${
            this.hostname
          }/fl_api/tables-v2/?rotate_table&token=1&table_id=${tableId}&layout_id=${layoutId}&angolare=${rotation}`
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
      // console.log(e);
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

      if (
        !this.$store.state.selectedGroup ||
        this.$store.state.selectedGroup.name != group.attrs.name
      ) {
        console.log("Group selected", group);
        let name = "." + String(groupName) + "-tbl";
        stage.find("Transformer").destroy();
        // create new transformer
        var tr = new window.Konva.Transformer({
          rotateEnabled: true,
          // resizeEnabled: false,
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
