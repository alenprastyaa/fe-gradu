import api from "./api";

export const superAdminService = {
  schools() {
    return api.get("/super/schools");
  },
  createSchool(payload) {
    return api.post("/super/schools", payload);
  },
  updateSchool(id, payload) {
    return api.put(`/super/schools/${id}`, payload);
  },
  deleteSchool(id) {
    return api.delete(`/super/schools/${id}`);
  },
  admins() {
    return api.get("/super/admins");
  },
  createAdmin(payload) {
    return api.post("/super/admins", payload);
  },
  updateAdmin(id, payload) {
    return api.put(`/super/admins/${id}`, payload);
  },
  deleteAdmin(id) {
    return api.delete(`/super/admins/${id}`);
  },
};
