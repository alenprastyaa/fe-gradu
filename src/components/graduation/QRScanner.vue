<template>
  <div class="space-y-4">
    <div class="relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-700">
      <div id="qr-reader" class="min-h-[360px]"></div>
      <div
        v-show="!active"
        class="absolute inset-0 flex min-h-[360px] flex-col items-center justify-center gap-3 bg-slate-50 px-4 py-14 text-center dark:bg-slate-900/60"
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

    <div class="grid gap-2 sm:grid-cols-2">
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
  scanner.value = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 260, height: 260 } }, false);
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
</style>
