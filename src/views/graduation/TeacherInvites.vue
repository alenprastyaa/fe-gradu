<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Manajemen</p>
        <h1 class="page-title">Undangan Guru</h1>
        <p class="page-subtitle">Kelola undangan guru tanpa nomor bangku, tetap dengan QR untuk absensi.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary" :disabled="templateLoading" @click="downloadTemplate">
          <Icon v-if="templateLoading" icon="ph:spinner-bold" class="animate-spin" />
          <Icon v-else icon="ph:file-xls-bold" />
          Template XLSX
        </button>
        <label class="btn-secondary cursor-pointer">
          <Icon icon="ph:upload-simple-bold" /> Import XLSX
          <input type="file" accept=".xlsx" class="hidden" @change="importFile" />
        </label>
        <button class="btn-primary" @click="openCreate">
          <Icon icon="ph:plus-bold" /> Tambah Guru
        </button>
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
              <th class="th">Nama</th>
              <th class="th">Jabatan</th>
              <th class="th">Kontak</th>
              <th class="th">Status</th>
              <th class="th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
              <td class="td font-semibold text-slate-900 dark:text-slate-100">{{ item.name }}</td>
              <td class="td">{{ item.position || "Guru" }}</td>
              <td class="td">
                <div class="space-y-1">
                  <p>{{ item.whatsapp_number || "-" }}</p>
                  <p class="text-xs text-slate-400">{{ item.email || "-" }}</p>
                </div>
              </td>
              <td class="td">
                <span :class="item.attendance_status === 'hadir' ? 'badge-success' : 'badge-warning'">
                  <Icon :icon="item.attendance_status === 'hadir' ? 'ph:check-circle-fill' : 'ph:clock-fill'" />
                  {{ item.attendance_status === "hadir" ? "Sudah Absen" : "Belum Absen" }}
                </span>
              </td>
              <td class="td">
                <div class="flex justify-end gap-2">
                  <button class="btn-secondary !h-9 !px-3 !py-1 text-xs" :disabled="!item.whatsapp_number" @click="openWhatsapp(item)">
                    <Icon icon="ph:whatsapp-logo-bold" /> WhatsApp
                  </button>
                  <button class="btn-secondary !h-9 !px-3 !py-1 text-xs" @click="openInvite(item)">
                    <Icon icon="ph:link-bold" /> Undangan
                  </button>
                  <button class="btn-secondary !h-9 !px-3 !py-1 text-xs" @click="openEdit(item)">
                    <Icon icon="ph:pencil-bold" /> Edit
                  </button>
                  <button class="btn-secondary !h-9 !px-3 !py-1 text-xs !text-rose-600" @click="remove(item)">
                    <Icon icon="ph:trash-bold" /> Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td class="px-5 py-14 text-center" colspan="5">
                <Icon icon="ph:chalkboard-teacher" class="mx-auto mb-2 text-4xl text-slate-300" />
                <p class="text-sm text-slate-400">Belum ada undangan guru.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <StudentPagination :pagination="pagination" :limit-options="[10, 25, 50, 100]" @page-change="changePage" @limit-change="changeLimit" />

    <transition name="fade">
      <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" @click.self="modalOpen = false">
        <div class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <p class="page-eyebrow">Form</p>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{{ selected ? "Edit Guru" : "Tambah Guru" }}</h2>
            </div>
            <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" @click="modalOpen = false">
              <Icon icon="ph:x-bold" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="save">
            <label class="block">
              <span class="label">Nama</span>
              <input v-model="form.name" class="input" required />
            </label>
            <label class="block">
              <span class="label">Jabatan</span>
              <input v-model="form.position" class="input" placeholder="Guru / Wali Kelas / Kepala Sekolah" />
            </label>
            <label class="block">
              <span class="label">WhatsApp</span>
              <input v-model="form.whatsapp_number" class="input" />
            </label>
            <label class="block">
              <span class="label">Email</span>
              <input v-model="form.email" type="email" class="input" />
            </label>

            <p v-if="error" class="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              {{ error }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="btn-secondary" @click="modalOpen = false">Batal</button>
              <button class="btn-primary" :disabled="saving">
                <Icon v-if="saving" icon="ph:spinner-bold" class="animate-spin" />
                {{ saving ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";
import StudentPagination from "@/components/graduation/StudentPagination.vue";
import { teacherInviteService } from "@/services/teacherInviteService";
import { apiMessage } from "@/services/api";
import { useToastStore } from "@/store/toast";
import { swalConfirm } from "@/helper/swal";

const toast = useToastStore();
const items = ref([]);
const pagination = ref({ page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_previous: false });
const filters = reactive({ search: "", attendance_status: "" });
const modalOpen = ref(false);
const selected = ref(null);
const saving = ref(false);
const error = ref("");
const templateLoading = ref(false);
const form = reactive({ name: "", position: "", whatsapp_number: "", email: "" });

async function fetchItems(page = pagination.value.page, limit = pagination.value.limit) {
  const { data } = await teacherInviteService.list({ ...filters, page, limit });
  items.value = data.data?.items || [];
  pagination.value = data.data?.pagination || pagination.value;
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

function fillForm(item = null) {
  form.name = item?.name || "";
  form.position = item?.position || "";
  form.whatsapp_number = item?.whatsapp_number || "";
  form.email = item?.email || "";
}

function openCreate() {
  selected.value = null;
  error.value = "";
  fillForm();
  modalOpen.value = true;
}

function openEdit(item) {
  selected.value = item;
  error.value = "";
  fillForm(item);
  modalOpen.value = true;
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload = {
      name: form.name,
      position: form.position,
      whatsapp_number: form.whatsapp_number,
      email: form.email || null,
    };
    if (selected.value) {
      await teacherInviteService.update(selected.value.id, payload);
    } else {
      await teacherInviteService.create(payload);
    }
    await fetchItems(selected.value ? pagination.value.page : 1, pagination.value.limit);
    modalOpen.value = false;
    toast.success("Undangan guru berhasil disimpan.");
  } catch (err) {
    error.value = apiMessage(err, "Gagal menyimpan undangan guru");
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
}

async function remove(item) {
  const confirmed = await swalConfirm({
    title: "Hapus undangan guru?",
    text: `Undangan untuk ${item.name} akan dihapus permanen.`,
    confirmButtonText: "Hapus",
    icon: "warning",
    danger: true,
  });
  if (!confirmed) return;
  try {
    await teacherInviteService.remove(item.id);
    await fetchItems(1, pagination.value.limit);
    toast.success("Undangan guru berhasil dihapus.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menghapus undangan guru"));
  }
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
  const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function downloadTemplate() {
  templateLoading.value = true;
  try {
    const response = await teacherInviteService.importTemplate();
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-import-guru.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template XLSX guru berhasil diunduh.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mengunduh template guru"));
  } finally {
    templateLoading.value = false;
  }
}

async function importFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    toast.warning("Gunakan file Excel dengan format .xlsx.");
    event.target.value = "";
    return;
  }
  try {
    const response = await teacherInviteService.import(file);
    await fetchItems(1, pagination.value.limit);
    toast.success(`Import guru berhasil. Total dibuat: ${response.data?.data?.created?.length || 0}`);
  } catch (err) {
    toast.error(apiMessage(err, "Import guru gagal"));
  } finally {
    event.target.value = "";
  }
}

onMounted(() => {
  fetchItems();
});
</script>
