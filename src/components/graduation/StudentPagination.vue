<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-800">
    <div class="text-sm text-slate-500 dark:text-slate-400">
      <span v-if="pagination.total > 0">
        Menampilkan <strong class="font-semibold text-slate-700 dark:text-slate-200">{{ from }}</strong>-<strong class="font-semibold text-slate-700 dark:text-slate-200">{{ to }}</strong>
        dari <strong class="font-semibold text-slate-700 dark:text-slate-200">{{ pagination.total }}</strong> siswa
      </span>
      <span v-else>Belum ada data siswa</span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        Limit
        <select class="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" :value="pagination.limit" @change="$emit('limit-change', Number($event.target.value))">
          <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <div class="flex items-center gap-1">
        <button class="icon-btn" :disabled="!pagination.has_previous" title="Halaman sebelumnya" @click="$emit('page-change', pagination.page - 1)">
          <Icon icon="ph:caret-left-bold" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition"
          :class="page === pagination.page ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/70'"
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
        <button class="icon-btn" :disabled="!pagination.has_next" title="Halaman berikutnya" @click="$emit('page-change', pagination.page + 1)">
          <Icon icon="ph:caret-right-bold" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_previous: false }),
  },
  limitOptions: { type: Array, default: () => [10, 25, 50, 100] },
});

defineEmits(["page-change", "limit-change"]);

const from = computed(() => {
  if (!props.pagination.total) return 0;
  return (props.pagination.page - 1) * props.pagination.limit + 1;
});

const to = computed(() => Math.min(props.pagination.page * props.pagination.limit, props.pagination.total));

const visiblePages = computed(() => {
  const totalPages = props.pagination.total_pages || 0;
  if (totalPages <= 1) return totalPages === 1 ? [1] : [];
  const current = props.pagination.page || 1;
  const start = Math.max(1, Math.min(current - 1, totalPages - 2));
  const end = Math.min(totalPages, start + 2);
  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
});
</script>
