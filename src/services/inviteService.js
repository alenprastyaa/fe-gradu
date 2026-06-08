import api from "./api";

export const inviteService = {
  get(code) {
    return api.get(`/invite/${code}`);
  },
};
