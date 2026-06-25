<template>
  <article
    class="invite-card invite-enter relative mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] shadow-2xl shadow-black/40 ring-1"
    :style="{ backgroundColor: t.theme_surface, color: t.theme_text, '--ring-color': rgba(t.theme_accent, 0.35) }"
    @click="tryPlayAudio"
  >
    <!-- ===== Header (fixed top) ===== -->
    <header
      class="relative overflow-hidden px-4 py-10 sm:px-8 sm:py-12"
      :class="isModern ? 'text-left' : 'text-center'"
      :style="{ background: `linear-gradient(140deg, ${t.theme_primary} 0%, ${t.theme_secondary} 100%)` }"
    >
      <span class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full" :style="{ backgroundColor: rgba(t.theme_accent, 0.16) }"></span>
      <span class="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full" :style="{ backgroundColor: rgba('#ffffff', 0.06) }"></span>
      <span class="pointer-events-none absolute right-8 bottom-6 text-2xl float-slow" :style="{ color: rgba(t.theme_accent, 0.5) }"><Icon :icon="isFestive ? 'ph:confetti-fill' : 'ph:sparkle-fill'" /></span>
      <span class="pointer-events-none absolute left-10 top-8 text-lg float-slower" :style="{ color: rgba(t.theme_accent, 0.4) }"><Icon icon="ph:sparkle-fill" /></span>
      <!-- light sweep -->
      <span class="header-shine pointer-events-none absolute inset-0"></span>

      <div class="header-stagger relative">
        <div
          class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur"
          :class="isModern ? '' : 'mx-auto'"
          :style="{ borderColor: rgba(t.theme_accent, 0.6), color: t.theme_accent, backgroundColor: t.school_logo_url ? '#ffffff' : rgba('#ffffff', 0.08) }"
        >
          <img
            v-if="t.school_logo_url"
            :src="t.school_logo_url"
            alt="Logo sekolah"
            class="h-full w-full rounded-[14px] object-contain p-1.5"
          />
          <Icon v-else icon="ph:graduation-cap-fill" class="text-3xl" />
        </div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.32em]" :style="{ color: t.theme_accent }">{{ t.school_name }}</p>
        <div class="mt-4 max-w-2xl" :class="isModern ? '' : 'mx-auto'">
          <h1 class="text-3xl font-bold leading-tight text-white sm:text-[2.6rem]">{{ t.event_title }}</h1>
          <p v-if="t.event_title_second" class="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/75 sm:text-base">
            {{ t.event_title_second }}
          </p>
        </div>
        <div class="mt-6 flex items-center gap-3" :class="isModern ? '' : 'mx-auto justify-center'">
          <span v-if="!isModern" class="h-px w-10" :style="{ backgroundColor: rgba(t.theme_accent, 0.6) }"></span>
          <span
            class="rounded-full border px-4 py-1.5 text-sm font-semibold"
            :style="{ borderColor: rgba(t.theme_accent, 0.5), color: t.theme_accent }"
          >Tahun Kelulusan {{ t.graduation_year }}</span>
          <span class="h-px w-10" :style="{ backgroundColor: rgba(t.theme_accent, 0.6) }"></span>
        </div>
      </div>
    </header>

    <audio
      v-if="t.audio_url"
      ref="audioEl"
      class="hidden"
      :src="t.audio_url"
      loop
      preload="metadata"
    ></audio>

    <!-- ===== Ordered sections (drag-and-drop order from CMS) ===== -->
    <div class="space-y-8 px-4 py-8 sm:px-8 sm:py-10">
      <template v-for="(type, i) in orderedSections" :key="type">
        <!-- Recipient -->
        <section v-if="type === 'recipient'" v-reveal="{ delay: i * 80 }" :class="isModern ? 'text-left' : 'text-center'">
          <p class="text-xs font-semibold uppercase tracking-[0.22em]" :style="{ color: muted(0.55) }">{{ t.recipient_greeting }}</p>
          <h2 class="mt-4 text-3xl font-bold leading-tight sm:text-[2.4rem]" :style="{ color: t.theme_text }">{{ student.name }}</h2>
          <div v-if="recipientMeta" class="mt-3 flex" :class="isModern ? 'justify-start' : 'justify-center'">
            <span class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" :style="{ backgroundColor: rgba(t.theme_accent, 0.16), color: t.theme_text }">
              <Icon :icon="isTeacherInvite ? 'ph:chalkboard-teacher-bold' : 'ph:student-bold'" /> {{ recipientMeta }}
            </span>
          </div>
          <p class="mt-6 max-w-2xl text-base leading-8" :class="isModern ? '' : 'mx-auto'" :style="{ color: muted(0.78) }">{{ t.opening_text }}</p>
        </section>

        <!-- Countdown -->
        <section v-else-if="type === 'countdown' && hasCountdownTarget" v-reveal="{ delay: i * 80 }">
          <Countdown
            :target="t.event_datetime"
            :primary="t.theme_primary"
            :accent="t.theme_accent"
            :text="t.theme_text"
            :surface="t.theme_surface"
            :size="isFestive ? 'lg' : 'md'"
            :align="isModern ? 'left' : 'center'"
          />
        </section>

        <!-- Event details (info grid + address) -->
        <section v-else-if="type === 'details'" v-reveal="{ delay: i * 80 }" class="grid gap-4 sm:grid-cols-2">
          <div v-for="item in infoItems" :key="item.label" class="rounded-2xl border p-5" :style="{ borderColor: muted(0.1), backgroundColor: muted(0.035) }">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :style="{ backgroundColor: t.theme_accent, color: accentText }">
                <Icon :icon="item.icon" class="text-lg" />
              </span>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider" :style="{ color: muted(0.5) }">{{ item.label }}</p>
                <p class="mt-1 text-base font-bold leading-6" :style="{ color: t.theme_text }">{{ item.value }}</p>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border p-5 sm:col-span-2" :style="{ borderColor: muted(0.1), backgroundColor: muted(0.035) }">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :style="{ backgroundColor: t.theme_accent, color: accentText }">
                <Icon icon="ph:map-pin-bold" class="text-lg" />
              </span>
              <div class="min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-wider" :style="{ color: muted(0.5) }">Alamat</p>
                <p class="mt-1 text-sm font-normal leading-6" :style="{ color: muted(0.8) }">{{ t.venue_address }}</p>
                <a
                  v-if="t.maps_url"
                  class="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  :style="{ backgroundColor: t.theme_primary }"
                  :href="t.maps_url"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon icon="ph:map-trifold-bold" /> Buka Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Susunan Acara -->
        <section
          v-else-if="type === 'agenda'"
          v-reveal="{ delay: i * 80 }"
          class="rounded-2xl border p-5"
          :style="{ borderColor: muted(0.12), backgroundColor: muted(0.03) }"
        >
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :style="{ backgroundColor: rgba(t.theme_accent, 0.16), color: t.theme_accent }">
              <Icon icon="ph:list-bullets-bold" class="text-lg" />
            </span>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-wider" :style="{ color: muted(0.5) }">Susunan Acara</p>
              <h3 class="mt-0.5 text-lg font-bold" :style="{ color: t.theme_text }">{{ t.schedule_title || "Susunan Acara" }}</h3>
            </div>
          </div>
          <div class="mt-4 overflow-x-auto rounded-2xl border" :style="{ borderColor: muted(0.12), backgroundColor: muted(0.02) }">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr :style="{ background: `linear-gradient(140deg, ${t.theme_primary} 0%, ${t.theme_secondary} 100%)`, color: '#ffffff' }">
                  <th
                    v-for="(header, headerIndex) in agendaTable.headers"
                    :key="`agenda-h-${headerIndex}`"
                    class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em]"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody :style="{ backgroundColor: t.theme_surface }">
                <tr v-for="(row, rowIndex) in agendaTable.rows" :key="`agenda-r-${rowIndex}`" class="border-t" :style="{ borderColor: muted(0.08) }">
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="`agenda-c-${rowIndex}-${cellIndex}`"
                    class="px-4 py-3 align-top"
                    :style="{ color: t.theme_text, backgroundColor: rowIndex % 2 === 0 ? muted(0.02) : muted(0.035) }"
                  >
                    {{ cell || "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Embedded map -->
        <section v-else-if="type === 'map' && mapEmbedUrl" v-reveal="{ delay: i * 80 }" class="overflow-hidden rounded-2xl border" :style="{ borderColor: muted(0.1) }">
          <iframe
            :src="mapEmbedUrl"
            class="h-64 w-full sm:h-72"
            style="border: 0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Lokasi acara"
          ></iframe>
        </section>

        <!-- Nomor Bangku -->
        <section v-else-if="type === 'seat' && hasSeatNumbers" v-reveal="{ delay: i * 80 }" class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="seat in seatItems" :key="seat.label" class="relative overflow-hidden rounded-2xl border p-5 text-center" :style="{ borderColor: rgba(t.theme_accent, 0.3), backgroundColor: rgba(t.theme_accent, 0.1) }">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em]" :style="{ color: muted(0.55) }">{{ seat.label }}</p>
              <p class="mt-2 text-4xl font-extrabold" :style="{ color: highlight }">{{ seat.value }}</p>
            </div>
          </div>
          <InvitationSeatMap
            v-if="seatMap.length"
            :items="seatMap"
            :columns="t.seat_map_columns"
            :layout="t.seat_map_layout"
            :highlight-numbers="highlightSeatNumbers"
            :accent="t.theme_accent"
            :text-color="t.theme_text"
          />
        </section>

        <!-- QR Code -->
        <section v-else-if="type === 'qr'" v-reveal="{ delay: i * 80 }" class="flex justify-center">
          <div class="flex w-full max-w-xs flex-col items-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <QrCanvas :value="student.qr_payload" :dark="t.theme_primary" />
            <p class="mt-3 break-all text-center text-[10px] font-medium text-slate-400">{{ student.qr_payload }}</p>
          </div>
        </section>

        <!-- Attendance note -->
        <section
          v-else-if="type === 'note'"
          v-reveal="{ delay: i * 80 }"
          class="rounded-2xl p-6 text-white"
          :style="{ background: `linear-gradient(140deg, ${t.theme_primary} 0%, ${t.theme_secondary} 100%)` }"
        >
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg" :style="{ backgroundColor: rgba(t.theme_accent, 0.2), color: t.theme_accent }">
              <Icon icon="ph:info-bold" class="text-lg" />
            </span>
            <h3 class="text-lg font-bold">Catatan Kehadiran</h3>
          </div>
          <p class="mt-4 text-sm leading-7" :style="{ color: rgba('#ffffff', 0.85) }">{{ t.additional_note }}</p>
        </section>
      </template>
    </div>

    <!-- ===== Footer strip (fixed bottom) ===== -->
    <footer class="px-4 py-5 text-center sm:px-8" :style="{ backgroundColor: t.theme_primary }">
      <p class="text-xs font-medium tracking-wide" :style="{ color: rgba('#ffffff', 0.7) }">
        {{ [t.school_name, t.event_title, t.event_title_second, t.graduation_year].filter(Boolean).join(" · ") }}
      </p>
    </footer>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import Countdown from "./Countdown.vue";
import InvitationSeatMap from "./InvitationSeatMap.vue";
import QrCanvas from "./QrCanvas.vue";
import { rgba, contrastOn, pickHighlight } from "@/helper/color";

const props = defineProps({
  student: { type: Object, required: true },
  event: { type: Object, default: () => ({}) },
  seatMap: { type: Array, default: () => [] },
});

const t = computed(() => ({
  event_title: props.event.event_title || "Graduation Ceremony",
  event_title_second: props.event.event_title_second || "",
  school_name: props.event.school_name || "Nama Sekolah",
  graduation_year: props.event.graduation_year || "2026",
  recipient_greeting: props.event.recipient_greeting || "Yth. Siswa/i dan Orang Tua/Wali",
  opening_text: props.event.opening_text || "Dengan hormat, kami mengundang Anda untuk menghadiri acara wisuda sebagai bentuk apresiasi atas pencapaian dan perjalanan pendidikan siswa/i.",
  event_date: props.event.event_date || "Sabtu, 20 Juni 2026",
  event_time: props.event.event_time || "08.00 WIB - selesai",
  venue_name: props.event.venue_name || "Aula Utama Sekolah",
  venue_address: props.event.venue_address || "Jl. Pendidikan No. 1",
  maps_url: props.event.maps_url || "",
  dress_code_student: props.event.dress_code_student || "Seragam sekolah / formal rapi",
  dress_code_parent: props.event.dress_code_parent || "Batik / formal rapi",
  additional_note: props.event.additional_note || "Mohon hadir 30 menit sebelum acara dimulai dan tunjukkan QR Code kepada petugas registrasi.",
  schedule_title: props.event.schedule_title || "",
  schedule_headers: props.event.schedule_headers || "",
  schedule_rows: props.event.schedule_rows || "",
  school_logo_url: props.event.school_logo_url || "",
  audio_url: props.event.audio_url || "",
  audio_title: props.event.audio_title || "",
  audio_autoplay: props.event.audio_autoplay === true,
  theme_primary: props.event.theme_primary || "#0f172a",
  theme_secondary: props.event.theme_secondary || "#1e293b",
  theme_accent: props.event.theme_accent || "#facc15",
  theme_background: props.event.theme_background || "#020617",
  theme_surface: props.event.theme_surface || "#ffffff",
  theme_text: props.event.theme_text || "#0f172a",
  event_datetime: props.event.event_datetime || "",
  layout_variant: props.event.layout_variant || "classic",
  show_countdown: props.event.show_countdown !== false,
  show_map: props.event.show_map !== false,
  show_qr: props.event.show_qr !== false,
  show_note: props.event.show_note !== false,
  seat_map_columns: Math.min(40, Math.max(4, Number(props.event.seat_map_columns) || 20)),
  seat_map_layout: props.event.seat_map_layout || "",
}));

const isModern = computed(() => t.value.layout_variant === "modern");
const isFestive = computed(() => t.value.layout_variant === "festive");
const hasCountdownTarget = computed(() => !!t.value.event_datetime);
const isTeacherInvite = computed(() => props.student?.invite_type === "teacher");
const audioEl = ref(null);

function tryPlayAudio() {
  if (!t.value.audio_autoplay || !audioEl.value || !audioEl.value.paused) return;
  audioEl.value.play().catch(() => {});
}

// Called once when the invitation is opened from the cover (a real user gesture).
// Guarded by `paused` so it never stacks a second playback on top of the first.
function playAudio() {
  if (!t.value.audio_autoplay || !audioEl.value || !audioEl.value.paused) return;
  audioEl.value.play().catch(() => {});
}
defineExpose({ play: playAudio });

// Scroll-reveal directive: each element rises & fades in when it enters the viewport.
const vReveal = {
  mounted(el, binding) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("reveal");
    const delay = (binding.value && binding.value.delay) || 0;
    el.style.transitionDelay = `${delay}ms`;
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("reveal-in");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    el._revealObserver = io;
  },
  unmounted(el) {
    if (el._revealObserver) el._revealObserver.disconnect();
  },
};

