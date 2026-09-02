<template>
  <v-layout row justify-center>
    <v-dialog
      :max-width="this.$store.state.layout.orientation == 0 ? 1220 : 810"
      v-model="dialog"
    >
      <v-card>
        <v-divider></v-divider>
        <v-card-text style="padding: 0">
          <iframe :src="src" frameborder="0"></iframe>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="dialog = false">
            {{ labels.close }}
          </v-btn>
          <v-btn dark color="blue darken-1" @click="PrintImage(src)">
            <i class="fas fa-print icon-margin"></i>{{ labels.print }}
          </v-btn>
          <v-btn color="success" @click="downloadCanvasPNG">
            <i class="fas fa-file-download icon-margin"></i
            >{{ labels.download_png }}
          </v-btn>
          <v-btn color="success" @click="downloadCanvasJPG">
            <i class="fas fa-file-download icon-margin"></i
            >{{ labels.download_jpg }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { EventBus } from "../event-bus.js";

export default {
  name: "PrintCanvas",
  data() {
    return {
      src: null,
      dialog: false,
      labelsEn: {
        close: "Close",
        print: "Print",
        download_png: "Download PNG",
        download_jpg: "Download JPG",
      },
      labels: {
        close: "Chiudi",
        print: "Stampa",
        download_png: "Scarica PNG",
        download_jpg: "Scarica JPG",
      },
    };
  },
  computed: {
    backgroundImageUrl() {
      let url;
      const hostname = this.$store.state.hostname;
      if (this.$store.state.layout.orientation == 0) {
        url = `https://${hostname}/fl_app/tableManager/assets/grid.png`;
      }
      if (this.$store.state.layout.orientation == 1) {
        url = `https://${hostname}/fl_app/tableManager/assets/vertical-grid.png`;
      }
      if (this.$store.state.layout.mappa) {
        url = this.$store.state.layout.mappa;
      }
      return url;
    },
  },
  methods: {
    exportBlocked() {
      // A cross origin map drawn on the stage taints the canvas: Konva then
      // returns an empty string instead of throwing, so every export would
      // silently produce a blank preview / file.
      this.$store.dispatch("notification/add", {
        type: "error",
        multiLine: true,
        message:
          "Non è possibile esportare la piantina: l'immagine della mappa " +
          "viene servita da un dominio diverso e senza header CORS.",
      });
    },
    previewCanvas() {
      const dataURL = this.$store.state.stage.toDataURL({ pixelRatio: 1 });

      // konva swallows the SecurityError of a tainted canvas and returns ""
      if (!dataURL || dataURL === "data:,") {
        this.src = null;
        this.exportBlocked();
        return false;
      }

      this.src = dataURL;
      return true;
    },
    jpegFromCanvas() {
      const source = this.$store.state.stage.toCanvas({ pixelRatio: 1 });
      const canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;

      const context = canvas.getContext("2d");
      // jpeg has no transparency, without this the empty areas turn black
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0);

      try {
        return canvas.toDataURL("image/jpeg", 0.92);
      } catch (e) {
        return null;
      }
    },
    downloadURI(uri, name) {
      if (!uri) {
        return this.exportBlocked();
      }
      let link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    downloadCanvasPNG() {
      this.downloadURI(this.src, "stage.png");
      this.dialog = false;
    },
    downloadCanvasJPG() {
      this.downloadURI(this.jpegFromCanvas(), "stage.jpg");
      this.dialog = false;
    },
    ImagetoPrint(source) {
      if (this.$store.state.layout.mappa != "") {
        return (
          "<html><head><script>function step1(){\n" +
          "setTimeout('step2()', 10);}\n" +
          "function step2(){window.print();window.close()}\n" +
          "</scri" +
          `pt></head><body style="background-image: url(${
            this.backgroundImageUrl
          }); ${
            this.$store.state.layout.orientation == 1
              ? "height: 1100px; width: 800px;"
              : ""
          }" onload='step1()'>\n` +
          `<img src="${source}" ${
            this.$store.state.layout.orientation == 1
              ? 'style="height:1100px"'
              : ""
          } /></body></html>`
        );
      } else {
        return (
          "<html><head><script>function step1(){\n" +
          "setTimeout('step2()', 10);}\n" +
          "function step2(){window.print();window.close()}\n" +
          "</scri" +
          `pt></head><body ${
            this.$store.state.layout.orientation == 1
              ? 'style="height: 1100px; width: 800px;"'
              : ""
          } onload='step1()'>\n` +
          `<img src="${source}" ${
            this.$store.state.layout.orientation == 1
              ? 'style="height:1100px"'
              : ""
          } /></body></html>`
        );
      }
    },
    PrintImage(source) {
      if (!source) {
        return this.exportBlocked();
      }
      let pwa = window.open("", "_new");
      if (!pwa) {
        return this.$store.dispatch("notification/add", {
          type: "error",
          multiLine: true,
          message:
            "La finestra di stampa è stata bloccata dal browser, " +
            "abilita i popup per questo sito.",
        });
      }
      pwa.document.open();
      pwa.document.write(this.ImagetoPrint(source));
      pwa.document.close();
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

    EventBus.$on("preview-select", () => {
      let stage = this.$store.state.stage;
      // if click on empty area - remove all transformers
      this.$store.dispatch("selectGroup", null);
      stage.find("Transformer").destroy();
      stage.draw();

      if (this.previewCanvas()) {
        this.dialog = true;
      }
    });
  },
};
</script>

<style scoped>
iframe {
  height: 80vh;
  width: 100%;
}
.icon-margin {
  margin-right: 0.5em;
}
</style>
