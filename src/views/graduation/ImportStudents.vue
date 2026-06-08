<template>
  <main class="space-y-5 p-4 sm:p-6">
    <div class="flex items-center gap-3">
      <router-link to="/admin/students" class="icon-btn" title="Kembali">
        <Icon icon="ph:arrow-left-bold" />
      </router-link>
      <div>
        <p class="page-eyebrow">Data Siswa</p>
        <h1 class="page-title">Import Siswa</h1>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Uploader -->
      <section class="card p-6 lg:col-span-2">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold text-slate-900 dark:text-white">Upload File Excel</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Gunakan template XLSX agar nama kolom sesuai format sistem.</p>
          </div>
          <button class="btn-secondary" :disabled="templateLoading" @click="downloadTemplate">
            <Icon v-if="templateLoading" icon="ph:spinner-bold" class="animate-spin" />
            <Icon v-else icon="ph:file-xls-bold" />
            Template XLSX
          </button>
        </div>

        <label
          class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-primary-500/50"
        >
          <span class="flex h-14 w-14 items-center justify-center text-slate-400">
            <Icon icon="ph:cloud-arrow-up-bold" class="text-3xl" />
          </span>
          <span v-if="!file" class="space-y-1">
            <span class="block text-sm font-medium text-slate-700 dark:text-slate-200">Klik untuk memilih file</span>
            <span class="block text-xs text-slate-400">Format import: .xlsx</span>
          </span>
          <span v-else class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-soft dark:bg-slate-800 dark:text-slate-200">
            <Icon icon="ph:file-text-bold" class="text-primary-600" /> {{ file.name }}
          </span>
          <input type="file" accept=".xlsx" class="hidden" @change="chooseFile" />
        </label>

        <button class="btn-primary mt-4 w-full" :disabled="!file || loading" @click="submit">
          <Icon v-if="loading" icon="ph:spinner-bold" class="animate-spin" />
          <Icon v-else icon="ph:upload-simple-bold" />
          {{ loading ? "Mengimport..." : "Submit Import" }}
        </button>

      </section>

      <!-- Format guide -->
      <aside class="card p-5">
        <h3 class="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <Icon icon="ph:info-bold" class="text-primary-600" /> Panduan Kolom
        </h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="col in columns" :key="col.name" class="flex items-start gap-2">
            <Icon :icon="col.required ? 'ph:asterisk-bold' : 'ph:minus-bold'" :class="col.required ? 'mt-0.5 text-rose-500' : 'mt-0.5 text-slate-300'" />
            <span>
              <code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{{ col.name }}</code>
              <span class="ml-1 text-slate-500 dark:text-slate-400">{{ col.desc }}</span>
            </span>
          </li>
        </ul>
        <p class="mt-4 text-xs text-slate-400">
          <Icon icon="ph:asterisk-bold" class="inline text-rose-500" /> wajib diisi. Kolom <code class="text-xs">seat_number</code> dan QR dibuat otomatis.
        </p>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useStudentsStore } from "@/store/students";
import { useToastStore } from "@/store/toast";
import { studentService } from "@/services/studentService";
import { apiMessage } from "@/services/api";
import { swalList } from "@/helper/swal";

const store = useStudentsStore();
const toast = useToastStore();
const file = ref(null);
const loading = ref(false);
const templateLoading = ref(false);

const columns = [
  { name: "name", desc: "Nama lengkap siswa", required: true },
  { name: "class_name", desc: "Kelas, mis. 12 DKV 1", required: true },
  { name: "major", desc: "Jurusan, mis. DKV", required: true },
  { name: "whatsapp_number", desc: "Nomor WhatsApp aktif", required: true },
  { name: "email", desc: "Email (opsional)", required: false },
];

function chooseFile(event) {
  const selected = event.target.files[0];
  if (!selected) return;
  if (!selected.name.toLowerCase().endsWith(".xlsx")) {
    file.value = null;
    event.target.value = "";
    toast.warning("Gunakan file Excel dengan format .xlsx.");
    return;
  }
  file.value = selected;
}

async function downloadTemplate() {
  templateLoading.value = true;
  try {
    const response = await studentService.importTemplate();
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-import-siswa.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template XLSX berhasil diunduh.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal mengunduh template XLSX"));
  } finally {
    templateLoading.value = false;
  }
}

async function submit() {
  loading.value = true;
  try {
    const response = await store.importFile(file.value);
    toast.success(`Import berhasil. Total dibuat: ${response.data?.created?.length || 0}`);
    file.value = null;
  } catch (error) {
    const errors = error.response?.data?.errors?.errors || error.response?.data?.errors || [error.response?.data?.message || "Import gagal"];
    swalList({
      title: "Data import tidak valid",
      message: "Perbaiki baris berikut di file XLSX, lalu upload ulang.",
      items: Array.isArray(errors) ? errors : [errors],
      icon: "error",
    });
    toast.error(apiMessage(error, "Import gagal"));
  } finally {
    loading.value = false;
  }
}
</script>