const KNOWN_SECTIONS = ["recipient", "countdown", "details", "agenda", "map", "seat", "qr", "note"];

// Section order comes from layout_sections (drag-and-drop in CMS).
// Falls back to legacy show_* toggles for older templates.
const orderedSections = computed(() => {
  const raw = props.event.layout_sections;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        const types = parsed
          .map((s) => (typeof s === "string" ? s : s?.type))
          .filter((x) => KNOWN_SECTIONS.includes(x));
        if (types.length) return types;
      }
    } catch {
      /* fall through to legacy */
    }
  }
  return KNOWN_SECTIONS.filter((type) => {
    if (type === "countdown") return t.value.show_countdown;
    if (type === "agenda") return hasAgendaData(t.value);
    if (type === "map") return t.value.show_map;
    if (type === "seat") return hasSeatNumbers.value;
    if (type === "qr") return t.value.show_qr;
    if (type === "note") return t.value.show_note;
    return true;
  });
});

const infoItems = computed(() => [
  { icon: "ph:calendar-blank-bold", label: "Hari / Tanggal", value: t.value.event_date },
  { icon: "ph:clock-bold", label: "Waktu", value: t.value.event_time },
  { icon: "ph:buildings-bold", label: "Gedung / Venue", value: t.value.venue_name },
  { icon: "ph:t-shirt-bold", label: "Dress Code Siswa", value: t.value.dress_code_student },
  { icon: "ph:users-bold", label: "Dress Code Orang Tua", value: t.value.dress_code_parent },
]);

