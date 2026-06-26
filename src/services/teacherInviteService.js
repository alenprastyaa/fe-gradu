import api from "./api";

export const teacherInviteService = {
  list(params = {}) {
    return api.get("/teacher-invites", { params });
  },
  create(payload) {
    return api.post("/teacher-invites", payload);
  },
  update(id, payload) {
    return api.put(`/teacher-invites/${id}`, payload);
  },
  updateAttendanceStatus(id, payload) {
    return api.put(`/teacher-invites/${id}/attendance`, payload);
  },
  remove(id) {
    return api.delete(`/teacher-invites/${id}`);
  },
  import(file) {
    const form = new FormData();
    form.append("file", file);
    return api.post("/teacher-invites/import", form, { headers: { "Content-Type": "multipart/form-data" } });
  },
  importTemplate() {
    return api.get("/teacher-invites/import-template", { responseType: "blob" });
  },
};
