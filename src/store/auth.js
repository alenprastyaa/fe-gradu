import { defineStore } from "pinia";
import { authService } from "@/services/authService";
import { apiMessage } from "@/services/api";

export const useAuthStore = defineStore("graduationAuth", {
  state: () => ({
    token: localStorage.getItem("graduation_token") || "",
    admin: JSON.parse(localStorage.getItem("graduation_admin") || "null"),
    loading: false,
    error: "",
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    clearSession() {
      this.token = "";
      this.admin = null;
      this.error = "";
      localStorage.removeItem("graduation_token");
      localStorage.removeItem("graduation_admin");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
    async login(payload) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await authService.login(payload);
        this.token = data.data.token;
        this.admin = data.data.admin;
        localStorage.setItem("graduation_token", this.token);
        localStorage.setItem("graduation_admin", JSON.stringify(this.admin));
        localStorage.setItem("token", this.token);
        localStorage.setItem("role", this.admin.role);
        localStorage.setItem(
          "user",
          JSON.stringify({
            full_name: this.admin.name,
            role: this.admin.role,
            school_name: this.admin.school_name,
          })
        );
        return data.data;
      } catch (error) {
        this.error = apiMessage(error, "Login gagal");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token) return null;
      try {
        const { data } = await authService.me();
        this.admin = data.data;
        localStorage.setItem("graduation_admin", JSON.stringify(this.admin));
        localStorage.setItem("role", this.admin.role);
        localStorage.setItem(
          "user",
          JSON.stringify({
            full_name: this.admin.name,
            role: this.admin.role,
            school_name: this.admin.school_name,
          })
        );
        return this.admin;
      } catch (error) {
        if (error?.response?.status === 401) {
          this.clearSession();
        }
        throw error;
      }
    },
    async logout() {
      try {
        if (this.token) await authService.logout();
      } finally {
        this.clearSession();
      }
    },
  },
});