const recipientMeta = computed(() => {
  if (isTeacherInvite.value) {
    return props.student?.major || props.student?.class_name || "Guru";
  }
  return [props.student?.class_name, props.student?.major].filter(Boolean).join(" · ");
});

const seatItems = computed(() => [
  { label: "Nomor Siswa", value: props.student.student_seat_number || seatFallback.value.student || props.student.seat_number || "-" },
  { label: "Nomor Pendamping", value: props.student.companion_seat_number || seatFallback.value.companion || "-" },
]);
const hasSeatNumbers = computed(() => seatItems.value.some((item) => item.value && item.value !== "-"));
const highlightSeatNumbers = computed(() => [
  props.student.student_seat_number || seatFallback.value.student,
  props.student.companion_seat_number || seatFallback.value.companion,
].filter(Boolean));

const agendaTable = computed(() => parseAgendaTable(t.value.schedule_headers, t.value.schedule_rows));

const seatFallback = computed(() => {
  const raw = String(props.student.seat_number || "");
  const matches = raw.match(/\d+/g) || [];
  return {
    student: matches[0] || "",
    companion: matches[1] || "",
  };
});

/* tint based on the text color — keeps panels readable on any surface */
function muted(alpha) {
  return rgba(t.value.theme_text, alpha);
}
/* icon color that always contrasts on a solid accent chip */
const accentText = computed(() => contrastOn(t.value.theme_accent));
/* highlight color for big numbers: accent if it pops on the surface, else text */
const highlight = computed(() => pickHighlight(t.value.theme_accent, t.value.theme_surface, t.value.theme_text));

