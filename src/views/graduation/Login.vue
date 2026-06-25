<template>
  <div class="min-h-screen bg-slate-100 font-lexend dark:bg-slate-950">
    <div class="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8">
      <div
        class="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <!-- Brand panel -->
        <div
          class="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
          <div class="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5"></div>

          <div class="relative">
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Icon icon="ph:graduation-cap-fill" class="text-2xl" />
              </span>
              <span class="text-sm font-semibold uppercase tracking-widest text-white/80">Graduation CMS</span>
            </div>
            <h1 class="mt-10 max-w-md text-4xl font-bold leading-tight">Kelola undangan wisuda dari satu dashboard.</h1>
            <p class="mt-4 max-w-sm text-sm leading-7 text-white/80">
              Data siswa, nomor bangku otomatis, QR Code absensi, dan link undangan WhatsApp/email tersusun rapi untuk
              panitia.
            </p>
          </div>

          <div class="relative grid grid-cols-3 gap-3">
            <div v-for="f in features" :key="f.label" class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Icon :icon="f.icon" class="text-2xl text-white/90" />
              <p class="mt-2 text-sm font-medium">{{ f.label }}</p>
            </div>
          </div>
        </div>

        <!-- Form panel -->
        <div class="flex items-center p-6 sm:p-10">
          <form class="w-full max-w-sm mx-auto" @submit.prevent="submit">
            <div class="mb-8 flex items-center gap-3 lg:hidden">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Icon icon="ph:graduation-cap-fill" class="text-xl" />
              </span>
              <span class="font-semibold text-slate-900 dark:text-white">Graduation CMS</span>
            </div>

            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Selamat datang 👋</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk untuk mengakses CMS graduation.</p>

            <label class="mt-8 block">
              <span class="label">Email</span>
              <div class="relative">
                <Icon icon="ph:envelope-bold"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="form.email" type="email" class="input pl-10" placeholder="Masukan email" required />
              </div>
            </label>

            <label class="mt-4 block">
              <span class="label">Password</span>
              <div class="relative">
                <Icon icon="ph:lock-bold"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input px-10"
                  placeholder="masukan password" required />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  @click="showPassword = !showPassword">
                  <Icon :icon="showPassword ? 'ph:eye-slash-bold' : 'ph:eye-bold'" />
                </button>
              </div>
            </label>

            <transition name="fade">
              <p v-if="auth.error"
                class="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                <Icon icon="ph:warning-circle-fill" /> {{ auth.error }}
              </p>
            </transition>

            <button class="btn-primary mt-6 w-full py-3" :disabled="auth.loading">
              <Icon v-if="auth.loading" icon="ph:spinner-bold" class="animate-spin" />
              {{ auth.loading ? "Memproses..." : "Login" }}
            </button>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const form = reactive({ email: "", password: "" });
const showPassword = ref(false);

const features = [
  { label: "QR Absensi", icon: "ph:qr-code-bold" },
  { label: "Link WA", icon: "ph:whatsapp-logo-bold" },
  { label: "Import XLSX", icon: "ph:file-xls-bold" },
];

async function submit() {
  try {
    const data = await auth.login(form);
    const redirectPath = typeof route.query.redirect === "string" ? route.query.redirect : "";
    router.push(redirectPath || (data.admin?.role === "super_admin" ? "/super/schools" : "/admin/dashboard"));
  } catch {
    /* error message handled by store (auth.error) */
  }
}
</script>
