<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card elevation="0">
      <v-card-actions>
        <v-btn flat @click="captureAndPrint">
          <v-icon class="mr-2">print</v-icon>Stampa
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">
          Chiudi
        </v-btn>
      </v-card-actions>
      <div id="print" ref="captureElement" class="table-container-wrapper">
        <div
          v-for="tableFormatted in tablesFormatted"
          :key="tableFormatted.table_number"
          class="custom-card"
        >
          <div class="custom-card-title">
            <span class="headline">
              {{ tableFormatted.table_name }}
              {{ tableFormatted.table_number }}
            </span>
          </div>

          <div class="custom-card-text">
            <div class="custom-grid-container">
              <div class="guest-row top-row">
                <div class="guest-col col-1"></div>
                <div class="guest-col col-2 center-content">
                  <small
                    v-if="
                      tableFormatted.topGuests &&
                        tableFormatted.topGuests.length
                    "
                    v-for="(guest, index) in tableFormatted.topGuests"
                    :key="'top-' + index"
                    class="guest-name"
                  >
                    {{ guest.cognome }} {{ guest.nome }}
                  </small>
                </div>
                <div class="guest-col col-3"></div>
              </div>

              <div class="guest-row middle-row">
                <div style="text-align: right" class="guest-col col-1">
                  <p
                    v-if="
                      tableFormatted.leftGuests &&
                        tableFormatted.leftGuests.length
                    "
                    v-for="(guest, index) in tableFormatted.leftGuests"
                    :key="'left-' + index"
                    class="guest-label mb-2"
                  >
                    <small>{{ guest.cognome }} {{ guest.nome }}</small>
                  </p>
                </div>

                <div class="guest-col col-2 center-content">
                  <div :style="tableFormatted.styles"></div>
                </div>

                <div class="guest-col col-3">
                  <p
                    v-if="
                      tableFormatted.rightGuests &&
                        tableFormatted.rightGuests.length
                    "
                    v-for="(guest, index) in tableFormatted.rightGuests"
                    :key="'right-' + index"
                    class="guest-label mb-2"
                  >
                    <small>{{ guest.cognome }} {{ guest.nome }}</small>
                  </p>
                </div>
              </div>

              <div class="guest-row bottom-row">
                <div class="guest-col col-1"></div>
                <div class="guest-col col-2 center-content">
                  <small
                    v-if="
                      tableFormatted.bottomGuests &&
                        tableFormatted.bottomGuests.length
                    "
                    v-for="(guest, index) in tableFormatted.bottomGuests"
                    :key="'bottom-' + index"
                    class="guest-name"
                  >
                    {{ guest.cognome }} {{ guest.nome }}
                  </small>
                </div>
                <div class="guest-col col-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import html2canvas from "html2canvas";

