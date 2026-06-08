<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Laporan</p>
        <h1 class="page-title">Rekap Absensi</h1>
        <p class="page-subtitle">Pantau kehadiran siswa dan export data absensi.</p>
      </div>
      <button class="btn-primary" @click="exportXLSX">
        <Icon icon="ph:file-xls-bold" /> Export XLSX
      </button>
    </div>

    <DashboardStats :summary="attendance.summary" />
    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div class="relative">
          <Icon icon="ph:magnifying-glass-bold"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" class="input pl-9" placeholder="Cari nama / nomor bangku"
            @input="applyFilter" />
        </div>
        <select v-model="filters.class_name" class="input" @change="applyFilter">
          <option value="">Semua kelas</option>
          <option v-for="item in students.classes" :key="item">{{ item }}</option>
        </select>
        <select v-model="filters.major" class="input" @change="applyFilter">
          <option value="">Semua jurusan</option>
          <option v-for="item in students.majors" :key="item">{{ item }}</option>
        </select>
        <select v-model="filters.attendance_status" class="input" @change="applyFilter">
          <option value="">Semua status</option>
          <option value="belum_hadir">Belum hadir</option>
          <option value="hadir">Hadir</option>
        </select>
      </div>
    </section>
    <StudentTable :students="students.items" @edit="openEdit" @invite="openInvite" @whatsapp="openWhatsapp" @email="openEmail" />
    <StudentPagination :pagination="students.pagination" @page-change="changePage" @limit-change="changeLimit" />

    <div v-if="attendanceEditor.open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm sm:py-10">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:mt-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Edit Kehadiran</p>
            <h2 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{{ attendanceEditor.student?.name }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ attendanceEditor.student?.class_name }} · {{ attendanceEditor.student?.major }}
            </p>
          </div>
          <button class="icon-btn" @click="closeEdit"><Icon icon="ph:x-bold" /></button>
        </div>

        <div class="mt-5 max-h-[calc(100vh-14rem)] space-y-3 overflow-y-auto pr-1">
          <label class="block">
            <span class="label">Status Kehadiran</span>
            <select v-model="attendanceEditor.status" class="input">
              <option value="belum_hadir">Belum Hadir</option>
              <option value="hadir">Hadir</option>
            </select>
          </label>
          <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
            <p class="font-semibold text-slate-700 dark:text-slate-200">Efek perubahan:</p>
            <p class="mt-1">Status akan disimpan ke backend dan ringkasan absensi akan diperbarui.</p>
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="btn-secondary" :disabled="attendanceSaving" @click="closeEdit">Batal</button>
          <button class="btn-primary" :disabled="attendanceSaving" @click="saveAttendance">
            <Icon v-if="attendanceSaving" icon="ph:spinner-bold" class="animate-spin" />
            <Icon v-else icon="ph:floppy-disk-bold" />
            {{ attendanceSaving ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";
import DashboardStats from "@/components/graduation/DashboardStats.vue";
import StudentTable from "@/components/graduation/StudentTable.vue";
import StudentPagination from "@/components/graduation/StudentPagination.vue";
import { useAttendanceStore } from "@/store/attendance";
import { useStudentsStore } from "@/store/students";
import { studentService } from "@/services/studentService";
import { apiMessage } from "@/services/api";
import { useToastStore } from "@/store/toast";
import { swalConfirm } from "@/helper/swal";

const attendance = useAttendanceStore();
const students = useStudentsStore();
const toast = useToastStore();
const filters = reactive({ search: "", class_name: "", major: "", attendance_status: "" });
const attendanceEditor = reactive({ open: false, student: null, status: "belum_hadir" });
const attendanceSaving = ref(false);

function applyFilter() {
  students.fetchStudents({ ...filters, page: 1, limit: students.pagination.limit });
}
function changePage(page) {
  students.fetchStudents({ ...filters, page, limit: students.pagination.limit });
}
function changeLimit(limit) {
  students.fetchStudents({ ...filters, page: 1, limit });
}

async function exportXLSX() {
  try {
    const response = await studentService.exportData();
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rekap-absensi.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error(apiMessage(err, "Gagal export rekap absensi"));
  }
}
function openInvite(student) {
  window.open(`/invite/${student.invitation_code}`, "_blank");
}
function openEdit(student) {
  attendanceEditor.student = student;
  attendanceEditor.status = student.attendance_status || "belum_hadir";
  attendanceEditor.open = true;
}
function closeEdit() {
  attendanceEditor.open = false;
  attendanceEditor.student = null;
  attendanceEditor.status = "belum_hadir";
}
async function saveAttendance() {
  if (!attendanceEditor.student) return;
  const student = attendanceEditor.student;
  const nextStatus = attendanceEditor.status;
  if (nextStatus === student.attendance_status) {
    closeEdit();
    return;
  }
  const confirmed = await swalConfirm({
    title: "Simpan perubahan status?",
    text: `Ubah kehadiran ${student.name} menjadi ${nextStatus === "hadir" ? "Hadir" : "Belum Hadir"}?`,
    confirmButtonText: "Simpan",
    icon: "warning",
  });
  if (!confirmed) return;

  attendanceSaving.value = true;
  try {
    await studentService.updateAttendanceStatus(student.id, { attendance_status: nextStatus });
    await Promise.all([attendance.fetchSummary(), students.fetchStudents({ ...filters, page: students.pagination.page, limit: students.pagination.limit })]);
    toast.success("Status absensi berhasil diperbarui.");
    closeEdit();
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menyimpan status absensi"));
  } finally {
    attendanceSaving.value = false;
  }
}
async function openWhatsapp(student) {
  try {
    const data = await students.whatsappLink(student.id);
    window.open(data.link, "_blank");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal membuat link WhatsApp"));
  }
}
async function openEmail(student) {
  try {
    const data = await students.emailLink(student.id);
    if (data.sent) toast.success(`Email undangan dikirim ke ${data.email}.`);
    else if (data.already_sent) toast.warning("Email undangan sudah pernah dikirim, pengiriman ulang dilewati.");
    else toast.warning(data.message || "Email siswa belum tersedia.");
    await students.fetchStudents({ ...filters, page: students.pagination.page, limit: students.pagination.limit });
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mengirim email"));
  }
}
onMounted(() => Promise.all([attendance.fetchSummary(), students.fetchStudents({ ...filters, page: 1, limit: students.pagination.limit })]));
</script>
