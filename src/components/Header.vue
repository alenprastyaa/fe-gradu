<template>
  <header
    ref="headerEl"
    class="app-header sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <!-- Left: mobile toggle + page title -->
      <div class="flex items-center gap-3">
        <button
          class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          @click="$emit('sidebarToggle', true)"
        >
          <Icon icon="ph:list-bold" class="text-xl" />
        </button>
        <div>
          <h1 class="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">{{ pageTitle }}</h1>
          <p class="hidden text-xs text-slate-400 sm:block">{{ today }}</p>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          class="hidden rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 sm:inline-flex dark:text-slate-400 dark:hover:bg-slate-800"
          :title="fullscreenMode ? 'Keluar layar penuh' : 'Layar penuh'"
          @click="fullscreenToggle"
        >
          <Icon :icon="fullscreenMode ? 'ic:outline-fullscreen-exit' : 'ic:outline-fullscreen'" class="text-xl" />
        </button>

        <button
          class="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          :title="darkMode ? 'Mode terang' : 'Mode gelap'"
          @click="setTheme(!darkMode)"
        >
          <Icon :icon="darkMode ? 'ph:sun-bold' : 'ph:moon-bold'" class="text-xl" />
        </button>

        <div class="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700"></div>

        <!-- User -->
        <div class="relative">
          <button
            class="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="menuToggle"
            @blur="menuToggleBlur"
          >
            <img :src="userAvatar" class="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" alt="" />
            <span class="hidden text-left md:block">
              <span class="block text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">{{ userProfile.full_name }}</span>
              <span class="block text-xs capitalize leading-tight text-slate-400">{{ userProfile.role }}</span>
            </span>
            <Icon icon="ph:caret-down-bold" class="hidden text-xs text-slate-400 md:block" />
          </button>

          <transition name="fade">
            <div
              v-show="menu"
              class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800"
            >
              <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p class="text-xs text-slate-400">Masuk sebagai</p>
                <p class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ userProfile.full_name }}</p>
              </div>
              <button
                class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                @mousedown.prevent="logout"
              >
                <Icon icon="ph:sign-out-bold" class="text-lg" />
                Keluar
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { fullscreen as handleFullscreen } from "@/helper/fullscreen";
import { setDarkMode as handleSetDarkMode } from "@/helper/theme";
import { useAuthStore } from "@/store/auth";
import defaultAvatar from "@/assets/img/user.jpg";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
defineEmits(["sidebarToggle"]);

const userAvatar = defaultAvatar;
const userProfile = ref({ full_name: "Administrator", role: "admin" });
const menu = ref(false);
const darkMode = ref(false);
const fullscreenMode = ref(false);
const headerEl = ref(null);

const pageTitle = computed(() => {
  const raw = route.meta.title || "Dashboard";
  return raw.split(" - ")[0].trim();
});

const today = computed(() =>
  new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
);

watch(
  () => route.path,
  () => (menu.value = false)
);

const menuToggle = () => (menu.value = !menu.value);
const menuToggleBlur = () => (menu.value = false);

const fullscreenToggle = () => {
  fullscreenMode.value = !fullscreenMode.value;
  handleFullscreen(fullscreenMode.value);
};

const setTheme = (bool) => {
  darkMode.value = bool;
  handleSetDarkMode(bool);
  localStorage.setItem("theme", bool ? "dark" : "light");
};

const logout = async () => {
  await auth.logout();
  router.push({ name: "Login" });
};

function syncHeaderHeight() {
  const height = headerEl.value?.offsetHeight || 64;
  document.documentElement.style.setProperty("--app-header-height", `${height}px`);
}

onMounted(() => {
  setTheme(localStorage.getItem("theme") === "dark");

  document.onfullscreenchange = () => {
    fullscreenMode.value = !!document.fullscreenElement;
  };

  const stored = localStorage.getItem("user");
  if (stored) userProfile.value = JSON.parse(stored);
  nextTick(syncHeaderHeight);
  window.addEventListener("resize", syncHeaderHeight, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncHeaderHeight);
});
</script>
