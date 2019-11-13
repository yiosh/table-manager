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
          <v-text
            :ref="group.table.textConfig.name"
            :config="group.table.textConfig"
          ></v-text>
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
        <!-- <v-text ref="totaleCounter" :config="guestTotals"></v-text> -->
        <v-text ref="totaleCounterV2" :config="guestTotalsV2"></v-text>
        <v-text ref="title" :config="printTitle"></v-text>
      </v-layer>
    </v-stage>
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
    otherBackground: null,
    backgroundConfig: {
      x: 0,
      y: 0,
      width: 1200,
      height: 792,
      fillPatternImage: null
    },
    imageSrc: null
  }),
  computed: {
    backgroundImg() {
      return this.$store.getters.getBackgroundImg;
    },
    blockBoard() {
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
    ...mapGetters({
      guestTotalsV2: "guest/guestTotalsV2",
      tableGroups: "table/getGroups"
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
    async moveTable(e) {
      let { table, x, y } = e.target.attrs;
      let tableId = table.id;
      let layoutId = this.$store.state.layout.id;

      try {
        const response = await axios.get(
          `https://${
            this.hostname
          }/fl_api/tables-v2/?move_table&token=1&table_id=${tableId}&layout_id=${layoutId}&x=${x}&y=${y}`
        );
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
        if (this.blockBoard == "0") {
          tr = new window.Konva.Transformer({
            rotateEnabled: true,
            rotationSnaps: [0, 90, 180, 270]
          });
        } else {
          tr = new window.Konva.Transformer({
            rotateEnabled: false,
            resizeEnabled: false,
            rotationSnaps: [0, 90, 180, 270]
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
    }
  },
  watch: {
    backgroundImg() {
      const image = new window.Image();
      image.src = this.backgroundImg;
      image.onload = () => {
        // set image only when it is loaded
        this.imageSrc = image;
        this.backgroundConfig.fillPatternImage = image;
      };
    }
  },
  async mounted() {
    const stage = await this.$refs.stage.getStage();
    this.$store.dispatch("setStage", stage);
    const layer = await this.$refs.layer;
    this.$store.dispatch("setLayer", layer);

    if (this.$store.state.layout.orientation == 1) {
      this.backgroundConfig.width = 792;
      this.backgroundConfig.height = 1200;
    }
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
