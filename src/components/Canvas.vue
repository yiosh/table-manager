<template>
  <v-card
    class="cnv-canvas elevation-2"
    :class="{
      horizontal: orientation == 0,
      vertical: orientation == 1,
    }"
    style="margin: auto"
  >
    <Toolbar></Toolbar>
    <v-stage
      :style="{ backgroundImage: `url(${stageBackground})` }"
      @click.self="stageClick"
      ref="stage"
      :config="stageConfig"
    >
      <v-layer ref="layer">
        <v-rect
          v-if="imageSrc"
          ref="background"
          :config="backgroundConfig"
          @click.self="stageClick"
        ></v-rect>
        <!-- @click="stageClick" -->
        <v-group
          :ref="group.name"
          @click="tableSelect(group.name)"
          @dragend="moveTable"
          @dragstart="handleDragStart"
          @mousemove="handleMouseMove"
          @mouseout="handleMouseOut"
          v-for="group in tableGroups"
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
          <!-- TABLE TITLE -->
          <v-text
            :ref="group.table.textConfig.name"
            :config="group.table.textConfig"
          ></v-text>
          <!-- COUNTERS -->
          <v-text
            v-if="showTablesCounters"
            :ref="group.guestCounters.name"
            :config="group.guestCounters"
          ></v-text>
          <v-text
            v-if="
              group.guestSeraleCounters.text.replace(' ', '') &&
                showTablesCounters
            "
            :ref="group.seraLabel.name"
            :config="group.seraLabel"
          ></v-text>
          <v-text
            v-if="showTablesCounters"
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
        <v-group
          v-if="tooltipConfig.text != null"
          ref="tooltip-group"
          :config="tooltipGroupConfig"
        >
          <v-rect
            ref="tooltip-container"
            :config="tooltipContainerConfig"
          ></v-rect>
          <v-text ref="tooltip" :config="tooltipConfig"></v-text>
        </v-group>
        <!-- <v-text ref="totaleCounter" :config="guestTotals"></v-text> -->
        <v-text ref="totaleCounterV2" :config="guestTotalsV2"></v-text>
        <v-text
          v-if="printTitleConfig.text"
          ref="title"
          :config="printTitleConfig"
        ></v-text>
      </v-layer>
    </v-stage>
  </v-card>
</template>

<script>
import axios from "axios";
import Toolbar from "./Toolbar";
import { EventBus } from "../event-bus.js";
import { mapGetters, mapState } from "vuex";

