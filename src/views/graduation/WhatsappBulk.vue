<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">WhatsApp</p>
        <h1 class="page-title">Link WhatsApp Terpilih</h1>
        <p class="page-subtitle">
          Halaman ini menampilkan satu tab untuk semua siswa terpilih. Buka link yang diperlukan satu per satu dari sini.
        </p>
      </div>
      <button class="btn-secondary" @click="copyAllLinks" :disabled="!links.length">
        <Icon icon="ph:copy-bold" /> Salin Semua Link
      </button>
    </div>

    <section class="card p-4">
      <div v-if="loading" class="py-10 text-center text-slate-500">
        Memuat link WhatsApp...
      </div>

      <div v-else-if="error" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
        {{ error }}
      </div>

      <div v-else>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ links.length }} link tersedia
          </p>
          <button class="btn-secondary" @click="goBack">
            <Icon icon="ph:arrow-left-bold" /> Kembali
          </button>
        </div>

        <div v-if="!links.length" class="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Tidak ada siswa yang dipilih atau semua data tidak valid.
        </div>

        <div v-else class="grid gap-3 lg:grid-cols-2">
          <article
            v-for="item in links"
            :key="item.student_id"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.whatsapp_number }}</p>
              </div>
              <span
                :class="item.whatsapp_sent_at
                  ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
              >
                {{ item.whatsapp_sent_at ? "Sudah dikirim" : "Belum dikirim" }}
              </span>
            </div>
            <p v-if="item.whatsapp_sent_at" class="mt-2 text-xs text-slate-400">
              Terakhir: {{ formatDate(item.whatsapp_sent_at) }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn-primary" @click="sendWhatsapp(item)">
                <Icon icon="ph:whatsapp-logo-bold" /> {{ item.whatsapp_sent_at ? "Kirim Lagi" : "Buka WhatsApp" }}
              </button>
              <button class="btn-secondary" @click="copyLink(item.link)">
                <Icon icon="ph:copy-bold" /> Salin Link
              </button>
              <button
                class="btn-secondary"
                @click="resetStatus(item)"
                :disabled="!item.whatsapp_sent_at"
              >
                <Icon icon="ph:arrow-counter-clockwise-bold" /> Reset Status
              </button>
              <button class="btn-secondary" @click="markSentOnly(item)" :disabled="item.whatsapp_sent_at">
                <Icon icon="ph:check-bold" /> Tandai Terkirim
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useStudentsStore } from "@/store/students";
import { useToastStore } from "@/store/toast";
import { apiMessage } from "@/services/api";
import { swalConfirm } from "@/helper/swal";

const route = useRoute();
const router = useRouter();
const students = useStudentsStore();
const toast = useToastStore();
const loading = ref(false);
const error = ref("");
const links = ref([]);

const ids = computed(() => {
  const raw = String(route.query.ids || "").trim();
  if (!raw) return [];
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    links.value = await students.whatsappLinks(ids.value);
  } catch (err) {
    error.value = apiMessage(err, "Gagal membuat link WhatsApp");
  } finally {
    loading.value = false;
  }
}

async function copyLink(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Link berhasil disalin.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menyalin link"));
  }
}

async function copyAllLinks() {
  if (!links.value.length) return;
  const value = links.value.map((item) => `${item.name}\n${item.link}`).join("\n\n");
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Semua link berhasil disalin.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menyalin semua link"));
  }
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openLink(value) {
  const tab = window.open("", "graduation-whatsapp");
  if (tab) {
    tab.location.href = value;
    tab.focus();
    return;
  }
  window.location.href = value;
}

async function sendWhatsapp(item) {
  const alreadySent = Boolean(item.whatsapp_sent_at);
  if (alreadySent) {
    const confirmed = await swalConfirm({
      title: "Kirim ulang WhatsApp?",
      text: `${item.name} sudah pernah ditandai terkirim. Lanjutkan kirim ulang?`,
      confirmButtonText: "Kirim Lagi",
      icon: "question",
    });
    if (!confirmed) return;
  }

  openLink(item.link);

  try {
    await markLocalSent(item.student_id);
    toast.success(alreadySent ? "WhatsApp dikirim ulang." : "WhatsApp ditandai terkirim.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menandai WhatsApp terkirim"));
  }
}

async function markSentOnly(item) {
  const alreadySent = Boolean(item.whatsapp_sent_at);
  if (alreadySent) {
    const confirmed = await swalConfirm({
      title: "Tandai ulang terkirim?",
      text: `${item.name} sudah berstatus terkirim. Lanjutkan tandai ulang?`,
      confirmButtonText: "Tandai",
      icon: "question",
    });
    if (!confirmed) return;
  }
  try {
    await markLocalSent(item.student_id);
    toast.success(alreadySent ? "Status terkirim diperbarui." : "Status terkirim disimpan.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menandai WhatsApp terkirim"));
  }
}

async function resetStatus(item) {
  if (!item.whatsapp_sent_at) return;
  const confirmed = await swalConfirm({
    title: "Reset status WhatsApp?",
    text: `${item.name} akan kembali menjadi belum dikirim.`,
    confirmButtonText: "Reset",
    icon: "warning",
    danger: true,
  });
  if (!confirmed) return;
  try {
    const updated = await students.resetWhatsappSent(item.student_id);
    replaceItem(updated);
    toast.success("Status WhatsApp berhasil direset.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mereset status WhatsApp"));
  }
}

async function markLocalSent(studentId) {
  const updated = await students.markWhatsappSent(studentId);
  replaceItem(updated);
}

function replaceItem(updated) {
  if (!updated?.student_id) return;
  const index = links.value.findIndex((row) => row.student_id === updated.student_id);
  if (index !== -1) {
    links.value[index] = { ...links.value[index], whatsapp_sent_at: updated.whatsapp_sent_at ?? null };
  }
}

function goBack() {
  router.push("/admin/students");
}

onMounted(load);
</script>
