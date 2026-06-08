<template>
  <div class="space-y-3">
    <!-- Search -->
    <div class="relative">
      <div class="relative">
        <Icon icon="ph:magnifying-glass-bold" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="query"
          class="input pl-9 pr-24"
          placeholder="Cari nama tempat / alamat (mis. Aula SMK ...)"
          @input="onSearchInput"
          @keydown.enter.prevent="searchNow"
          @focus="results.length && (showResults = true)"
        />
        <button
          type="button"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          :disabled="searching || !query.trim()"
          @click="searchNow"
        >
          <Icon v-if="searching" icon="ph:spinner-bold" class="animate-spin" />
          <Icon v-else icon="ph:magnifying-glass-bold" />
          Cari
        </button>
      </div>

      <!-- Results dropdown -->
      <ul
        v-if="showResults && results.length"
        class="absolute z-[1200] mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-card dark:border-slate-700 dark:bg-slate-800"
      >
        <li v-for="item in results" :key="item.place_id">
          <button
            type="button"
            class="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/60"
            @click="selectResult(item)"
          >
            <Icon icon="ph:map-pin-bold" class="mt-0.5 shrink-0 text-primary-600" />
            <span class="text-sm text-slate-700 dark:text-slate-200">{{ item.display_name }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="showResults && searched && !searching" class="absolute z-[1200] mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400 shadow-card dark:border-slate-700 dark:bg-slate-800">
        Lokasi tidak ditemukan. Coba kata kunci lain.
      </p>
    </div>

    <!-- Map -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
      <div ref="mapEl" class="h-72 w-full"></div>
      <button
        type="button"
        class="absolute right-3 top-3 z-[800] inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-soft backdrop-blur transition hover:bg-white dark:bg-slate-800/95 dark:text-slate-200"
        :disabled="locating"
        title="Gunakan lokasi saya"
        @click="useMyLocation"
      >
        <Icon v-if="locating" icon="ph:spinner-bold" class="animate-spin" />
        <Icon v-else icon="ph:crosshair-bold" />
        Lokasi saya
      </button>
      <div class="pointer-events-none absolute bottom-3 left-3 z-[800] rounded-lg bg-white/90 px-2.5 py-1 text-[11px] text-slate-500 shadow-soft dark:bg-slate-800/90 dark:text-slate-400">
        Klik peta atau geser pin untuk memilih titik
      </div>
    </div>

    <!-- Coordinates readout -->
    <p v-if="coords" class="flex items-center gap-1.5 text-xs text-slate-400">
      <Icon icon="ph:navigation-arrow-bold" />
      Koordinat: <span class="font-mono text-slate-500 dark:text-slate-300">{{ coords.lat.toFixed(6) }}, {{ coords.lng.toFixed(6) }}</span>
    </p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
  address: { type: String, default: "" },
  mapsUrl: { type: String, default: "" },
});
const emit = defineEmits(["update:address", "update:mapsUrl"]);

const mapEl = ref(null);
const query = ref("");
const results = ref([]);
const showResults = ref(false);
const searching = ref(false);
const searched = ref(false);
const locating = ref(false);
const coords = ref(null);

let map = null;
let marker = null;
let debounceId = null;
let lastEmittedUrl = "";

/* emit a maps url and remember it, so the external watch can ignore our own updates */
function emitMapsUrl(lat, lng) {
  const url = buildMapsUrl(lat, lng);
  lastEmittedUrl = url;
  emit("update:mapsUrl", url);
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="transform:translate(-50%,-100%)">
    <svg width="34" height="46" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z" fill="#4f46e5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
    </svg>
  </div>`,
  iconSize: [34, 46],
  iconAnchor: [0, 0],
});

function buildMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/* Try to recover lat/lng from an existing Google Maps URL */
function parseLatLng(url) {
  if (!url) return null;
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function placeMarker(lat, lng) {
  coords.value = { lat, lng };
  if (!marker) {
    marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const { lat: la, lng: ln } = marker.getLatLng();
      coords.value = { lat: la, lng: ln };
      emitMapsUrl(la, ln);
      reverseGeocode(la, ln);
    });
  } else {
    marker.setLatLng([lat, lng]);
  }
}

function setPoint(lat, lng, { fly = true, reverse = true } = {}) {
  placeMarker(lat, lng);
  emitMapsUrl(lat, lng);
  if (fly && map) map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  if (reverse) reverseGeocode(lat, lng);
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`
    );
    const data = await res.json();
    if (data?.display_name) emit("update:address", data.display_name);
  } catch {
    /* keep existing address on failure */
  }
}

function onSearchInput() {
  showResults.value = true;
  clearTimeout(debounceId);
  if (!query.value.trim()) {
    results.value = [];
    searched.value = false;
    return;
  }
  debounceId = setTimeout(searchNow, 500);
}

async function searchNow() {
  const q = query.value.trim();
  if (!q) return;
  clearTimeout(debounceId);
  searching.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6&accept-language=id`
    );
    results.value = await res.json();
    showResults.value = true;
  } catch {
    results.value = [];
  } finally {
    searching.value = false;
    searched.value = true;
  }
}

function selectResult(item) {
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  emit("update:address", item.display_name);
  emitMapsUrl(lat, lng);
  placeMarker(lat, lng);
  if (map) map.flyTo([lat, lng], 16, { duration: 0.6 });
  showResults.value = false;
  query.value = "";
}

function useMyLocation() {
  if (!navigator.geolocation) return;
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setPoint(pos.coords.latitude, pos.coords.longitude);
      locating.value = false;
    },
    () => (locating.value = false),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function handleDocClick(e) {
  if (!mapEl.value?.parentElement?.parentElement?.contains(e.target)) showResults.value = false;
}

onMounted(() => {
  const initial = parseLatLng(props.mapsUrl);
  const center = initial || { lat: -2.5489, lng: 118.0149 }; // Indonesia
  map = L.map(mapEl.value, { zoomControl: true, attributionControl: true }).setView(
    [center.lat, center.lng],
    initial ? 16 : 4
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  if (initial) placeMarker(initial.lat, initial.lng);

  map.on("click", (e) => setPoint(e.latlng.lat, e.latlng.lng, { fly: false }));

  // ensure correct sizing inside cards/transitions
  setTimeout(() => map && map.invalidateSize(), 200);
  document.addEventListener("click", handleDocClick);
});

/* react when the maps URL changes from outside (e.g. switching templates / async load) */
watch(
  () => props.mapsUrl,
  (val) => {
    if (!map || !val || val === lastEmittedUrl) return;
    const p = parseLatLng(val);
    if (p) {
      placeMarker(p.lat, p.lng);
      map.setView([p.lat, p.lng], 16);
    }
  }
);

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocClick);
  clearTimeout(debounceId);
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  background: #e2e8f0;
}
:deep(.leaflet-control-attribution) {
  font-size: 10px;
}
</style>
