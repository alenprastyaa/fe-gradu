<template>
  <div class="scanner-shell space-y-4">
    <div class="scanner-viewport relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-700">
      <div id="qr-reader" class="scanner-reader min-h-[360px]"></div>
      <div
        v-show="!active"
        class="scanner-idle absolute inset-0 flex min-h-[360px] flex-col items-center justify-center gap-3 bg-slate-50 px-4 py-14 text-center dark:bg-slate-900/60"
      >
        <span class="flex h-16 w-16 items-center justify-center text-slate-400">
          <Icon icon="ph:qr-code-bold" class="text-4xl" />
        </span>
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ starting ? "Membuka kamera..." : "Kamera belum aktif" }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ starting ? "Izinkan akses kamera dari browser." : 'Tekan "Mulai Scan" untuk mengaktifkan kamera.' }}</p>
          <p v-if="cameraError" class="mt-3 max-w-xs text-xs text-rose-400">{{ cameraError }}</p>
        </div>
      </div>
    </div>

    <div class="scanner-controls grid gap-2 sm:grid-cols-2">
      <button class="btn-primary w-full" @click="start" :disabled="active || starting">
        <Icon :icon="starting ? 'ph:spinner-bold' : 'ph:play-bold'" :class="{ 'animate-spin': starting }" />
        {{ starting ? "Membuka..." : "Mulai Scan" }}
      </button>
      <button class="btn-secondary w-full" @click="stop" :disabled="!active && !starting">
        <Icon icon="ph:stop-bold" /> Stop
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import { Icon } from "@iconify/vue";
import { Html5Qrcode } from "html5-qrcode";

const emit = defineEmits(["scan"]);
const scanner = ref(null);
const active = ref(false);
const starting = ref(false);
const cameraError = ref("");

async function start() {
  if (active.value || starting.value) return;
  starting.value = true;
  cameraError.value = "";
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const qrSize = mobile ? Math.min(320, Math.max(240, Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.62))) : 260;
  const instance = new Html5Qrcode("qr-reader");
  scanner.value = instance;
  try {
    await instance.start(
      { facingMode: "environment" },
      {
        fps: 12,
        qrbox: { width: qrSize, height: qrSize },
        aspectRatio: mobile ? 9 / 16 : undefined,
      },
      (decodedText) => {
        emit("scan", decodedText);
      },
      () => {
        /* decode errors are expected between successful scans */
      }
    );
    active.value = true;
  } catch (error) {
    cameraError.value = cameraErrorMessage(error);
    instance.clear();
    scanner.value = null;
  } finally {
    starting.value = false;
  }
}

async function stop() {
  if (!scanner.value) {
    starting.value = false;
    active.value = false;
    return;
  }
  const current = scanner.value;
  scanner.value = null;
  try {
    if (active.value) await current.stop();
    current.clear();
  } finally {
    active.value = false;
    starting.value = false;
  }
}

onBeforeUnmount(() => {
  if (!scanner.value) return;
  const current = scanner.value;
  const wasActive = active.value;
  scanner.value = null;
  active.value = false;
  const cleanup = wasActive ? current.stop() : Promise.resolve();
  cleanup
    .catch(() => {
      /* scanner may already be stopped by the browser */
    })
    .finally(() => current.clear());
});

function cameraErrorMessage(error) {
  const message = String(error?.message || error || "");
  if (message.toLowerCase().includes("permission") || message.toLowerCase().includes("notallowed")) {
    return "Akses kamera ditolak. Izinkan kamera dari pengaturan browser lalu coba lagi.";
  }
  if (message.toLowerCase().includes("notfound")) {
    return "Kamera tidak ditemukan di perangkat ini.";
  }
  return "Kamera gagal dibuka. Pastikan halaman memakai HTTPS dan izin kamera aktif.";
}
</script>

<style scoped>
:deep(#qr-reader) {
  width: 100%;
}
:deep(#qr-reader video) {
  width: 100% !important;
  min-height: 360px;
  object-fit: cover;
}
:deep(#qr-reader__scan_region) {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(#qr-reader__dashboard) {
  border-top: 1px solid rgb(226 232 240);
  background: #fff;
  padding: 1rem !important;
}
:deep(#qr-reader__dashboard_section) {
  color: #475569;
  font-size: 0.875rem;
}
:deep(#qr-reader__dashboard_section_csr button) {
  border-radius: 0.75rem !important;
  background: #0f172a !important;
  color: #fff !important;
  border: none !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
}
:deep(#qr-reader img) {
  display: none;
}
:deep(#qr-reader select) {
  margin-left: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid #e2e8f0;
  color: #334155;
  outline: none;
}
:deep(#qr-reader a) {
  color: #64748b !important;
  font-size: 0.75rem;
}

@media (max-width: 767px) {
  .scanner-shell {
    position: relative;
    height: 100%;
    min-height: 0;
  }

  .scanner-viewport,
  .scanner-reader,
  .scanner-idle {
    height: 100%;
    min-height: 100%;
    border: 0;
    border-radius: 0;
  }

  .scanner-idle {
    background: #020617;
    color: #fff;
  }

  .scanner-controls {
    position: absolute;
    left: 0.875rem;
    right: 0.875rem;
    bottom: calc(0.875rem + env(safe-area-inset-bottom, 0px));
    z-index: 20;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
    margin: 0;
    padding: 0.625rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .scanner-controls :deep(button) {
    min-height: 44px;
  }

  :deep(#qr-reader) {
    height: 100%;
    min-height: 100%;
    border: 0 !important;
    background: #020617;
  }

  :deep(#qr-reader video) {
    height: 100% !important;
    min-height: 100% !important;
    object-fit: cover;
  }

  :deep(#qr-reader__scan_region) {
    height: 100%;
    min-height: 100% !important;
  }

  :deep(#qr-reader__scan_region img) {
    display: none !important;
  }

  :deep(#qr-reader__dashboard) {
    display: none !important;
  }
}
</style>
