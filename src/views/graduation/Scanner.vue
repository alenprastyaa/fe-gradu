<template>
  <main class="space-y-6 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Kehadiran</p>
        <h1 class="page-title">Scanner Absensi</h1>
        <p class="page-subtitle">Scan QR Code dari halaman undangan siswa untuk mencatat kehadiran.</p>
      </div>
      <div
        class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <Icon icon="ph:camera-bold" class="text-lg text-slate-400" />
        Kamera Browser
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center text-slate-400">
              <Icon icon="ph:qr-code-bold" class="text-xl" />
            </span>
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">Kamera Scanner</h2>
              <p class="text-xs text-slate-400">QR Code absensi siswa</p>
            </div>
          </div>
        </div>
        <div class="p-4 sm:p-5">
          <QRScanner @scan="scan" />
        </div>
      </section>

      <aside class="space-y-5">
        <AttendanceResult :result="attendance.lastScan" :error="attendance.error" />

        <section class="card p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">Ringkasan Absensi</h2>
              <p class="text-xs text-slate-400">Status kehadiran saat ini</p>
            </div>
            <span class="flex h-10 w-10 items-center justify-center text-slate-400">
              <Icon icon="ph:chart-pie-slice-bold" class="text-xl" />
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in scannerStats" :key="item.label"
              class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/60 dark:bg-slate-900/40">
              <div class="mb-3 flex h-8 w-8 items-center justify-center text-slate-400">
                <Icon :icon="item.icon" />
              </div>
              <p class="text-xs text-slate-400">{{ item.label }}</p>
              <p class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{{ item.value }}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import QRScanner from "@/components/graduation/QRScanner.vue";
import AttendanceResult from "@/components/graduation/AttendanceResult.vue";
import { useAttendanceStore } from "@/store/attendance";
import { apiMessage } from "@/services/api";
import { swalScanStatus } from "@/helper/swal";

const attendance = useAttendanceStore();
const scanLocked = ref(false);

const scannerStats = computed(() => [
  { label: "Total Siswa", value: attendance.summary.total_students || 0, icon: "ph:student-bold" },
  { label: "Hadir", value: attendance.summary.total_hadir || 0, icon: "ph:check-circle-bold" },
  { label: "Belum Hadir", value: attendance.summary.total_belum_hadir || 0, icon: "ph:clock-bold" },
  { label: "Kehadiran", value: `${Number(attendance.summary.attendance_percentage || 0).toFixed(1)}%`, icon: "ph:chart-line-up-bold" },
]);

async function scan(payload) {
  if (scanLocked.value) return;
  scanLocked.value = true;
  try {
    const response = await attendance.scan(payload);
    const result = response?.data;
    const student = result?.student;
    const alreadyAttended = result?.status === "already_attended";
    await swalScanStatus({
      success: !alreadyAttended,
      title: alreadyAttended ? "Sudah absen" : "Scan berhasil",
      text: student?.name ? `${student.name} - ${student.class_name || ""}`.trim() : response?.message || "Absensi berhasil diproses.",
      timer: 3000,
    });
  } catch (error) {
    await swalScanStatus({
      success: false,
      title: "Scan gagal",
      text: apiMessage(error, "QR Code tidak valid"),
      timer: 3000,
    });
  } finally {
    scanLocked.value = false;
  }
}
onMounted(() => attendance.fetchSummary());
</script>
