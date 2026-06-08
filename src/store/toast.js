import { defineStore } from "pinia";
import { swalToast } from "@/helper/swal";

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [],
  }),
  actions: {
    push({ type = "info", title = "", message = "" }) {
      return swalToast(type, title, message);
    },
    success(message, title = "Berhasil") {
      return this.push({ type: "success", title, message });
    },
    error(message, title = "Gagal") {
      return this.push({ type: "error", title, message, timeout: 4500 });
    },
    warning(message, title = "Perhatian") {
      return this.push({ type: "warning", title, message, timeout: 4500 });
    },
    remove(id) {
      this.items = this.items.filter((item) => item.id !== id);
    },
  },
});
