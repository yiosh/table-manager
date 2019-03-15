<template>
  <v-flex>
    <v-card>
      <v-toolbar dark>
        <v-toolbar-title>Tables</v-toolbar-title>
      </v-toolbar>

      <v-list>
        <v-list-tile
          :id="group.name"
          v-for="group in this.$store.state.groups"
          :key="group.name"
          :class
          @click="tableSelect($event, group.name)"
        >
          <v-list-tile-action>
            <v-icon class="fas fa-table"></v-icon>
          </v-list-tile-action>

          <v-list-tile-title>{{
            group.table.textConfig.text
          }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  name: "TableSelector",
  methods: {
    // Select table on click and adds a transformer
    tableSelect(e, group) {
      let stage = this.$store.state.stage;
      let name = "." + String(group) + "-tbl";
      stage.find("Transformer").destroy();
      // create new transformer
      var tr = new window.Konva.Transformer();
      let layer = this.$store.state.layer.getStage(tr);
      let groupEl = stage.find("." + group)[0];
      tr.attachTo(stage.find(name)[0]);
      groupEl.add(tr);
      layer.add(groupEl);
      layer.draw();
    }
  }
};
</script>

<style scoped>
.active {
  background-color: aqua;
}
</style>
