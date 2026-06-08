<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <!-- Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Manajemen</p>
        <h1 class="page-title">Data Siswa</h1>
        <p class="page-subtitle">Kelola siswa, undangan, nomor bangku, WhatsApp, dan email.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary" @click="exportXLSX">
          <Icon icon="ph:file-xls-bold" /> Export
        </button>
        <button class="btn-secondary" :disabled="emailSyncing" @click="syncEmailHistory">
          <Icon :icon="emailSyncing ? 'ph:spinner-bold' : 'ph:clock-counter-clockwise-bold'"
            :class="{ 'animate-spin': emailSyncing }" />
          {{ emailSyncing ? "Sync..." : "Sync Email" }}
        </button>
        <router-link class="btn-secondary" to="/admin/students/import">
          <Icon icon="ph:upload-simple-bold" /> Import
        </router-link>
        <button class="btn-secondary" @click="regenerate">
          <Icon icon="ph:arrows-clockwise-bold" /> Regenerate Bangku
        </button>
        <button class="btn-primary" @click="openCreate">
          <Icon icon="ph:plus-bold" /> Tambah Siswa
        </button>
      </div>
    </div>

    <!-- Filters -->
    <section class="card space-y-3 p-4">
      <div class="grid gap-3 md:grid-cols-3">
        <div class="relative md:col-span-1">
          <Icon icon="ph:magnifying-glass-bold"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" class="input pl-9" placeholder="Cari nama / nomor bangku"
            @input="applyFilter" />
        </div>
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

      <div class="class-filter-row">
        <button type="button" class="class-filter-chip" :class="{ active: filters.class_name === '' }"
          @click="setClassFilter('')">
          Semua kelas
        </button>
        <button v-for="item in students.classes" :key="item" type="button" class="class-filter-chip"
          :class="{ active: filters.class_name === item }" @click="setClassFilter(item)">
          {{ item }}
        </button>
      </div>
    </section>

    <section v-if="selectedIds.length" class="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {{ selectedIds.length }} siswa dipilih
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Aksi massal hanya berlaku untuk siswa yang sedang dipilih
          di halaman ini.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary" @click="clearSelection">
          <Icon icon="ph:x-bold" /> Batal Pilih
        </button>
        <button class="btn-secondary" @click="sendSelectedWhatsapp" :disabled="!selectedIds.length">
          <Icon icon="ph:whatsapp-logo-bold" /> Kirim WhatsApp Terpilih
        </button>
        <button class="btn-primary" @click="sendSelectedEmail" :disabled="!selectedIds.length">
          <Icon icon="ph:envelope-bold" /> Kirim Email Terpilih
        </button>
      </div>
    </section>

    <StudentTable :students="students.items" :show-selection="true" :selected-ids="selectedIds"
      :all-selected="allSelected" :some-selected="someSelected" @toggle-select="toggleSelect"
      @toggle-select-all="toggleSelectAll" @edit="openEdit" @delete="remove" @invite="openInvite"
      @whatsapp="openWhatsapp" @email="openEmail" />
    <StudentPagination :pagination="students.pagination" :limit-options="paginationLimitOptions"
      @page-change="changePage" @limit-change="changeLimit" />
    <StudentModal :open="modalOpen" :student="selected" :loading="saving" :error="error" @close="modalOpen = false"
      @save="save" />
  </main>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import StudentTable from "@/components/graduation/StudentTable.vue";
import StudentPagination from "@/components/graduation/StudentPagination.vue";
import StudentModal from "@/components/graduation/StudentModal.vue";
import { useStudentsStore } from "@/store/students";
import { studentService } from "@/services/studentService";
import { apiMessage } from "@/services/api";
import { useToastStore } from "@/store/toast";
import { swalConfirm } from "@/helper/swal";

const students = useStudentsStore();
const toast = useToastStore();
const filters = reactive({ ...students.filters });
const modalOpen = ref(false);
const selected = ref(null);
const selectedIds = ref([]);
const saving = ref(false);
const emailSyncing = ref(false);
const error = ref("");
const visibleIds = computed(() => students.items.map((student) => student.id));
const selectedVisibleIds = computed(() => visibleIds.value.filter((id) => selectedIds.value.includes(id)));
const allSelected = computed(() => visibleIds.value.length > 0 && selectedVisibleIds.value.length === visibleIds.value.length);
const someSelected = computed(() => selectedVisibleIds.value.length > 0 && !allSelected.value);
const paginationLimitOptions = computed(() => {
  if (filters.class_name) {
    return [students.pagination.total || students.pagination.limit || 1];
  }
  return [10, 25, 50, 100];
});

