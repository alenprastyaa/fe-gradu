import api from "./api";

export const eventSettingsService = {
  get() {
    return api.get("/event-settings");
  },
  list() {
    return api.get("/event-templates");
  },
  create(payload) {
    return api.post("/event-templates", payload);
  },
  update(payload) {
    if (payload.id) return api.put(`/event-templates/${payload.id}`, payload);
    return api.put("/event-settings", payload);
  },
  updateSeatMap(payload) {
    return api.put("/event-settings/seat-map", payload);
  },
  activate(id) {
    return api.post(`/event-templates/${id}/activate`);
  },
  uploadAudio(file) {
    const form = new FormData();
    form.append("file", file);
    return api.post("/event-templates/audio", form);
  },
  uploadLogo(file) {
    const form = new FormData();
    form.append("file", file);
    return api.post("/event-templates/logo", form);
  },
  remove(id) {
    return api.delete(`/event-templates/${id}`);
  },
};
