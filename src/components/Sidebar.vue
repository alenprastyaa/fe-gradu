<template>
  <nav class="flex h-screen flex-col bg-white dark:bg-slate-900">
    <!-- Brand -->
    <div class="flex items-center justify-between px-5 py-5">
      <router-link to="/admin/dashboard" class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <Icon icon="ph:graduation-cap-fill" class="text-2xl" />
        </span>
        <span class="leading-tight">
          <span class="block text-base font-semibold text-slate-900 dark:text-white" translate="no">Graduation</span>
          <span class="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Invitation CMS</span>
        </span>
      </router-link>
      <button
        class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800"
        @click="$emit('sidebarToggle')"
      >
        <Icon icon="ph:x-bold" class="text-xl" />
      </button>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto px-3 pb-4">
      <p class="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
      <ul class="space-y-1">
        <li v-for="item in menu" :key="item.to">
          <router-link
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            :class="
              isActive(item)
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            "
          >
            <Icon
              :icon="item.icon"
              class="text-xl"
              :class="isActive(item) ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'"
            />
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Footer card -->
    <div class="border-t border-slate-200/80 p-3 dark:border-slate-800">
      <div class="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <div class="flex items-center gap-3">
          <img :src="userAvatar" class="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" alt="" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ userProfile.full_name }}</p>
            <p class="truncate text-xs capitalize text-slate-400">{{ userProfile.role }}</p>
          </div>
          <button
            class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
            title="Keluar"
            @click="logout"
          >
            <Icon icon="ph:sign-out-bold" class="text-lg" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "@/store/auth";
import defaultAvatar from "@/assets/img/user.jpg";

defineEmits(["sidebarToggle"]);

const router = useRouter();
const auth = useAuthStore();
const userAvatar = defaultAvatar;

const menu = [
  { label: "Dashboard", icon: "ph:squares-four-bold", to: "/admin/dashboard", exact: true },
  { label: "Data Siswa", icon: "ph:student-bold", to: "/admin/students" },
  { label: "Nomor Bangku", icon: "ph:armchair-bold", to: "/admin/seats" },
  { label: "Scanner Absensi", icon: "ph:qr-code-bold", to: "/admin/scanner" },
  { label: "Rekap Absensi", icon: "ph:chart-bar-bold", to: "/admin/attendance" },
  { label: "Template Undangan", icon: "ph:envelope-simple-bold", to: "/admin/event-settings" },
  { label: "Reset Data", icon: "ph:trash-bold", to: "/admin/reset-data" },
];

const userProfile = ref({ full_name: "Administrator", role: "admin" });

function isActive(item) {
  const path = router.currentRoute.value.path;
  return item.exact ? path === item.to : path.startsWith(item.to);
}

async function logout() {
  await auth.logout();
  router.push({ name: "Login" });
}

onMounted(() => {
  const stored = localStorage.getItem("user");
  if (stored) userProfile.value = JSON.parse(stored);
});
</script>