export default {
  name: "TablesReport",
  props: {
    tableReportDialog: Boolean,
  },
  data: (vue) => {
    return {
      dialog: false,
      tableSelected: null,
      tablesFormatted: [],
    };
  },

  computed: {
    info() {
      return this.$store.getters.getInfo;
    },
    tables() {
      return this.table.tablesFetched;
    },
    ...mapState(["guest", "table"]),
    ...mapGetters({ guests: "guest/guests", guestTypes: "guest/guestTypes" }),
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
    buildTemplate() {
      let tables = this.tables;
      tables.forEach((t) => {
        const guests = this.guests(t.id);
        const leftGuests = guests.filter((g) => g.side_seat == 0);
        const topGuests = guests.filter((g) => g.side_seat == 1);
        const rightGuests = guests.filter((g) => g.side_seat == 2);
        const bottomGuests = guests.filter((g) => g.side_seat == 3);
        t.leftGuests = leftGuests;
        t.topGuests = topGuests;
        t.rightGuests = rightGuests;
        t.bottomGuests = bottomGuests;

        const width = Number(t.size) * Number(t.scale_x);
        const height = Number(t.size) * Number(t.scale_y);

        if (t.type_id == 2) {
          t.styles = {
            width: width * 2 + "px",
            height: height * 2 + "px",
            border: "2px solid #000000",
            borderRadius: "50%",
          };
        } else {
          t.styles = {
            width: width + "px",
            height: height + "px",
            border: "2px solid #000000",
          };
        }

        if (!t.table_name.includes("HIDDEN")) {
          this.tablesFormatted = [...this.tablesFormatted, t];
        }
      });
    },
    close() {
      this.$emit("tables-report-close");
    },
    addStyles(printWindow) {
      // 1. Create a <link> element
      const link = printWindow.document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";

      // 2. Set the href to your main CSS file path
      // IMPORTANT: Use the absolute path if your CSS file is not in the same directory!
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/vuetify/1.5.0/vuetify.min.css";

      // 3. Append the link element to the new window's <head>
      printWindow.document.head.appendChild(link);
    },
    printElm() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("print").innerHTML;

      // Get all stylesheets HTML
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }

      // Open the print window
      const WinPrint = window.open(
        "",
        "",
        "left=0,top=0,width=794,height=1123,toolbar=0,scrollbars=0,status=0"
      );

      WinPrint.document.write(`<!DOCTYPE html>
<html>
  <head>
    ${stylesHtml}
  </head>
  <body>
    ${prtHtml}
  </body>
</html>`);
      this.addStyles(WinPrint);

      // WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      // WinPrint.close();
    },

    captureAndPrint() {
      // Get the target DOM element using the Vue $refs object
      this.$nextTick(() => {
        const element = this.$refs.captureElement;

        if (!element) {
          console.error("Target element not found.");
          return;
        }

        // Call html2canvas to convert the DOM element to a canvas
        html2canvas(element, {
          // Optional: Increase scale for better print resolution
          scale: 2,
          useCORS: true, // Essential if your div contains images from external sources
        })
          .then((canvas) => {
            // Convert the canvas to an image Data URL
            const imgData = canvas.toDataURL("image/png");

            // Create a new window for printing
            const printWindow = window.open(
              "",
              "",
              "left=0,top=0,width=794,height=1123,toolbar=0,scrollbars=0,status=0"
            );
            // const printWindow = window.open("", "_blank");
            printWindow.document.write("<html><head><title>Print</title>");

            // Call the function to inject the styles BEFORE the <body> tag is written
            printWindow.document.write("</head><body>");

            // Create the image element dynamically
            const img = printWindow.document.createElement("img");
            img.src = imgData;
            img.style.width = "100%"; // Ensure the image spans the printable width

            this.addStyles(printWindow);

            // Crucial step: Set the onload handler
            // The print process only starts after the image has finished loading
            img.onload = function() {
              // Append the image to the new window's document body
              printWindow.document.body.appendChild(img);
              printWindow.print();
              printWindow.document.close();

              // Optional: Close the window after printing (with a small delay)
              // setTimeout(() => printWindow.close(), 100);
              setTimeout(() => {
                printWindow.focus();
                // printWindow.close();
              }, 100);
            };
          })
          .catch((error) => {
            console.error("Error capturing element with html2canvas:", error);
          });
      });
    },
  },
  watch: {
    tableReportDialog() {
      if (this.tableReportDialog) {
        this.buildTemplate();
      }
      this.dialog = this.tableReportDialog;
    },
  },
};
</script>

<style scoped>
/* Styling for the overall card structure */
.custom-card {
  border-bottom: 1px solid #ccc; /* Simple border for v-card elevation/outline */
  margin-top: 20px; /* Space between cards */
  padding: 16px; /* Inner padding */
}

.custom-card-title {
  padding-bottom: 8px;
}

.headline {
  font-size: 1.5rem; /* Equivalent to Vuetify's headline */
  font-weight: 500;
}

.custom-card-text {
  /* Remove Vuetify's py-0 equivalent padding if desired */
}

/* Layout for the Seating Arrangement (v-container/v-layout/v-flex replacement) */
.custom-grid-container {
  display: flex;
  flex-direction: column;
}

.guest-row {
  display: flex;
  width: 100%;
}

.guest-col {
  /* Simulates v-flex xs4 (12/3 = 4) */
  flex-basis: 33.333333%;
  max-width: 33.333333%;
  padding: 8px 4px; /* Small padding */
}

/* Specific Layout Adjustments */
.center-content {
  display: flex;
  justify-content: center; /* Equivalent to d-flex justify-center */
  align-items: center;
  flex-wrap: wrap; /* Allow guests to wrap if needed */
}

.right-align-content {
  display: flex;
  flex-direction: column; /* To stack the p tags */
  justify-content: flex-end; /* Equivalent to justify-end */
  align-items: flex-end; /* To align text to the right side of the column */
}

.guest-name {
  margin: 0 4px; /* Space between names in top/bottom rows */
}

/* Paragraph styling for left/right guests */
.guest-label {
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 8px; /* Equivalent to mb-2 */
  line-height: 1.2;
}

.guest-label:last-child {
  margin-bottom: 0; /* Remove margin from last element */
}

.right-align-content .guest-label {
  text-align: right; /* Equivalent to style="text-align: end;" */
}

/* Styling for the table visual placeholder */
.table-visual-placeholder {
  /* This is where the tableFormatted.styles will apply. */
  /* Example style for a circular table when tableFormatted.styles is not defined: */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid black;
}
</style>
