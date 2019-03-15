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
    <v-btn flat @click="remove(notification)">Chiudi</v-btn>
  </v-snackbar>
</template>

<script>
import { mapActions } from "vuex";
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
    timeout: null
  }),
  mounted() {
    this.timeout = setTimeout(() => this.remove(this.notification), 5000);
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
