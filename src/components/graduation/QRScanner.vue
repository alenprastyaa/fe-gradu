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
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Kamera belum aktif</p>
          <p class="mt-1 text-xs text-slate-400">Tekan "Mulai Scan" untuk mengaktifkan kamera.</p>
        </div>
      </div>
    </div>

    <div class="scanner-controls grid gap-2 sm:grid-cols-2">
      <button class="btn-primary w-full" @click="start" :disabled="active">
        <Icon icon="ph:play-bold" /> Mulai Scan
      </button>
      <button class="btn-secondary w-full" @click="stop" :disabled="!active">
        <Icon icon="ph:stop-bold" /> Stop
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import { Icon } from "@iconify/vue";
import { Html5QrcodeScanner } from "html5-qrcode";

const emit = defineEmits(["scan"]);
const scanner = ref(null);
const active = ref(false);

function start() {
  if (active.value) return;
  active.value = true;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  scanner.value = new Html5QrcodeScanner(
    "qr-reader",
    {
      fps: 12,
      qrbox: mobile ? { width: 280, height: 280 } : { width: 260, height: 260 },
      aspectRatio: mobile ? 9 / 16 : undefined,
      videoConstraints: {
        facingMode: { ideal: "environment" },
      },
    },
    false
  );
  try {
    scanner.value.render((decodedText) => {
      emit("scan", decodedText);
    });
  } catch (error) {
    active.value = false;
    scanner.value = null;
    throw error;
  }
}

async function stop() {
  if (!scanner.value) return;
  const current = scanner.value;
  scanner.value = null;
  try {
    await current.clear();
  } finally {
    active.value = false;
  }
}

onBeforeUnmount(() => {
  if (!scanner.value) return;
  const current = scanner.value;
  scanner.value = null;
  active.value = false;
  current.clear().catch(() => {
    /* scanner may already be disposed by the browser */
  });
});
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
