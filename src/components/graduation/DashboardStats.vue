<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <div
      v-for="item in cards"
      :key="item.label"
      class="card p-4 sm:p-5"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">{{ item.label }}</p>
          <p class="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{{ item.value }}</p>
        </div>
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11" :class="item.iconClass">
          <Icon :icon="item.icon" class="text-xl sm:text-2xl" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
});

const iconClass = "text-slate-400 dark:text-slate-400";

const cards = computed(() => [
  { label: "Total Siswa", value: props.summary.total_students || 0, icon: "ph:student-bold", iconClass },
  { label: "Total Hadir", value: props.summary.total_hadir || 0, icon: "ph:check-circle-bold", iconClass },
  { label: "Belum Hadir", value: props.summary.total_belum_hadir || 0, icon: "ph:clock-bold", iconClass },
  { label: "Kehadiran", value: `${Number(props.summary.attendance_percentage || 0).toFixed(1)}%`, icon: "ph:chart-pie-slice-bold", iconClass },
  { label: "Total Kelas", value: props.summary.total_classes || 0, icon: "ph:chalkboard-teacher-bold", iconClass },
  { label: "Total Jurusan", value: props.summary.total_majors || 0, icon: "ph:books-bold", iconClass },
]);
</script>
