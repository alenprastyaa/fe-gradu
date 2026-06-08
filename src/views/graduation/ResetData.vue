<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div>
      <p class="page-eyebrow">Maintenance</p>
      <h1 class="page-title">Reset Data</h1>
      <p class="page-subtitle">Hapus data aplikasi dan mulai dari nol. Admin login tetap dipertahankan.</p>
    </div>

    <section class="card border-rose-200/70 p-5 dark:border-rose-500/20">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-2xl space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <Icon icon="ph:warning-circle-bold" />
            Aksi permanen
          </div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Reset semua data aplikasi</h2>
          <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Aksi ini menghapus data siswa, seating, nomor bangku, absensi, WhatsApp terkirim, email terkirim, template undangan, dan setting acara.
            Setelah reset, sistem akan kembali ke kondisi awal dengan template default.
          </p>
          <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li class="flex items-start gap-2">
              <Icon icon="ph:dot-bold" class="mt-0.5 text-lg text-rose-500" />
              Data admin tetap dipertahankan agar kamu tetap bisa login.
            </li>
            <li class="flex items-start gap-2">
              <Icon icon="ph:dot-bold" class="mt-0.5 text-lg text-rose-500" />
              Setelah reset, setting default dan template default akan dibuat ulang otomatis.
            </li>
            <li class="flex items-start gap-2">
              <Icon icon="ph:dot-bold" class="mt-0.5 text-lg text-rose-500" />
              Pastikan backup database sudah ada jika ada data yang ingin disimpan.
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">Saran</p>
          <p class="mt-2 text-sm text-rose-900 dark:text-rose-100">
            Gunakan menu ini hanya saat ingin mengulang setup dari awal.
          </p>
          <button
            type="button"
            class="btn-primary mt-4 !bg-rose-600 hover:!bg-rose-700"
            :disabled="resetting"
            @click="resetDatabase"
          >
            <Icon v-if="resetting" icon="ph:spinner-bold" class="animate-spin" />
            <Icon v-else icon="ph:trash-bold" />
            {{ resetting ? "Mereset..." : "Reset Semua Data" }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useToastStore } from "@/store/toast";
import { apiMessage } from "@/services/api";
import { swalConfirm } from "@/helper/swal";
import { studentService } from "@/services/studentService";

const toast = useToastStore();
const resetting = ref(false);

async function resetDatabase() {
  const firstConfirm = await swalConfirm({
    title: "Reset semua data?",
    text: "Semua data aplikasi akan dihapus dan dibuat ulang dari default.",
    confirmButtonText: "Lanjutkan",
    icon: "warning",
    danger: true,
  });
  if (!firstConfirm) return;

  const secondConfirm = await swalConfirm({
    title: "Yakin reset seluruh database?",
    text: "Aksi ini permanen dan tidak bisa dibatalkan.",
    confirmButtonText: "Ya, reset semua",
    icon: "warning",
    danger: true,
  });
  if (!secondConfirm) return;

  resetting.value = true;
  try {
    const { data } = await studentService.resetAll();
    toast.success(`Reset selesai. ${data.data?.deleted || 0} baris data terdampak.`);
  } catch (error) {
    toast.error(apiMessage(error, "Gagal reset database"));
  } finally {
    resetting.value = false;
  }
}
</script>
