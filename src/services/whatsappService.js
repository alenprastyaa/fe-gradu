import api from "./api";

export const whatsappService = {
  one(id) {
    return api.get(`/students/${id}/whatsapp-link`);
  },
  markSent(id) {
    return api.post(`/students/${id}/whatsapp-sent`);
  },
  resetSent(id) {
    return api.delete(`/students/${id}/whatsapp-sent`);
  },
  all(studentIds = []) {
    if (studentIds.length) {
      return api.post("/students/whatsapp-links", { student_ids: studentIds });
    }
    return api.get("/students/whatsapp-links");
  },
};