async function applyFilter() {
  clearSelection();
  await loadStudents();
}
function setClassFilter(className) {
  if (filters.class_name === className) return;
  filters.class_name = className;
  applyFilter();
}
async function changePage(page) {
  clearSelection();
  await loadStudents(page);
}
async function changeLimit(limit) {
  clearSelection();
  await students.fetchStudents({ ...filters, page: 1, limit });
  if (filters.class_name) {
    await loadStudents();
  }
}
function clearSelection() {
  selectedIds.value = [];
}
function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
    return;
  }
  selectedIds.value = [...selectedIds.value, id];
}
function toggleSelectAll() {
  if (allSelected.value) {
    clearSelection();
    return;
  }
  selectedIds.value = [...new Set([...selectedIds.value, ...visibleIds.value])];
}
async function loadStudents(page = 1) {
  if (filters.class_name) {
    await students.fetchStudents({ ...filters, page: 1, limit: 1 });
    const total = Math.max(students.pagination.total || students.items.length || 1, 1);
    await students.fetchStudents({ ...filters, page: 1, limit: total });
    return;
  }
  await students.fetchStudents({ ...filters, page, limit: students.pagination.limit });
}
function openCreate() {
  selected.value = null;
  error.value = "";
  modalOpen.value = true;
}
function openEdit(student) {
  selected.value = student;
  error.value = "";
  modalOpen.value = true;
}
async function save(payload) {
  saving.value = true;
  error.value = "";
  try {
    await students.saveStudent(payload, selected.value?.id);
    modalOpen.value = false;
    clearSelection();
    toast.success("Data siswa berhasil disimpan.");
  } catch (err) {
    error.value = apiMessage(err, "Gagal menyimpan siswa");
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
}
async function remove(student) {
  const confirmed = await swalConfirm({
    title: "Hapus siswa?",
    text: `Data ${student.name} akan dihapus permanen dari daftar siswa.`,
    confirmButtonText: "Hapus",
    icon: "warning",
    danger: true,
  });
  if (!confirmed) return;
  try {
    await students.deleteStudent(student.id);
    clearSelection();
    toast.success("Siswa berhasil dihapus.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menghapus siswa"));
  }
}
function openInvite(student) {
  window.open(`/invite/${student.invitation_code}`, "_blank");
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
async function sendSelectedWhatsapp() {
  const ids = selectedVisibleIds.value;
  if (!ids.length) {
    toast.warning("Pilih minimal satu siswa terlebih dahulu.");
    return;
  }
  const confirmed = await swalConfirm({
    title: "Kirim WhatsApp terpilih?",
    text: `Link WhatsApp akan dibuat untuk ${ids.length} siswa.`,
    confirmButtonText: "Kirim",
    icon: "question",
  });
  if (!confirmed) return;
  try {
    const query = encodeURIComponent(ids.join(","));
    window.open(`/admin/students/whatsapp-bulk?ids=${query}`, "_blank", "noopener,noreferrer");
    toast.success(`Halaman link WhatsApp dibuka untuk ${ids.length} siswa.`);
    clearSelection();
  } catch (err) {
    toast.error(apiMessage(err, "Gagal membuat link WhatsApp"));
  }
}
async function sendSelectedEmail() {
  const ids = selectedVisibleIds.value;
  if (!ids.length) {
    toast.warning("Pilih minimal satu siswa terlebih dahulu.");
    return;
  }
  const confirmed = await swalConfirm({
    title: "Kirim email terpilih?",
    text: `Email undangan akan diproses untuk ${ids.length} siswa.`,
    confirmButtonText: "Kirim",
    icon: "question",
  });
  if (!confirmed) return;
  try {
    const results = await students.emailLinks(ids);
    const sent = results.filter((item) => item?.sent).length;
    const alreadySent = results.filter((item) => item?.already_sent).length;
    const withoutEmail = results.filter((item) => !item?.sent && !item?.already_sent).length;
    if (sent > 0) {
      toast.success(`Email undangan diproses untuk ${sent} siswa.`);
    }
    if (alreadySent > 0) {
      toast.warning(`${alreadySent} siswa dilewati karena email sudah pernah dikirim.`);
    }
    if (withoutEmail > 0) {
      toast.warning(`${withoutEmail} siswa dilewati karena email belum tersedia.`);
    }
    await students.fetchStudents({ ...filters, page: students.pagination.page, limit: students.pagination.limit });
    clearSelection();
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mengirim email"));
  }
}
async function syncEmailHistory() {
  emailSyncing.value = true;
  try {
    const data = await students.syncEmailHistory(90);
    toast.success(`History Brevo disinkronkan: ${data.synced || 0} event, ${data.matched || 0} cocok dengan siswa.`);
  } catch (err) {
    toast.error(apiMessage(err, "Gagal sync history Brevo"));
  } finally {
    emailSyncing.value = false;
  }
}
async function regenerate() {
  const confirmed = await swalConfirm({
    title: "Regenerate nomor bangku?",
    text: "Semua nomor siswa dan pendamping akan disusun ulang berdasarkan kelas, jurusan, lalu nama.",
    confirmButtonText: "Regenerate",
    icon: "question",
  });
  if (!confirmed) return;
  try {
    await students.regenerateSeats();
    clearSelection();
    toast.success("Nomor bangku berhasil disusun ulang.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal regenerate nomor bangku"));
  }
}
async function exportXLSX() {
  try {
    const response = await studentService.exportData();
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-siswa-per-kelas.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export XLSX berhasil diunduh.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal export data siswa"));
  }
}
onMounted(() => loadStudents(students.pagination.page));
</script>

<style scoped>
.class-filter-row {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.class-filter-chip {
  flex: 0 0 auto;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 0.55rem 0.85rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.class-filter-chip:hover {
  border-color: #c7d2fe;
  color: #4f46e5;
}

.class-filter-chip.active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4338ca;
  box-shadow: 0 8px 18px -14px rgba(79, 70, 229, 0.65);
}

.dark .class-filter-chip {
  border-color: #334155;
  background: #0f172a;
  color: #94a3b8;
}

.dark .class-filter-chip.active {
  border-color: #6366f1;
  background: rgba(79, 70, 229, 0.16);
  color: #c7d2fe;
}
</style>
