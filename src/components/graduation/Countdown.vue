<template>
  <div v-if="hasTarget" :class="align === 'left' ? 'text-left' : 'text-center'">
    <p class="text-[11px] font-semibold uppercase tracking-[0.2em]" :style="{ color: muted(0.55) }">
      {{ ended ? "Hari yang dinanti telah tiba" : "Menuju Hari Acara" }}
    </p>

    <div v-if="!ended" class="mt-3 grid grid-cols-4 gap-2 sm:gap-3" :class="align === 'left' ? '' : 'mx-auto max-w-md'">
      <div
        v-for="unit in units"
        :key="unit.label"
        class="rounded-2xl border py-3 text-center"
        :style="{ borderColor: rgba(accent, 0.3), backgroundColor: rgba(accent, 0.1) }"
      >
        <p class="font-extrabold tabular-nums leading-none" :class="size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'" :style="{ color: numberColor }">
          {{ unit.value }}
        </p>
        <p class="mt-1.5 text-[10px] font-medium uppercase tracking-wide" :style="{ color: muted(0.5) }">{{ unit.label }}</p>
      </div>
    </div>

    <p v-else class="mt-2 text-lg font-bold" :style="{ color: numberColor }">Selamat & Sukses Selalu 🎉</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { rgba, pickHighlight } from "@/helper/color";

const props = defineProps({
  target: { type: String, default: "" },
  primary: { type: String, default: "#0f172a" },
  accent: { type: String, default: "#facc15" },
  text: { type: String, default: "#0f172a" },
  surface: { type: String, default: "#ffffff" },
  size: { type: String, default: "md" }, // 'md' | 'lg'
  align: { type: String, default: "center" }, // 'center' | 'left'
});

// readable highlight for the big numbers (accent when it pops, else text)
const numberColor = computed(() => pickHighlight(props.accent, props.surface, props.text));

const now = ref(Date.now());
let timer = null;

const targetMs = computed(() => {
  if (!props.target) return null;
  const ms = new Date(props.target).getTime();
  return Number.isNaN(ms) ? null : ms;
});
const hasTarget = computed(() => targetMs.value !== null);
const diff = computed(() => (targetMs.value === null ? 0 : targetMs.value - now.value));
const ended = computed(() => diff.value <= 0);

const units = computed(() => {
  const s = Math.max(0, Math.floor(diff.value / 1000));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return [
    { label: "Hari", value: pad(days) },
    { label: "Jam", value: pad(hours) },
    { label: "Menit", value: pad(minutes) },
    { label: "Detik", value: pad(seconds) },
  ];
});

function muted(alpha) {
  return rgba(props.text, alpha);
}

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => timer && clearInterval(timer));
</script>