/* recover lat/lng from the maps URL so we can embed an iframe (no API key needed) */
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

function hasAgendaData(value) {
  return Boolean(String(value.schedule_title || "").trim() || String(value.schedule_headers || "").trim() || String(value.schedule_rows || "").trim());
}

function parseAgendaTable(headersValue, rowsValue) {
  const defaultHeaders = ["Waktu", "Kegiatan"];
  const defaultRows = [
    ["07.00", "Registrasi"],
    ["08.00", "Pembukaan"],
    ["09.00", "Sambutan"],
  ];

  let headers = [];
  if (typeof headersValue === "string" && headersValue.trim()) {
    try {
      const parsed = JSON.parse(headersValue);
      if (Array.isArray(parsed)) {
        headers = parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      headers = [];
    }
  }
  if (!headers.length) headers = defaultHeaders;

  let rows = [];
  if (typeof rowsValue === "string" && rowsValue.trim()) {
    try {
      const parsed = JSON.parse(rowsValue);
      if (Array.isArray(parsed)) {
        rows = parsed;
      }
    } catch {
      rows = [];
    }
  }
  if (!rows.length) rows = defaultRows;

  const width = Math.max(1, headers.length);
  return {
    headers,
    rows: rows.map((row) => {
      const cells = Array.isArray(row) ? row.map((item) => String(item || "").trim()) : [];
      while (cells.length < width) cells.push("");
      return cells.slice(0, width);
    }),
  };
}

const mapEmbedUrl = computed(() => {
  const p = parseLatLng(t.value.maps_url);
  if (!p) return "";
  return `https://www.google.com/maps?q=${p.lat},${p.lng}&z=16&hl=id&output=embed`;
});
</script>

<style scoped>
.invite-card {
  --ring-color: rgba(250, 204, 21, 0.35);
}
.invite-card.ring-1 {
  --tw-ring-color: var(--ring-color);
}

/* ===== Entrance: the whole card glides up & scales in ===== */
.invite-enter {
  animation: card-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(48px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ===== Header: staggered rise of each child ===== */
.header-stagger > * {
  animation: rise-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.header-stagger > *:nth-child(1) {
  animation-delay: 0.35s;
}
.header-stagger > *:nth-child(2) {
  animation-delay: 0.5s;
}
.header-stagger > *:nth-child(3) {
  animation-delay: 0.65s;
}
.header-stagger > *:nth-child(4) {
  animation-delay: 0.8s;
}
@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ===== Light sweep across the header on open ===== */
.header-shine {
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.22) 50%, transparent 65%);
  transform: translateX(-120%);
  animation: shine 1.6s ease-out 0.6s both;
}
@keyframes shine {
  to {
    transform: translateX(120%);
  }
}

/* ===== Floating decorative sparkles ===== */
.float-slow {
  animation: float 4.5s ease-in-out infinite;
}
.float-slower {
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(8deg);
  }
}

/* ===== Scroll reveal (applied by v-reveal directive) ===== */
:deep(.reveal) {
  opacity: 0;
  transform: translateY(34px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
:deep(.reveal-in) {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .invite-enter,
  .header-stagger > *,
  .header-shine,
  .float-slow,
  .float-slower {
    animation: none !important;
  }
  :deep(.reveal) {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
