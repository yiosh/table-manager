<template>
  <v-snackbar
    :timeout="0"
    :value="notificationStatus"
    :color="notificationTypeClass"
    :multi-line="notification.multiLine"
    top
    center
    absolute
  >
    {{ notification.message }}
    <v-btn flat @click="remove(notification)">{{ labels.close }}</v-btn>
  </v-snackbar>
</template>

<script>
import { mapActions } from "vuex";
import { EventBus } from "../../event-bus.js";

export default {
  name: "BaseNotification",
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    notificationStatus: true,
    timeout: null,
    labelsEn: {
      close: "Close"
    },
    labels: {
      close: "Chiudi"
    }
  }),
  mounted() {
    this.timeout = setTimeout(() => this.remove(this.notification), 5000);
  },
  created() {
    EventBus.$on("fetch-done", () => {
      const translatedLabels = this.$store.state.translatedLabels;
      const labels = this.labels;

      for (const translatedLabel of translatedLabels) {
        for (const label in labels) {
          if (translatedLabel.placeholder === label) {
            labels[label] = translatedLabel.content;
          }
        }
      }
    });
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  computed: {
    notificationTypeClass() {
      return this.notification.type;
    }
  },
  methods: {
    close() {
      this.remove();
    },
    ...mapActions("notification", ["remove"])
  }
};
</script>

<style scoped></style>
