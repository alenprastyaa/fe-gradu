<template>
  <main class="space-y-6 p-4 sm:p-6 dark:bg-black">
    <div>
      <p class="page-eyebrow">CMS Admin</p>
      <h1 class="page-title">Dashboard Graduation</h1>
      <p class="page-subtitle">Ringkasan kehadiran dan data siswa untuk acara wisuda.</p>
    </div>

    <DashboardStats :summary="attendance.summary" />

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Recent students -->
      <section class="card lg:col-span-2">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
          <h2 class="font-semibold text-slate-900 dark:text-white">Siswa Terbaru</h2>
          <router-link
            class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            to="/admin/students">
            Kelola Siswa
            <Icon icon="ph:arrow-right-bold" />
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr v-for="student in recentStudents" :key="student.id"
                class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                      {{ initials(student.name) }}
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ student.name }}</p>
                      <p class="truncate text-xs text-slate-400">{{ student.class_name }} · {{ student.major }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 text-right">
                  <span :class="student.attendance_status === 'hadir' ? 'badge-success' : 'badge-warning'">
                    <Icon :icon="student.attendance_status === 'hadir' ? 'ph:check-circle-fill' : 'ph:clock-fill'" />
                    {{ student.attendance_status === "hadir" ? "Hadir" : "Belum Hadir" }}
                  </span>
                </td>
              </tr>
              <tr v-if="recentStudents.length === 0">
                <td class="px-5 py-10 text-center text-sm text-slate-400" colspan="2">Belum ada data siswa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Quick actions -->
      <section class="space-y-4">
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-card">
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
          <div class="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div class="relative">
            <span class="flex h-11 w-11 items-center justify-center text-slate-400">
              <Icon icon="ph:qr-code-bold" class="text-2xl" />
            </span>
            <h2 class="mt-4 text-lg font-semibold">Scanner Cepat</h2>
            <p class="mt-1 text-sm text-white/80">Proses QR Code absensi langsung dari kamera browser.</p>
            <router-link
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              to="/admin/scanner">
              Buka Scanner
              <Icon icon="ph:arrow-right-bold" />
            </router-link>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Aksi Cepat</h3>
          <div class="space-y-2">
            <router-link v-for="action in quickActions" :key="action.to" :to="action.to"
              class="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-sm transition hover:border-primary-200 hover:bg-primary-50/50 dark:border-slate-700/60 dark:hover:bg-slate-700/40">
              <span class="flex h-8 w-8 items-center justify-center text-slate-400 dark:text-slate-400">
                <Icon :icon="action.icon" />
              </span>
              <span class="font-medium text-slate-700 dark:text-slate-200">{{ action.label }}</span>
              <Icon icon="ph:caret-right-bold" class="ml-auto text-slate-300" />
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import DashboardStats from "@/components/graduation/DashboardStats.vue";
import { useAttendanceStore } from "@/store/attendance";
import { useStudentsStore } from "@/store/students";

const attendance = useAttendanceStore();
const students = useStudentsStore();

const recentStudents = computed(() => students.items.slice(0, 7));

const quickActions = [
  { label: "Tambah / Kelola Siswa", icon: "ph:student-bold", to: "/admin/students" },
  { label: "Nomor Bangku", icon: "ph:armchair-bold", to: "/admin/seats" },
  { label: "Import dari XLSX", icon: "ph:upload-simple-bold", to: "/admin/students/import" },
  { label: "Rekap & Export Absensi", icon: "ph:chart-bar-bold", to: "/admin/attendance" },
  { label: "Edit Template Undangan", icon: "ph:envelope-simple-bold", to: "/admin/event-settings" },
];

function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

onMounted(async () => {
  await Promise.all([attendance.fetchSummary(), students.fetchStudents()]);
});
</script>
