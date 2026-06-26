<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Laporan</p>
        <h1 class="page-title">Rekap Absensi Guru</h1>
        <p class="page-subtitle">Pantau kehadiran guru dan export data absensi guru.</p>
      </div>
      <button class="btn-primary" :disabled="exporting" @click="exportCSV">
        <Icon v-if="exporting" icon="ph:spinner-bold" class="animate-spin" />
        <Icon v-else icon="ph:file-csv-bold" />
        {{ exporting ? "Menyiapkan..." : "Export CSV" }}
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <div v-for="item in summaryCards" :key="item.label" class="card p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{{ item.value }}</p>
          </div>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 sm:h-11 sm:w-11 dark:text-slate-400">
            <Icon :icon="item.icon" class="text-xl sm:text-2xl" />
          </span>
        </div>
      </div>
    </div>

    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-3">
        <div class="relative md:col-span-2">
          <Icon icon="ph:magnifying-glass-bold" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" class="input pl-9" placeholder="Cari nama / jabatan" @input="applyFilter" />
        </div>
        <select v-model="filters.attendance_status" class="input" @change="applyFilter">
          <option value="">Semua status</option>
          <option value="belum_hadir">Belum hadir</option>
          <option value="hadir">Hadir</option>
        </select>
      </div>
    </section>

    <section class="card overflow-hidden">
      <div class="table-wrap">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
          <thead class="bg-slate-50/80 dark:bg-slate-800/60">
            <tr>
              <th class="th">Guru</th>
              <th class="th">Jabatan</th>
              <th class="th">Kontak</th>
              <th class="th">Status</th>
              <th class="th">Waktu Hadir</th>
              <th class="th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-for="item in items" :key="item.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
              <td class="td">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                    {{ initials(item.name) }}
                  </span>
                  <span class="font-medium text-slate-900 dark:text-slate-100">{{ item.name }}</span>
                </div>
              </td>
              <td class="td">{{ item.position || "Guru" }}</td>
              <td class="td">
                <span class="block text-slate-700 dark:text-slate-300">{{ item.whatsapp_number || "-" }}</span>
                <span v-if="item.email" class="block text-xs text-slate-400">{{ item.email }}</span>
                <span v-else class="block text-xs italic text-slate-300 dark:text-slate-600">tanpa email</span>
              </td>
              <td class="td">
                <span :class="item.attendance_status === 'hadir' ? 'badge-success' : 'badge-warning'">
                  <Icon :icon="item.attendance_status === 'hadir' ? 'ph:check-circle-fill' : 'ph:clock-fill'" />
                  {{ item.attendance_status === "hadir" ? "Hadir" : "Belum Hadir" }}
                </span>
              </td>
              <td class="td text-slate-500">{{ formatDate(item.attendance_time) }}</td>
              <td class="td">
                <div class="flex justify-end gap-1.5">
                  <button class="icon-btn" title="Buka undangan" @click="openInvite(item)"><Icon icon="ph:arrow-square-out-bold" /></button>
                  <button class="icon-btn hover:!border-emerald-300 hover:!bg-emerald-50 hover:!text-emerald-600" title="Kirim WhatsApp" :disabled="!item.whatsapp_number" @click="openWhatsapp(item)"><Icon icon="ph:whatsapp-logo-bold" /></button>
                  <button class="icon-btn hover:!border-primary-300 hover:!bg-primary-50 hover:!text-primary-600" title="Edit status" @click="openEdit(item)"><Icon icon="ph:pencil-simple-bold" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td class="px-5 py-14 text-center" colspan="6">
                <Icon icon="ph:chalkboard-teacher" class="mx-auto mb-2 text-4xl text-slate-300" />
                <p class="text-sm text-slate-400">Belum ada data absensi guru.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <StudentPagination :pagination="pagination" :limit-options="[10, 25, 50, 100]" @page-change="changePage" @limit-change="changeLimit" />

    <div v-if="attendanceEditor.open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm sm:py-10">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:mt-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Edit Kehadiran Guru</p>
            <h2 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{{ attendanceEditor.teacher?.name }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ attendanceEditor.teacher?.position || "Guru" }}</p>
          </div>
          <button class="icon-btn" @click="closeEdit"><Icon icon="ph:x-bold" /></button>
        </div>

        <div class="mt-5 space-y-3">
          <label class="block">
            <span class="label">Status Kehadiran</span>
            <select v-model="attendanceEditor.status" class="input">
              <option value="belum_hadir">Belum Hadir</option>
              <option value="hadir">Hadir</option>
            </select>
          </label>
          <div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
            <p class="font-semibold text-slate-700 dark:text-slate-200">Efek perubahan:</p>
            <p class="mt-1">Status guru akan disimpan ke backend dan ringkasan rekap guru akan diperbarui.</p>
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
import { computed, onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";
import StudentPagination from "@/components/graduation/StudentPagination.vue";
import { teacherInviteService } from "@/services/teacherInviteService";
import { apiMessage } from "@/services/api";
import { useToastStore } from "@/store/toast";
import { swalConfirm } from "@/helper/swal";

const toast = useToastStore();
const items = ref([]);
const allItems = ref([]);
const pagination = ref({ page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_previous: false });
const filters = reactive({ search: "", attendance_status: "" });
const attendanceEditor = reactive({ open: false, teacher: null, status: "belum_hadir" });
const attendanceSaving = ref(false);
const exporting = ref(false);

const summary = computed(() => {
  const total = allItems.value.length;
  const hadir = allItems.value.filter((item) => item.attendance_status === "hadir").length;
  const belum = allItems.value.filter((item) => item.attendance_status !== "hadir").length;
  const positions = new Set(allItems.value.map((item) => item.position).filter(Boolean));
  return {
    total,
    hadir,
    belum,
    positions: positions.size,
    percentage: total ? (hadir / total) * 100 : 0,
  };
});

const summaryCards = computed(() => [
  { label: "Total Guru", value: summary.value.total, icon: "ph:chalkboard-teacher-bold" },
  { label: "Total Hadir", value: summary.value.hadir, icon: "ph:check-circle-bold" },
  { label: "Belum Hadir", value: summary.value.belum, icon: "ph:clock-bold" },
  { label: "Kehadiran", value: `${summary.value.percentage.toFixed(1)}%`, icon: "ph:chart-pie-slice-bold" },
]);

async function fetchItems(page = pagination.value.page, limit = pagination.value.limit) {
  const { data } = await teacherInviteService.list({ ...filters, page, limit });
  items.value = data.data?.items || [];
  pagination.value = data.data?.pagination || pagination.value;
}

async function fetchSummary() {
  const { data } = await teacherInviteService.list({ page: 1, limit: 10000 });
  allItems.value = data.data?.items || [];
}

async function refresh(page = pagination.value.page, limit = pagination.value.limit) {
  await Promise.all([fetchItems(page, limit), fetchSummary()]);
}

async function applyFilter() {
  await fetchItems(1, pagination.value.limit);
}

async function changePage(page) {
  await fetchItems(page, pagination.value.limit);
}

async function changeLimit(limit) {
  await fetchItems(1, limit);
}

function openInvite(item) {
  window.open(`/invite/${item.invitation_code}`, "_blank");
}

function openWhatsapp(item) {
  if (!item?.whatsapp_number) {
    toast.warning("Nomor WhatsApp guru belum tersedia.");
    return;
  }
  const inviteUrl = `${window.location.origin}/invite/${item.invitation_code}`;
  const number = String(item.whatsapp_number).replace(/[^\d]/g, "").replace(/^0/, "62");
  const lines = [
    `Yth. Bapak/Ibu ${item.name},`,
    "",
    "Berikut link undangan acara kelulusan:",
    inviteUrl,
  ];
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
}

function openEdit(item) {
  attendanceEditor.teacher = item;
  attendanceEditor.status = item.attendance_status || "belum_hadir";
  attendanceEditor.open = true;
}

function closeEdit() {
  attendanceEditor.open = false;
  attendanceEditor.teacher = null;
  attendanceEditor.status = "belum_hadir";
}

async function saveAttendance() {
  if (!attendanceEditor.teacher) return;
  const teacher = attendanceEditor.teacher;
  const nextStatus = attendanceEditor.status;
  if (nextStatus === teacher.attendance_status) {
    closeEdit();
    return;
  }
  const confirmed = await swalConfirm({
    title: "Simpan perubahan status?",
    text: `Ubah kehadiran ${teacher.name} menjadi ${nextStatus === "hadir" ? "Hadir" : "Belum Hadir"}?`,
    confirmButtonText: "Simpan",
    icon: "warning",
  });
  if (!confirmed) return;

  attendanceSaving.value = true;
  try {
    await teacherInviteService.updateAttendanceStatus(teacher.id, { attendance_status: nextStatus });
    await refresh(pagination.value.page, pagination.value.limit);
    toast.success("Status absensi guru berhasil diperbarui.");
    closeEdit();
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menyimpan status absensi guru"));
  } finally {
    attendanceSaving.value = false;
  }
}

async function exportCSV() {
  exporting.value = true;
  try {
    const { data } = await teacherInviteService.list({ ...filters, page: 1, limit: 10000 });
    const rows = data.data?.items || [];
    const header = ["Nama", "Jabatan", "WhatsApp", "Email", "Status", "Waktu Hadir", "Kode Undangan"];
    const body = rows.map((item) => [
      item.name,
      item.position || "Guru",
      item.whatsapp_number || "",
      item.email || "",
      item.attendance_status === "hadir" ? "Hadir" : "Belum Hadir",
      formatDate(item.attendance_time),
      item.invitation_code,
    ]);
    downloadCSV([header, ...body], "rekap-absensi-guru.csv");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal export rekap absensi guru"));
  } finally {
    exporting.value = false;
  }
}

function downloadCSV(rows, filename) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

onMounted(() => {
  refresh(1, pagination.value.limit);
});
</script>
