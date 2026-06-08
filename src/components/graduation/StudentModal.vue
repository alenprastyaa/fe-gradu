<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-700/60">
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center text-slate-400">
                <Icon :icon="student?.id ? 'ph:pencil-simple-bold' : 'ph:user-plus-bold'" class="text-2xl" />
              </span>
              <div>
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ student?.id ? "Edit Siswa" : "Tambah Siswa" }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Nomor bangku, kode undangan, dan QR dibuat otomatis.</p>
              </div>
            </div>
            <button class="icon-btn !border-transparent" @click="$emit('close')">
              <Icon icon="ph:x-bold" />
            </button>
          </div>

          <form class="grid gap-4 p-5 sm:grid-cols-2" @submit.prevent="submit">
            <label class="block">
              <span class="label">Nama Lengkap</span>
              <input v-model="form.name" class="input" placeholder="Andi Saputra" required />
            </label>
            <label class="block">
              <span class="label">Kelas</span>
              <input v-model="form.class_name" class="input" placeholder="12 DKV 1" required />
            </label>
            <label class="block">
              <span class="label">Jurusan</span>
              <input v-model="form.major" class="input" placeholder="DKV" required />
            </label>
            <label class="block">
              <span class="label">Nomor WhatsApp</span>
              <input v-model="form.whatsapp_number" class="input" placeholder="08123456789" required />
            </label>
            <label class="block sm:col-span-2">
              <span class="label">Email <span class="font-normal text-slate-400">(opsional)</span></span>
              <input v-model="form.email" type="email" class="input" placeholder="nama@email.com" />
            </label>

            <p v-if="error" class="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-500/10 dark:text-rose-400">
              <Icon icon="ph:warning-circle-fill" /> {{ error }}
            </p>

            <div class="flex justify-end gap-2 sm:col-span-2">
              <button type="button" class="btn-secondary" @click="$emit('close')">Batal</button>
              <button class="btn-primary" :disabled="loading">
                <Icon v-if="loading" icon="ph:spinner-bold" class="animate-spin" />
                {{ loading ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  open: Boolean,
  student: { type: Object, default: null },
  loading: Boolean,
  error: { type: String, default: "" },
});
const emit = defineEmits(["close", "save"]);
const form = reactive({ name: "", class_name: "", major: "", whatsapp_number: "", email: "" });

watch(
  () => props.student,
  (student) => {
    form.name = student?.name || "";
    form.class_name = student?.class_name || "";
    form.major = student?.major || "";
    form.whatsapp_number = student?.whatsapp_number || "";
    form.email = student?.email || "";
  },
  { immediate: true }
);

function submit() {
  emit("save", { ...form, email: form.email ? form.email : null });
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(12px) scale(0.98);
}
</style>
