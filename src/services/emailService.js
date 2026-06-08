import api from "./api";

export const emailService = {
  one(id) {
    return api.post(`/students/${id}/send-email`);
  },
  all(studentIds = []) {
    return api.post("/students/email-send", studentIds.length ? { student_ids: studentIds } : undefined);
  },
  resetSent(id) {
    return api.delete(`/students/${id}/email-sent`);
  },
  syncHistory(days = 90) {
    return api.post("/students/email-history/sync", undefined, { params: { days } });
  },
};