export default {
  name: "Canvas",
  components: {
    Toolbar,
  },
  data: () => ({
    this: this,
    dialog: false,
    selectedTable: null,
    otherBackground: null,
    backgroundConfig: {
      x: 0,
      y: 0,
      width: null,
      height: null,
      fillPatternImage: null,
    },
    tooltipGroupConfig: {
      x: 434,
      y: 121,
      rotation: 0,
      width: 100,
      height: 100,
      draggable: false,
      isRootInsert: false,
    },
    tooltipContainerConfig: {
      x: 434,
      y: 121,
      fill: "#fafafa",
      stroke: "black",
      strokeWidth: 1,
      rotation: 0,
      width: 350,
      height: 150,
      draggable: false,
      isRootInsert: false,
    },
    tooltipConfig: {
      elm: Text,
      fill: "black",
      fontFamily: "Poppins",
      fontSize: 16,
      isRootInsert: false,
      name: "tooltip",
      text: null,
      width: 600,
      x: 14,
      y: 1120,
    },
    imageSrc: null,
    printTitleConfig: {
      name: "printTItle",
      text: null,
      fontSize: 16,
      draggable: true,
      fontFamily: "Poppins",
      fontStyle: "bold",
      fill: "#000000",
      align: "left",
      verticalAlign: "middle",
      x: 10,
      y: 10,
    },
    groupsBackup: null,
    tablesBackup: null,
  }),
  computed: {
    info() {
      return this.$store.getters.getInfo;
    },
    backgroundImg() {
      return this.$store.getters.getBackgroundImg;
    },
    blockBoard() {
      // return 0;
      return this.$store.getters.getInfo.block_board;
    },
    showTablesCounters() {
      let status = this.$store.state.labels.show_tables_counters;
      return status;
    },
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
    stageBackground() {
      let url;
      if (this.orientation == 0) {
        url = `https://${this.hostname}/fl_app/tableManager/assets/grid.png`;
      } else {
        url = `https://${
          this.hostname
        }/fl_app/tableManager/assets/vertical-grid.png`;
      }

      return url;
    },
    selectedGroup() {
      return this.$store.state.selectedGroup;
    },
    ...mapGetters({
      guestTotalsV2: "guest/guestTotalsV2",
      tableGroups: "table/getGroups",
      tablesFetched: "table/getTables",
      stageConfig: "getStageConfig",
      orientation: "getOrientation",
      hostname: "getHostname",
      printTitle: "getPrintTitle",
      loading: "getLoading",
    }),
    ...mapState("table", {
      groups: (state) => state.groups,
    }),
  },
  methods: {
    handleDragStart() {
      this.tooltipConfig.text = null;
      this.groupsBackup = JSON.parse(JSON.stringify(this.tableGroups));
      this.tablesBackup = JSON.parse(JSON.stringify(this.tablesFetched));
    },
    handleMouseOut() {
      this.tooltipConfig.text = null;
    },
    handleMouseMove(ev) {
      if (this.orientation == 1) {
        if (ev.evt.x > 900) {
          this.tooltipGroupConfig.x = ev.evt.layerX - 785;
          if (ev.evt.y > 600) {
            this.tooltipGroupConfig.y = ev.evt.layerY - 180;
          } else {
            this.tooltipGroupConfig.y = ev.evt.layerY - 100;
          }
          // this.tooltipContainerConfig.x = ev.evt.layerX - 400;
          // this.tooltipContainerConfig.y = ev.evt.layerY;
          this.tooltipConfig.x = 450;
          this.tooltipConfig.y = 140;
        } else {
          this.tooltipGroupConfig.x = ev.evt.layerX - 430;
          if (ev.evt.y > 600) {
            this.tooltipGroupConfig.y = ev.evt.layerY - 180;
          } else {
            this.tooltipGroupConfig.y = ev.evt.layerY - 100;
          }
          // this.tooltipContainerConfig.x = ev.evt.layerX - 400;
          // this.tooltipContainerConfig.y = ev.evt.layerY;
          this.tooltipConfig.x = 450;
          this.tooltipConfig.y = 140;
        }
      } else {
        if (ev.evt.x > 700) {
          this.tooltipGroupConfig.x = ev.evt.layerX - 785;
          if (ev.evt.y > 600) {
            this.tooltipGroupConfig.y = ev.evt.layerY - 180;
          } else {
            this.tooltipGroupConfig.y = ev.evt.layerY - 100;
          }
          // this.tooltipContainerConfig.x = ev.evt.layerX - 400;
          // this.tooltipContainerConfig.y = ev.evt.layerY;
          this.tooltipConfig.x = 450;
          this.tooltipConfig.y = 140;
        } else {
          this.tooltipGroupConfig.x = ev.evt.layerX - 430;
          if (ev.evt.y > 600) {
            this.tooltipGroupConfig.y = ev.evt.layerY - 180;
          } else {
            this.tooltipGroupConfig.y = ev.evt.layerY - 100;
          }
          // this.tooltipContainerConfig.x = ev.evt.layerX - 400;
          // this.tooltipContainerConfig.y = ev.evt.layerY;
          this.tooltipConfig.x = 450;
          this.tooltipConfig.y = 140;
        }
      }
      this.tooltipConfig.background = "white";
      if (this.tooltipConfig.text == null) {
        const group = ev.target.parent.attrs;
        const table = group.table;

        const guests = table
          ? this.$store.getters["guest/guests"](table.id)
          : [];

        if (guests.length > 0) {
          // console.log("ev", ev);
          if (guests.length > 1) {
            this.tooltipContainerConfig.height = (guests.length + 2) * 18;

            this.tooltipConfig.text = "";
            guests.forEach((g) => {
              this.tooltipConfig.text += `${
                g.cognome && g.cognome != "null"
                  ? g.cognome.replace("null", "")
                  : ""
              } ${g.nome ? g.nome.replace("null", "") : ""} ${
                this.info.peoples_letter ? this.info.peoples_letter : "A"
              }:${g.peoples} ${
                this.info.baby_letter ? this.info.baby_letter : "B"
              }:${g.baby} ${
                this.info.show_chairs_only != 0
                  ? this.info.chairs_only_letter
                    ? this.info.chairs_only_letter
                    : "S" + ":" + g.chairs_only
                  : ""
              } ${
                this.info.show_high_chair != 0
                  ? this.info.high_chair_letter
                    ? this.info.high_chair_letter
                    : "H" + ":" + g.high_chair
                  : ""
              }\n`;
            });
          } else {
            const g = guests[0];
            this.tooltipContainerConfig.height = (guests.length + 2) * 18;

            this.tooltipConfig.text = `${
              g.cognome && g.cognome != "null"
                ? g.cognome.replace("null", "")
                : ""
            } ${g.nome ? g.nome.replace("null", "") : ""} ${
              this.info.peoples_letter ? this.info.peoples_letter : "A"
            }:${g.peoples} ${
              this.info.baby_letter ? this.info.baby_letter : "B"
            }:${g.baby} ${
              this.info.show_chairs_only != 0
                ? this.info.chairs_only_letter
                  ? this.info.chairs_only_letter
                  : "S" + ":" + g.chairs_only
                : ""
            } ${
              this.info.show_high_chair != 0
                ? this.info.high_chair_letter
                  ? this.info.high_chair_letter
                  : "H" + ":" + g.high_chair
                : ""
            }`;
          }
        }
      }
    },
    handlePrintTitle() {
      console.log("title", this.printTitle);
      let { eventName, eventDate } = this.printTitle;
      eventDate = eventDate != "0000-00-00" ? `- ${eventDate}` : "";

      this.printTitleConfig.text = `${eventName} ${eventDate}`;
    },
    guestSeraleCounters(counters) {
      let count = 0;
      counters.forEach((element) => {
        count += element;
      });
      return count;
    },
    log(e) {
      console.log(e);
      EventBus.$emit("guest-list-select");
    },
    async moveTable(e) {
      // dispatch("getTables", rootState.layout.id);
      const stageWidth = this.stageConfig.width;
      const stageHeight = this.stageConfig.height;
      let layoutId = this.$store.state.layout.id;

      let { table, x, y } = e.target.attrs;
      if (x < 0 || x > stageWidth) {
        const notification = {
          type: "error",
          multiLine: true,
          message: "Impossibile spostare il tavolo fuori dai limiti",
        };
        this.$store.dispatch("notification/add", notification, { root: true });
        this.$store.commit("table/UPDATE_GROUPS", []);
        EventBus.$emit("fetch-done");
        return;
      }

      if (y < 0 || y > stageHeight) {
        const notification = {
          type: "error",
          multiLine: true,
          message: "Impossibile spostare il tavolo fuori dai limiti",
        };
        this.$store.dispatch("notification/add", notification, { root: true });
        this.$store.commit("table/UPDATE_GROUPS", []);

        EventBus.$emit("fetch-done");
        return;
      }
      let tableId = table.id;

      let endpoint =
        location.hostname !== "localhost" ? "tables-v3" : "tables-dev";

      try {
        const response = await axios.get(
          `https://${
            this.hostname
          }/fl_api/${endpoint}/?move_table&token=1&table_id=${tableId}&layout_id=${layoutId}&x=${x}&y=${y}`
        );
        this.$store.dispatch("table/getTables", layoutId);

        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
    async handleTableTransform(event) {
      let { scaleX, scaleY, rotation } = event.target.attrs;
      let tableId = this.selectedTable.attrs.table.id;
      let layoutId = this.$store.state.layout.id;
      rotation = rotation.toFixed(2);

      if (scaleX != 1 || scaleY != 1) {
        try {
          const response = await axios.get(
            `https://${
              this.hostname
            }/fl_api/tables-v2/?scale_table&token=1&table_id=${tableId}&layout_id=${layoutId}&scale_x=${scaleX}&scale_y=${scaleY}`
          );
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      }
      try {
        const response = await axios.get(
          `https://${
            this.hostname
          }/fl_api/tables-v2/?rotate_table&token=1&table_id=${tableId}&layout_id=${layoutId}&angolare=${rotation}`
        );
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
    stageClick(e) {
      const { stage } = this.$store.state;
      console.log("stageClick", e);
      // if click on empty area - remove all transformers
      if (e.target === stage || e.target.index == 0) {
        if (this.selectedGroup != null) {
          this.$store.dispatch("selectGroup", null);
          // this.selectedTable = null;
          stage.find("Transformer").destroy();
          stage.draw();
          EventBus.$emit("table-unselect");
          return;
        }
      }
    },
    tableSelect(groupName) {
      const { stage } = this.$store.state;
      const group = stage.find(`.${groupName}`)[0];

      if (
        !this.$store.state.selectedGroup ||
        this.$store.state.selectedGroup.name !== group.attrs.name
      ) {
        console.log("Group selected", group);
        let name = `.${String(groupName)}-tbl`;
        stage.find("Transformer").destroy();
        // create new transformer
        let tr;
        if (this.blockBoard != 1) {
          tr = new window.Konva.Transformer({
            rotateEnabled: true,
            rotationSnaps: [0, 90, 180, 270],
          });
          // tr.attachTo(stage.find(name)[0]);
        } else {
          tr = new window.Konva.Transformer({
            rotateEnabled: false,
            resizeEnabled: false,
            borderEnabled: false,
            rotationSnaps: [0, 90, 180, 270],
          });
        }

        let layer = this.$refs.layer.getStage(tr);
        tr.attachTo(stage.find(name)[0]);
        group.add(tr);
        layer.add(group);
        layer.draw();

        this.selectedTable = group;
        this.$store.dispatch("selectGroup", group.attrs);
        EventBus.$emit("table-select", group);
      }
    },
  },
  watch: {
    selectedGroup() {
      if (this.selectedGroup == null) {
        this.selectedTable = null;
      }
    },
    orientation() {
      if (this.orientation == 1) {
        this.backgroundConfig.height = 1200;
        this.backgroundConfig.width = 792;
      } else {
        this.backgroundConfig.height = 792;
        this.backgroundConfig.width = 1200;
      }
    },
    backgroundImg() {
      const image = new window.Image();
      image.src = this.backgroundImg;
      image.onload = () => {
        // set image only when it is loaded
        this.imageSrc = image;
        this.backgroundConfig.fillPatternImage = image;
      };
    },
    loading() {
      if (this.loading === false) {
        this.handlePrintTitle();
      }
    },
  },
  mounted() {
    const stage = this.$refs.stage.getStage();
    this.$store.dispatch("setStage", stage);
    const layer = this.$refs.layer;
    this.$store.dispatch("setLayer", layer);
    if (this.orientation === "1") {
      console.log("1");
      this.backgroundConfig.height = 1200;
      this.backgroundConfig.width = 792;
    }
    if (this.orientation === "0") {
      console.log("0");

      this.backgroundConfig.height = 792;
      this.backgroundConfig.width = 1200;
    }
  },
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
