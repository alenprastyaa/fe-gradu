<template>
  <transition name="fade" mode="out-in">
    <div
      v-if="result || error"
      :key="state.key"
      class="overflow-hidden rounded-2xl border shadow-soft"
      :class="state.wrap"
    >
      <div class="flex items-center gap-3 px-5 py-4" :class="state.head">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-white/10">
          <Icon :icon="state.icon" class="text-2xl" :class="state.iconColor" />
        </span>
        <div>
          <p class="text-sm font-semibold" :class="state.title">{{ state.text }}</p>
          <p v-if="!error" class="text-xs opacity-70">{{ student?.name }}</p>
        </div>
      </div>

      <div v-if="student" class="grid gap-x-6 gap-y-3 bg-white px-5 py-4 text-sm sm:grid-cols-2 dark:bg-slate-800">
        <div v-for="row in details" :key="row.label" class="flex items-center justify-between gap-3">
          <span class="text-slate-400">{{ row.label }}</span>
          <span class="font-medium text-slate-800 dark:text-slate-100">{{ row.value }}</span>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-800">
      <Icon icon="ph:scan-bold" class="text-3xl text-slate-300" />
      <p class="text-sm text-slate-400">Hasil scan akan muncul di sini.</p>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  result: { type: Object, default: null },
  error: { type: String, default: "" },
});

const student = computed(() => props.result?.student);

const state = computed(() => {
  if (props.error) {
    return {
      key: "error",
      icon: "ph:x-circle-fill",
      iconColor: "text-rose-600",
      text: props.error,
      wrap: "border-rose-200 dark:border-rose-500/30",
      head: "bg-rose-50 dark:bg-rose-500/10",
      title: "text-rose-700 dark:text-rose-400",
    };
  }
  if (props.result?.status === "already_attended") {
    return {
      key: "warn",
      icon: "ph:warning-circle-fill",
      iconColor: "text-amber-600",
      text: "Siswa sudah absen sebelumnya",
      wrap: "border-amber-200 dark:border-amber-500/30",
      head: "bg-amber-50 dark:bg-amber-500/10",
      title: "text-amber-800 dark:text-amber-400",
    };
  }
  return {
    key: "ok",
    icon: "ph:check-circle-fill",
    iconColor: "text-emerald-600",
    text: "Absensi berhasil",
    wrap: "border-emerald-200 dark:border-emerald-500/30",
    head: "bg-emerald-50 dark:bg-emerald-500/10",
    title: "text-emerald-800 dark:text-emerald-400",
  };
});

const details = computed(() => {
  const s = student.value;
  if (!s) return [];
  return [
    { label: "Kelas", value: s.class_name },
    { label: "Jurusan", value: s.major },
    { label: "Nomor Siswa", value: s.student_seat_number || "—" },
    { label: "Nomor Pendamping", value: s.companion_seat_number || "—" },
    { label: "Waktu", value: s.attendance_time ? new Date(s.attendance_time).toLocaleString("id-ID") : "—" },
  ].filter((row) => !(row.label.startsWith("Nomor") && (!row.value || row.value === "—")));
});
</script>
