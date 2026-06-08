import { defineStore } from "pinia";
import { attendanceService } from "@/services/attendanceService";
import { apiMessage } from "@/services/api";

export const useAttendanceStore = defineStore("graduationAttendance", {
  state: () => ({
    summary: {},
    lastScan: null,
    loading: false,
    error: "",
  }),
  actions: {
    async fetchSummary() {
      this.loading = true;
      try {
        const { data } = await attendanceService.summary();
        this.summary = data.data || {};
      } finally {
        this.loading = false;
      }
    },
    async scan(payload) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await attendanceService.scan(payload);
        this.lastScan = data.data;
        await this.fetchSummary();
        return data;
      } catch (error) {
        this.error = apiMessage(error, "QR Code tidak valid");
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
