import api from "./api";

export const studentService = {
  list(params = {}) {
    return api.get("/students", { params });
  },
  seatMap(params = {}) {
    return api.get("/students/seat-map", { params });
  },
  get(id) {
    return api.get(`/students/${id}`);
  },
  create(payload) {
    return api.post("/students", payload);
  },
  update(id, payload) {
    return api.put(`/students/${id}`, payload);
  },
  updateAttendanceStatus(id, payload) {
    return api.put(`/students/${id}/attendance`, payload);
  },
  remove(id) {
    return api.delete(`/students/${id}`);
  },
  import(file) {
    const form = new FormData();
    form.append("file", file);
    return api.post("/students/import", form, { headers: { "Content-Type": "multipart/form-data" } });
  },
  importTemplate() {
    return api.get("/students/import-template", { responseType: "blob" });
  },
  exportUrl() {
    return `${api.defaults.baseURL}/students/export`;
  },
  exportData() {
    return api.get("/students/export", { responseType: "blob" });
  },
  regenerateSeats() {
    return api.post("/students/regenerate-seat-numbers");
  },
  resetAll() {
    return api.post("/students/reset-all");
  },
};
