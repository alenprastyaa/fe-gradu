import api from "./api";

export const attendanceService = {
  scan(qrPayload) {
    return api.post("/attendance/scan", { qr_payload: qrPayload });
  },
  summary() {
    return api.get("/attendance/summary");
  },
};
