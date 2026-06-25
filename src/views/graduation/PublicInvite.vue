<template>
  <main class="public-invite relative min-h-screen overflow-x-hidden px-2 py-6 sm:px-4 sm:py-12" :style="{ backgroundColor: bg }">
    <!-- decorative gradient blobs -->
    <span class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl" :style="{ backgroundColor: rgba(accent, 0.18) }"></span>
    <span class="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full blur-3xl" :style="{ backgroundColor: rgba(primary, 0.4) }"></span>

    <!-- ===== Opening cover ===== -->
    <transition name="cover">
      <section
        v-if="student && !opened"
        class="cover fixed inset-0 z-40 flex items-center justify-center overflow-hidden px-5"
        :style="{ background: `linear-gradient(160deg, ${primary} 0%, ${bg} 100%)` }"
      >
        <span class="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full blur-3xl" :style="{ backgroundColor: rgba(accent, 0.2) }"></span>
        <span class="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl" :style="{ backgroundColor: rgba(accent, 0.12) }"></span>
        <span class="pointer-events-none absolute left-8 top-16 text-xl cover-twinkle" :style="{ color: rgba(accent, 0.6) }"><Icon icon="ph:sparkle-fill" /></span>
        <span class="pointer-events-none absolute right-10 bottom-24 text-2xl cover-twinkle2" :style="{ color: rgba(accent, 0.5) }"><Icon icon="ph:sparkle-fill" /></span>

        <div class="cover-content relative w-full max-w-md text-center text-white">
        <div
          class="cover-cap mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border backdrop-blur"
          :style="{ borderColor: rgba(accent, 0.6), backgroundColor: event.school_logo_url ? '#ffffff' : rgba('#ffffff', 0.08) }"
        >
          <img
            v-if="event.school_logo_url"
            :src="event.school_logo_url"
            alt="Logo sekolah"
            class="h-full w-full rounded-2xl object-contain p-1.5"
          />
          <Icon v-else icon="ph:graduation-cap-fill" class="text-4xl" :style="{ color: accent }" />
        </div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.34em]" :style="{ color: accent }">{{ event.school_name || "Graduation" }}</p>
          <div class="mt-4 space-y-2">
            <h1 class="text-3xl font-bold leading-tight sm:text-4xl">{{ event.event_title || "Graduation Ceremony" }}</h1>
            <p v-if="event.event_title_second" class="text-sm font-semibold uppercase tracking-[0.22em] text-white/75 sm:text-base">
              {{ event.event_title_second }}
            </p>
          </div>
          <div class="mx-auto my-6 h-px w-16" :style="{ backgroundColor: rgba(accent, 0.6) }"></div>

          <p class="text-xs uppercase tracking-[0.2em] text-white/60">{{ event.recipient_greeting || "Kepada Yth." }}</p>
          <p class="mt-3 text-2xl font-bold">{{ student.name }}</p>
          <p v-if="recipientMeta" class="mt-1 text-sm text-white/60">{{ recipientMeta }}</p>

          <button
            class="open-btn mt-9 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold shadow-xl transition active:scale-95"
            :style="{ backgroundColor: accent, color: accentText }"
            @click="open"
          >
            <Icon icon="ph:envelope-open-bold" class="text-lg" /> Buka Undangan
          </button>
          <p class="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/50">
            <Icon icon="ph:hand-tap-bold" class="animate-pulse" /> Ketuk untuk membuka undangan
          </p>
        </div>
      </section>
    </transition>

    <!-- ===== Invitation (after opening) ===== -->
    <div v-if="opened" class="relative mx-auto max-w-3xl">
      <InvitationCard ref="cardRef" :student="student" :event="event" :seat-map="seatMap" />
    </div>

    <!-- ===== Loading / error ===== -->
    <div v-if="!student" class="relative mx-auto mt-10 max-w-md rounded-3xl bg-white/95 p-10 text-center shadow-2xl">
      <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon :icon="error ? 'ph:warning-circle-bold' : 'ph:spinner-bold'" :class="error ? '' : 'animate-spin'" class="text-3xl" />
      </span>
      <p class="text-sm font-medium text-slate-600">{{ error || "Memuat undangan..." }}</p>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import InvitationCard from "@/components/graduation/InvitationCard.vue";
import { inviteService } from "@/services/inviteService";
import { apiMessage } from "@/services/api";
import { rgba, contrastOn } from "@/helper/color";

const route = useRoute();
const student = ref(null);
const event = ref({});
const seatMap = ref([]);
const error = ref("");
const opened = ref(false);
const cardRef = ref(null);

const bg = computed(() => event.value.theme_background || "#020617");
const primary = computed(() => event.value.theme_primary || "#0f172a");
const accent = computed(() => event.value.theme_accent || "#facc15");
const accentText = computed(() => contrastOn(accent.value));
const recipientMeta = computed(() => {
  if (!student.value) return "";
  if (student.value.invite_type === "teacher") {
    return student.value.major || student.value.class_name || "Guru";
  }
  return [student.value.class_name, student.value.major].filter(Boolean).join(" · ");
});

async function open() {
  opened.value = true;
  await nextTick();
  // opening is a real user gesture → safe to start background music
  cardRef.value?.play?.();
}

onMounted(async () => {
  try {
    const { data } = await inviteService.get(route.params.code);
    student.value = data.data.student;
    event.value = data.data.event;
    seatMap.value = data.data.seat_map?.items || [];
  } catch (err) {
    error.value = apiMessage(err, "Undangan tidak ditemukan");
  }
});
</script>

<style scoped>
.public-invite {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: auto;
}

/* cover fades & lifts away when opened */
.cover-leave-active {
  transition: opacity 0.8s cubic-bezier(0.7, 0, 0.84, 0), transform 0.8s cubic-bezier(0.7, 0, 0.84, 0), filter 0.8s ease;
}
.cover-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(1.05);
  filter: blur(6px);
}

/* cover content intro */
.cover-content {
  animation: cover-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes cover-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.cover-cap {
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}

/* glowing pulse around the open button */
.open-btn {
  position: relative;
}
.open-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  box-shadow: 0 0 0 0 currentColor;
  opacity: 0.5;
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.cover-twinkle {
  animation: twinkle 3s ease-in-out infinite;
}
.cover-twinkle2 {
  animation: twinkle 3.6s ease-in-out infinite;
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover-content,
  .cover-cap,
  .open-btn::after,
  .cover-twinkle,
  .cover-twinkle2 {
    animation: none !important;
  }
}
</style>
