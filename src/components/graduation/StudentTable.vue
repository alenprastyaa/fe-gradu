<template>
  <div class="table-wrap">
    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
      <thead class="bg-slate-50/80 dark:bg-slate-800/60">
        <tr>
          <th v-if="showSelection" class="th w-12">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              :checked="allSelected"
              :indeterminate.prop="someSelected && !allSelected"
              @change="$emit('toggle-select-all')"
            />
          </th>
          <th class="th">Siswa</th>
          <th class="th">Kelas / Jurusan</th>
          <th class="th">Nomor Siswa / Pendamping</th>
          <th class="th">Kontak</th>
          <th class="th">Status</th>
          <th class="th">Waktu Hadir</th>
          <th class="th text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
        <tr v-for="student in students" :key="student.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
          <td v-if="showSelection" class="td align-middle">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              :checked="isSelected(student.id)"
              @change="$emit('toggle-select', student.id)"
            />
          </td>
          <td class="td">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                {{ initials(student.name) }}
              </span>
              <span class="font-medium text-slate-900 dark:text-slate-100">{{ student.name }}</span>
            </div>
          </td>
          <td class="td">
            <span class="text-slate-900 dark:text-slate-200">{{ student.class_name }}</span>
            <span class="block text-xs text-slate-400">{{ student.major }}</span>
          </td>
          <td class="td">
            <div class="flex flex-wrap gap-1.5">
              <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                Siswa {{ student.student_seat_number || "-" }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                Pendamping {{ student.companion_seat_number || "-" }}
              </span>
            </div>
          </td>
          <td class="td">
            <span class="block text-slate-700 dark:text-slate-300">{{ student.whatsapp_number }}</span>
            <span v-if="student.email" class="block text-xs text-slate-400">{{ student.email }}</span>
            <span v-else class="block text-xs italic text-slate-300 dark:text-slate-600">tanpa email</span>
            <span
              v-if="student.email_sent_at"
              class="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
            >
              <Icon icon="ph:check-circle-fill" />
              Email terkirim
            </span>
          </td>
          <td class="td">
            <span :class="student.attendance_status === 'hadir' ? 'badge-success' : 'badge-warning'">
              <Icon :icon="student.attendance_status === 'hadir' ? 'ph:check-circle-fill' : 'ph:clock-fill'" />
              {{ student.attendance_status === "hadir" ? "Hadir" : "Belum Hadir" }}
            </span>
          </td>
          <td class="td text-slate-500">{{ formatDate(student.attendance_time) }}</td>
          <td class="td">
            <div class="flex justify-end gap-1.5">
              <button class="icon-btn" title="Buka undangan" @click="$emit('invite', student)"><Icon icon="ph:arrow-square-out-bold" /></button>
              <button class="icon-btn hover:!border-emerald-300 hover:!bg-emerald-50 hover:!text-emerald-600" title="Kirim WhatsApp" @click="$emit('whatsapp', student)"><Icon icon="ph:whatsapp-logo-bold" /></button>
              <button class="icon-btn" :title="student.email_sent_at ? 'Email undangan sudah dikirim' : 'Kirim Email'" :disabled="!student.email || !!student.email_sent_at" @click="$emit('email', student)"><Icon icon="ph:envelope-bold" /></button>
              <button class="icon-btn hover:!border-primary-300 hover:!bg-primary-50 hover:!text-primary-600" title="Edit" @click="$emit('edit', student)"><Icon icon="ph:pencil-simple-bold" /></button>
              <button class="icon-btn hover:!border-rose-300 hover:!bg-rose-50 hover:!text-rose-600" title="Hapus" @click="$emit('delete', student)"><Icon icon="ph:trash-bold" /></button>
            </div>
          </td>
        </tr>
        <tr v-if="students.length === 0">
          <td class="px-5 py-14 text-center" :colspan="showSelection ? 8 : 7">
            <Icon icon="ph:users-three" class="mx-auto mb-2 text-4xl text-slate-300" />
            <p class="text-sm text-slate-400">Belum ada data siswa.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  students: { type: Array, default: () => [] },
  showSelection: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },
  someSelected: { type: Boolean, default: false },
});
defineEmits(["edit", "delete", "invite", "whatsapp", "email", "toggle-select", "toggle-select-all"]);

function isSelected(id) {
  return Array.isArray(props.selectedIds) && props.selectedIds.includes(id);
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
</script>
