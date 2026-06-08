import { defineStore } from "pinia";
import { studentService } from "@/services/studentService";
import { whatsappService } from "@/services/whatsappService";
import { emailService } from "@/services/emailService";
import { apiMessage } from "@/services/api";

export const useStudentsStore = defineStore("graduationStudents", {
  state: () => ({
    items: [],
    filters: { search: "", class_name: "", major: "", attendance_status: "", page: 1, limit: 10 },
    pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_previous: false },
    filterOptions: { classes: [], majors: [] },
    loading: false,
    error: "",
  }),
  getters: {
    classes: (state) => state.filterOptions.classes,
    majors: (state) => state.filterOptions.majors,
  },
  actions: {
    async fetchStudents(params = {}) {
      this.loading = true;
      this.error = "";
      const query = { ...this.filters, ...params };
      try {
        const { data } = await studentService.list(query);
        if (Array.isArray(data.data)) {
          this.items = data.data;
          this.pagination = { page: 1, limit: data.data.length || query.limit || 10, total: data.data.length, total_pages: 1, has_next: false, has_previous: false };
          return;
        }
        this.items = data.data?.items || [];
        this.pagination = data.data?.pagination || this.pagination;
        this.filterOptions = data.data?.filters || this.filterOptions;
        this.filters = { ...query, page: this.pagination.page, limit: this.pagination.limit };
      } catch (error) {
        this.error = apiMessage(error, "Gagal mengambil siswa");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async saveStudent(payload, id = null) {
      const request = id ? studentService.update(id, payload) : studentService.create(payload);
      const { data } = await request;
      await this.fetchStudents(this.filters);
      return data.data;
    },
    async deleteStudent(id) {
      await studentService.remove(id);
      await this.fetchStudents(this.filters);
    },
    async importFile(file) {
      const { data } = await studentService.import(file);
      await this.fetchStudents({ ...this.filters, page: 1 });
      return data;
    },
    async regenerateSeats() {
      await studentService.regenerateSeats();
      await this.fetchStudents(this.filters);
    },
    async whatsappLink(id) {
      const { data } = await whatsappService.one(id);
      return data.data;
    },
    async markWhatsappSent(id) {
      const { data } = await whatsappService.markSent(id);
      return data.data;
    },
    async resetWhatsappSent(id) {
      const { data } = await whatsappService.resetSent(id);
      return data.data;
    },
    async whatsappLinks(ids = []) {
      const { data } = await whatsappService.all(ids);
      return data.data;
    },
    async emailLink(id) {
      const { data } = await emailService.one(id);
      return data.data;
    },
    async emailLinks(ids = []) {
      const { data } = await emailService.all(ids);
      return data.data;
    },
    async resetEmailSent(id) {
      const { data } = await emailService.resetSent(id);
      await this.fetchStudents(this.filters);
      return data.data;
    },
    async syncEmailHistory(days = 90) {
      const { data } = await emailService.syncHistory(days);
      await this.fetchStudents(this.filters);
      return data.data;
    },
  },
});
