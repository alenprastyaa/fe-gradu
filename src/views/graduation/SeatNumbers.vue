<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">Penomoran</p>
        <h1 class="page-title">Nomor Bangku</h1>
        <p class="page-subtitle">Setiap siswa mendapat 2 nomor: satu untuk siswa dan satu untuk pendamping.</p>
      </div>
      <button class="btn-primary" @click="regenerate">
        <Icon icon="ph:arrows-clockwise-bold" /> Regenerate Nomor
      </button>
    </div>

    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-4">
        <div class="relative md:col-span-1">
          <Icon icon="ph:magnifying-glass-bold" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" class="input pl-9" placeholder="Cari nama / nomor" @input="applyFilter" />
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
          <option value="hadir">Sudah Absen</option>
          <option value="belum_hadir">Belum Absen</option>
        </select>
      </div>
    </section>

    <section class="seat-map-shell">
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 px-4 py-4 dark:border-slate-700/70 sm:px-5">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Seat Map</p>
          <h2 class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Layout Nomor Bangku</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ seatMapItems.length * 2 }} nomor bangku dari {{ seatMapItems.length }} siswa.
            {{ seatColorMode === "attendance" ? "Hijau sudah absen, abu-abu belum absen." : "Warna dibedakan berdasarkan kelas." }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div class="seat-mode-control" title="Mode warna denah">
            <button type="button" :class="{ active: seatColorMode === 'attendance' }" @click="setSeatColorMode('attendance')">
              <Icon icon="ph:check-circle-bold" />
              Absensi
            </button>
            <button type="button" :class="{ active: seatColorMode === 'class' }" @click="setSeatColorMode('class')">
              <Icon icon="ph:paint-brush-bold" />
              Kelas
            </button>
          </div>
          <label class="seat-column-control">
            <Icon icon="ph:grid-four-bold" />
            <span>Kolom</span>
            <input
              v-model="seatColumnsInput"
              type="number"
              min="4"
              max="40"
              step="1"
              @blur="saveSeatColumns"
              @keydown.enter.prevent="saveSeatColumns"
            />
          </label>
          <button class="btn-secondary !px-3 !py-2 text-xs" :disabled="!canEditLayout" @click="addRowBelow">
            <Icon icon="ph:rows-plus-bottom-bold" /> Tambah Baris
          </button>
          <button class="btn-secondary !px-3 !py-2 text-xs" :disabled="!canEditLayout" @click="resetLayout">
            <Icon icon="ph:arrow-counter-clockwise-bold" /> Reset Layout
          </button>
          <span v-if="seatColorMode === 'attendance'" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            Sudah Absen
          </span>
          <span v-if="seatColorMode === 'attendance'" class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600">
            <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
            Belum Absen
          </span>
          <template v-if="seatColorMode === 'class'">
            <button
              v-for="item in classLegend"
              :key="item.groupName"
              type="button"
              class="class-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ring-1"
              :class="{
                'is-draggable': canEditLayout,
                'is-drop-target': classDragTarget === item.groupName,
                'is-dragging': draggingClassName === item.groupName,
              }"
              :style="{ backgroundColor: item.color.soft, color: item.color.text, borderColor: item.color.border, '--tw-ring-color': item.color.border }"
              :draggable="canEditLayout"
              :title="canEditLayout ? `Drag ${item.groupName} untuk pindah urutan jurusan` : item.groupName"
              @dragstart="onClassDragStart(item.groupName)"
              @dragover.prevent="onClassDragOver(item.groupName)"
              @drop.prevent="onClassDrop(item.groupName)"
              @dragend="onClassDragEnd"
            >
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color.solid }"></span>
              <span>{{ item.groupName }}</span>
              <span v-if="item.classes.length" class="class-chip-legend">
                <span
                  v-for="classItem in item.classes"
                  :key="`${item.groupName}-${classItem.className}`"
                  class="class-chip-legend-dot"
                  :style="{ backgroundColor: classItem.color.solid }"
                  :title="classItem.className"
                ></span>
              </span>
            </button>
          </template>
          <span v-if="!canEditLayout" class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
            <Icon icon="ph:lock-bold" />
            Layout edit aktif saat filter kosong
          </span>
        </div>
      </div>

      <div class="border-b border-slate-200/70 px-4 py-4 dark:border-slate-700/70 sm:px-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Urutan Rombongan</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Drag chip jurusan ke posisi yang diinginkan. Siswa dalam jurusan yang sama akan dijaga tetap satu kelompok.
            </p>
          </div>
          <span
            class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20"
          >
            <Icon icon="ph:hand-grabbing-bold" />
            Geser chip untuk atur urutan jurusan
          </span>
        </div>
        <p v-if="!canEditLayout" class="mt-2 text-xs font-medium text-amber-600 dark:text-amber-300">
          Pengaturan urutan jurusan aktif saat filter kelas, jurusan, pencarian, dan status absensi kosong.
        </p>
      </div>

      <div class="seat-stage-wrap px-4 pt-4 sm:px-5">
        <div class="seat-stage">
          <Icon icon="ph:graduation-cap-bold" />
          PANGGUNG WISUDA
        </div>
      </div>

      <div v-if="seatRows.length" class="overflow-x-auto px-3 py-4 sm:px-5">
        <div class="seat-map-board" :style="seatBoardStyle">
          <div v-for="(row, rowIndex) in seatRows" :key="rowIndex" class="seat-row">
            <span class="seat-row-label">{{ String(rowIndex + 1).padStart(2, "0") }}</span>
            <template v-for="(seat, seatIndex) in row" :key="seat?.key || `${rowIndex}-${seatIndex}`">
              <span v-if="seatIndex === leftSeatColumns" class="seat-aisle" aria-hidden="true"></span>
              <div
                class="seat-slot"
                :class="{ 'is-drop-target': dropTarget?.row === rowIndex && dropTarget?.col === seatIndex }"
                @dragover.prevent="onSeatDragOver(rowIndex, seatIndex)"
                @drop.prevent="onSeatDrop(rowIndex, seatIndex)"
              >
                <button
                  v-if="seat"
                  type="button"
                  class="seat-tile"
                  :class="seatTileClass(seat)"
                  :style="seatTileStyle(seat)"
                  :title="`${seat.number} - ${seat.name}`"
                  :draggable="canEditLayout"
                  @dragstart="onSeatDragStart(rowIndex, seatIndex)"
                  @dragend="onSeatDragEnd"
                >
                  <span class="seat-number">{{ seat.number }}</span>
                </button>
                <span v-else class="seat-tile seat-tile-placeholder"></span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="px-4 py-12 text-center sm:px-5">
        <Icon icon="ph:armchair" class="mx-auto mb-2 text-4xl text-slate-300" />
        <p class="text-sm text-slate-400">Belum ada nomor bangku pada filter ini.</p>
      </div>
    </section>

    <div class="table-wrap">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
        <thead class="bg-slate-50/80 dark:bg-slate-800/60">
          <tr>
            <th class="th">Siswa</th>
            <th class="th">Kelas / Jurusan</th>
            <th class="th">Nomor Siswa</th>
            <th class="th">Nomor Pendamping</th>
            <th class="th">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr v-for="student in students.items" :key="student.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
            <td class="td font-semibold text-slate-900 dark:text-slate-100">{{ student.name }}</td>
            <td class="td">
              <span class="text-slate-900 dark:text-slate-200">{{ student.class_name }}</span>
              <span class="block text-xs text-slate-400">{{ student.major }}</span>
            </td>
            <td class="td font-semibold text-slate-900 dark:text-white">{{ student.student_seat_number || "-" }}</td>
            <td class="td font-semibold text-slate-900 dark:text-white">{{ student.companion_seat_number || "-" }}</td>
            <td class="td">
              <div class="flex flex-col gap-2">
                <span :class="student.attendance_status === 'hadir' ? 'badge-success' : 'badge-warning'">
                  <Icon :icon="student.attendance_status === 'hadir' ? 'ph:check-circle-fill' : 'ph:clock-fill'" />
                  {{ student.attendance_status === "hadir" ? "Sudah Absen" : "Belum Absen" }}
                </span>
                <div class="flex flex-wrap items-center gap-2">
                  <select
                    v-model="attendanceDrafts[student.id]"
                    class="input !h-8 !w-auto !rounded-lg !py-1 !text-xs"
                    :disabled="attendanceSavingId === student.id"
                  >
                    <option value="hadir">Sudah Absen</option>
                    <option value="belum_hadir">Belum Absen</option>
                  </select>
                  <button
                    class="btn-secondary !h-8 !px-3 !py-1 text-xs"
                    :disabled="attendanceSavingId === student.id || attendanceDrafts[student.id] === student.attendance_status"
                    @click="saveAttendanceStatus(student)"
                  >
                    {{ attendanceSavingId === student.id ? "Menyimpan..." : "Simpan" }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="students.items.length === 0">
            <td class="px-5 py-14 text-center" colspan="5">
              <Icon icon="ph:armchair" class="mx-auto mb-2 text-4xl text-slate-300" />
              <p class="text-sm text-slate-400">Belum ada data siswa.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <StudentPagination :pagination="students.pagination" :limit-options="[20, 50, 100]" @page-change="changePage" @limit-change="changeLimit" />
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import StudentPagination from "@/components/graduation/StudentPagination.vue";
import { useStudentsStore } from "@/store/students";
import { useToastStore } from "@/store/toast";
import { apiMessage } from "@/services/api";
import { swalConfirm } from "@/helper/swal";
import { eventSettingsService } from "@/services/eventSettingsService";
import { studentService } from "@/services/studentService";

const students = useStudentsStore();
const toast = useToastStore();
const filters = reactive({ search: "", class_name: "", major: "", attendance_status: "" });
const seatMapItems = ref([]);
const seatColumns = ref(20);
const seatColumnsInput = ref("20");
const seatColorMode = ref("attendance");
const leftSeatColumns = computed(() => Math.floor(seatColumns.value / 2));
const seatBoardStyle = computed(() => ({
  "--seat-cols": seatColumns.value,
  "--left-seat-cols": leftSeatColumns.value,
  "--right-seat-cols": seatColumns.value - leftSeatColumns.value,
}));
const classPalette = [
  { soft: "#dbeafe", solid: "#2563eb", border: "#93c5fd", text: "#1e40af" },
  { soft: "#fef3c7", solid: "#d97706", border: "#fcd34d", text: "#92400e" },
  { soft: "#fce7f3", solid: "#db2777", border: "#f9a8d4", text: "#9d174d" },
  { soft: "#ede9fe", solid: "#7c3aed", border: "#c4b5fd", text: "#5b21b6" },
  { soft: "#ccfbf1", solid: "#0f766e", border: "#5eead4", text: "#115e59" },
  { soft: "#ffedd5", solid: "#ea580c", border: "#fdba74", text: "#9a3412" },
  { soft: "#e0e7ff", solid: "#4f46e5", border: "#a5b4fc", text: "#3730a3" },
  { soft: "#dcfce7", solid: "#16a34a", border: "#86efac", text: "#166534" },
  { soft: "#fee2e2", solid: "#dc2626", border: "#fca5a5", text: "#991b1b" },
  { soft: "#e2e8f0", solid: "#475569", border: "#cbd5e1", text: "#334155" },
];
const hasAnyFilter = computed(() => Object.values(filters).some((value) => String(value || "").trim() !== ""));
const canEditLayout = computed(() => !hasAnyFilter.value);
const seatTileMap = computed(() => buildSeatTileMap(seatMapItems.value));
const seatLayout = ref([]);
const hasCustomSeatLayout = ref(false);
const draggingSeat = ref(null);
const dropTarget = ref(null);
const draggingClassName = ref("");
const classDragTarget = ref("");
const attendanceDrafts = reactive({});
const attendanceSavingId = ref("");
const classColorMap = computed(() => {
  const classNames = [...new Set(
    seatMapItems.value
      .map((student) => String(student.class_name || "").trim())
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b));
  return new Map(classNames.map((className, index) => [className, classPalette[index % classPalette.length]]));
});

function clampSeatColumns(value) {
  return Math.min(40, Math.max(4, Number(value) || 20));
}

async function loadSeatMapSettings() {
  try {
    const { data } = await eventSettingsService.get();
    applySeatMapPayload(data.data);
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mengambil setting denah bangku"));
  }
}

async function saveSeatColumns() {
  const rawValue = String(seatColumnsInput.value || "").trim();
  if (rawValue === "") {
    seatColumnsInput.value = String(seatColumns.value);
    return;
  }
  const previousColumns = seatColumns.value;
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const previousCustomLayout = hasCustomSeatLayout.value;
  seatColumns.value = clampSeatColumns(rawValue);
  seatColumnsInput.value = String(seatColumns.value);
  try {
    if (hasCustomSeatLayout.value) {
      seatLayout.value = reflowSeatLayout(seatLayout.value, seatColumns.value);
    }
    const { data } = await eventSettingsService.updateSeatMap({
      seat_map_columns: seatColumns.value,
      seat_map_color_mode: seatColorMode.value,
      seat_map_layout: hasCustomSeatLayout.value ? JSON.stringify(seatLayout.value) : "",
    });
    applySeatMapPayload(data.data);
    toast.success("Setting kolom denah berhasil disimpan.");
  } catch (err) {
    seatColumns.value = previousColumns;
    seatColumnsInput.value = String(previousColumns);
    seatLayout.value = previousCustomLayout ? previousLayout : seatLayout.value;
    seatColumnsInput.value = String(seatColumns.value);
    toast.error(apiMessage(err, "Gagal menyimpan setting denah bangku"));
  }
}

async function setSeatColorMode(mode) {
  const nextMode = normalizeSeatColorMode(mode);
  if (seatColorMode.value === nextMode) return;
  const previousMode = seatColorMode.value;
  seatColorMode.value = nextMode;
  try {
    const { data } = await eventSettingsService.updateSeatMap({
      seat_map_columns: seatColumns.value,
      seat_map_color_mode: seatColorMode.value,
      seat_map_layout: hasCustomSeatLayout.value ? JSON.stringify(seatLayout.value) : "",
    });
    applySeatMapPayload(data.data);
    toast.success(seatColorMode.value === "class" ? "Mode warna kelas aktif." : "Mode warna absensi aktif.");
  } catch (err) {
    seatColorMode.value = previousMode;
    toast.error(apiMessage(err, "Gagal menyimpan mode warna denah"));
  }
}

function normalizeSeatColorMode(mode) {
  return mode === "class" ? "class" : "attendance";
}

function colorForClass(className) {
  const key = String(className || "Tanpa Kelas");
  const assignedColor = classColorMap.value.get(key);
  if (assignedColor) return assignedColor;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash + key.charCodeAt(index) * (index + 1)) % 9973;
  }
  return classPalette[hash % classPalette.length];
}

function seatTileClass(seat) {
  if (seatColorMode.value === "class") return "seat-tile-class";
  return seat.attended ? "seat-tile-attended" : "seat-tile-empty";
}

function seatTileStyle(seat) {
  if (seatColorMode.value !== "class") return {};
  const color = colorForClass(seat.className);
  return {
    background: `linear-gradient(180deg, ${color.solid}, ${color.text})`,
    borderColor: color.border,
    color: "#ffffff",
  };
}

const seatRows = computed(() => {
  const defaultLayout = createDefaultSeatLayout(seatTileMap.value, seatColumns.value);
  const layout = hasCustomSeatLayout.value ? seatLayout.value : defaultLayout;
  return layout.map((row) =>
    row.map((key) => {
      if (!key) return null;
      return seatTileMap.value.get(key) || null;
    }),
  );
});
const activeSeatLayout = computed(() => {
  const defaultLayout = createDefaultSeatLayout(seatTileMap.value, seatColumns.value);
  return hasCustomSeatLayout.value ? seatLayout.value : defaultLayout;
});
const classGroups = computed(() => {
  const allGroups = [...new Set(seatMapItems.value.map((student) => studentGroupName(student)))].sort((a, b) => a.localeCompare(b));
  const { groupedClasses } = groupSeatPairsByClass(activeSeatLayout.value);
  if (groupedClasses.length) {
    const layoutGroups = groupedClasses.map((group) => group.className);
    return [...layoutGroups, ...allGroups.filter((groupName) => !layoutGroups.includes(groupName))];
  }
  return allGroups;
});
const classLegend = computed(() =>
  classGroups.value.map((groupName) => {
    const classes = [...new Set(
      seatMapItems.value
        .filter((student) => studentGroupName(student) === groupName)
        .map((student) => String(student.class_name || "").trim())
        .filter(Boolean),
    )]
      .sort((a, b) => a.localeCompare(b))
      .map((className) => ({ className, color: colorForClass(className) }));

    return {
      groupName,
      color: colorForClass(groupName),
      classes,
    };
  }),
);

async function fetchSeatMap() {
  try {
    const { data } = await studentService.seatMap(filters);
    seatMapItems.value = data.data?.items || [];
  } catch (err) {
    toast.error(apiMessage(err, "Gagal mengambil denah bangku"));
  }
}

async function applyFilter() {
  await Promise.all([
    students.fetchStudents({ ...filters, page: 1, limit: students.pagination.limit }),
    fetchSeatMap(),
  ]);
}
watch(
  () => students.items,
  (items) => {
    for (const student of items || []) {
      attendanceDrafts[student.id] = student.attendance_status || "belum_hadir";
    }
  },
  { immediate: true, deep: true },
);

function changePage(page) {
  students.fetchStudents({ ...filters, page, limit: students.pagination.limit });
}
function changeLimit(limit) {
  students.fetchStudents({ ...filters, page: 1, limit });
}
async function regenerate() {
  const confirmed = await swalConfirm({
    title: "Regenerate nomor bangku?",
    text: "Nomor siswa dan pendamping akan disusun ulang dari awal.",
    confirmButtonText: "Regenerate",
    icon: "question",
  });
  if (!confirmed) return;
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const previousCustomLayout = hasCustomSeatLayout.value;
  try {
    if (canEditLayout.value && seatMapItems.value.length) {
      ensureEditableLayout();
      const nextLayout = createGroupedSeatLayout(seatLayout.value, classGroups.value);
      seatLayout.value = nextLayout;
      const saved = await persistSeatLayout(nextLayout);
      if (!saved) {
        seatLayout.value = previousLayout;
        hasCustomSeatLayout.value = previousCustomLayout;
        return;
      }
    }
    await students.regenerateSeats();
    await Promise.all([
      students.fetchStudents({ ...filters, page: 1, limit: students.pagination.limit }),
      fetchSeatMap(),
    ]);
    toast.success("Nomor bangku berhasil disusun ulang.");
  } catch (err) {
    toast.error(apiMessage(err, "Gagal regenerate nomor bangku"));
  }
}

async function saveAttendanceStatus(student) {
  const nextStatus = attendanceDrafts[student.id] || student.attendance_status || "belum_hadir";
  if (nextStatus === student.attendance_status) return;
  const previousStatus = student.attendance_status;
  attendanceSavingId.value = student.id;
  try {
    const { data } = await studentService.updateAttendanceStatus(student.id, { attendance_status: nextStatus });
    const updated = data.data || {};
    student.attendance_status = updated.attendance_status || nextStatus;
    student.attendance_time = updated.attendance_time || null;
    attendanceDrafts[student.id] = student.attendance_status;
    await Promise.all([
      students.fetchStudents({ ...filters, page: students.pagination.page, limit: students.pagination.limit }),
      fetchSeatMap(),
    ]);
    toast.success("Status absensi berhasil diperbarui.");
  } catch (err) {
    attendanceDrafts[student.id] = previousStatus;
    toast.error(apiMessage(err, "Gagal menyimpan status absensi"));
  } finally {
    attendanceSavingId.value = "";
  }
}

function buildSeatTileMap(items) {
  const map = new Map();
  for (const student of items || []) {
    const attended = student.attendance_status === "hadir";
    const pairId = String(student.id);
    const base = {
      name: student.name,
      className: student.class_name || "Tanpa Kelas",
      groupName: student.major || "Tanpa Jurusan",
      attended,
      pairId,
    };
    map.set(`${pairId}-student`, {
      ...base,
      key: `${pairId}-student`,
      number: student.student_seat_number || "-",
      role: "Siswa",
    });
    map.set(`${pairId}-companion`, {
      ...base,
      key: `${pairId}-companion`,
      number: student.companion_seat_number || "-",
      role: "Pendamping",
    });
  }
  return map;
}

function createDefaultSeatLayout(itemsMap, columns) {
  const keys = Array.from(itemsMap.keys());
  if (!keys.length) return [];
  const leftColumns = Math.floor(columns / 2);
  const rightColumns = columns - leftColumns;
  const rowCount = Math.ceil(keys.length / columns);
  const leftCapacity = rowCount * leftColumns;
  const leftKeys = keys.slice(0, leftCapacity);
  const rightKeys = keys.slice(leftCapacity);
  const rows = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const left = leftKeys.slice(rowIndex * leftColumns, rowIndex * leftColumns + leftColumns);
    const right = rightKeys.slice(rowIndex * rightColumns, rowIndex * rightColumns + rightColumns);
    while (left.length < leftColumns) left.push(null);
    while (right.length < rightColumns) right.push(null);
    rows.push([...left, ...right]);
  }
  return rows;
}

function parseSeatLayout(layout) {
  if (Array.isArray(layout)) return layout;
  if (typeof layout !== "string" || !layout.trim()) return [];
  try {
    const parsed = JSON.parse(layout);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isSeatKey(value) {
  return typeof value === "string" && value.trim() !== "";
}

function getPairIdFromSeatKey(key) {
  if (!isSeatKey(key)) return "";
  return key.replace(/-(student|companion)$/, "");
}

function flattenSeatLayout(layout) {
  return (Array.isArray(layout) ? layout : []).flatMap((row) => {
    if (!Array.isArray(row)) {
      return Array(seatColumns.value).fill(null);
    }
    const next = row.slice(0, seatColumns.value);
    while (next.length < seatColumns.value) next.push(null);
    return next;
  });
}

function flattenSeatLayoutBySection(layout) {
  const rows = Array.isArray(layout) ? layout : [];
  if (!rows.length) return [];

  const normalizedRows = rows.map((row) => {
    if (!Array.isArray(row)) {
      return Array(seatColumns.value).fill(null);
    }
    const next = row.slice(0, seatColumns.value);
    while (next.length < seatColumns.value) next.push(null);
    return next;
  });

  const leftColumns = leftSeatColumns.value;
  const rightColumns = seatColumns.value - leftColumns;
  const ordered = [];

  for (let rowIndex = 0; rowIndex < normalizedRows.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < leftColumns; columnIndex += 1) {
      ordered.push(normalizedRows[rowIndex][columnIndex] || null);
    }
  }

  for (let rowIndex = 0; rowIndex < normalizedRows.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < rightColumns; columnIndex += 1) {
      ordered.push(normalizedRows[rowIndex][leftColumns + columnIndex] || null);
    }
  }

  return ordered;
}

function chunkSeatLayout(linear) {
  const rows = [];
  const source = Array.isArray(linear) ? linear : [];
  for (let index = 0; index < source.length; index += seatColumns.value) {
    const row = source.slice(index, index + seatColumns.value);
    while (row.length < seatColumns.value) row.push(null);
    rows.push(row);
  }
  return rows;
}

function createSeatLayoutFromOrderedKeys(keys, columns, extraEmptyRows = 0) {
  const leftColumns = Math.floor(columns / 2);
  const rightColumns = columns - leftColumns;
  const sourceKeys = Array.isArray(keys) ? keys.filter((key) => isSeatKey(key)) : [];
  if (!sourceKeys.length) {
    return Array.from({ length: extraEmptyRows }, () => Array(columns).fill(null));
  }

  const rowCount = Math.ceil(sourceKeys.length / columns);
  const rows = Array.from({ length: rowCount }, () => Array(columns).fill(null));
  const leftCapacity = rowCount * leftColumns;
  const leftKeys = sourceKeys.slice(0, leftCapacity);
  const rightKeys = sourceKeys.slice(leftCapacity);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const leftRow = leftKeys.slice(rowIndex * leftColumns, (rowIndex + 1) * leftColumns);
    const rightRow = rightKeys.slice(rowIndex * rightColumns, (rowIndex + 1) * rightColumns);
    leftRow.forEach((key, columnIndex) => {
      rows[rowIndex][columnIndex] = key;
    });
    rightRow.forEach((key, columnIndex) => {
      rows[rowIndex][leftColumns + columnIndex] = key;
    });
  }

  for (let index = 0; index < extraEmptyRows; index += 1) {
    rows.push(Array(columns).fill(null));
  }

  return rows;
}

function normalizeSeatKey(key) {
  return typeof key === "string" ? key.trim() : "";
}

function studentGroupName(student) {
  return String(student?.major || "").trim() || "Tanpa Jurusan";
}

function buildGroupSeatKeyMap() {
  const grouped = new Map();

  for (const student of seatMapItems.value || []) {
    const groupName = studentGroupName(student);
    if (!grouped.has(groupName)) {
      grouped.set(groupName, []);
    }
    grouped.get(groupName).push(student);
  }

  for (const [groupName, students] of grouped.entries()) {
    students.sort((a, b) => {
      const classDiff = String(a.class_name || "Tanpa Kelas").localeCompare(String(b.class_name || "Tanpa Kelas"), "id", {
        numeric: true,
        sensitivity: "base",
      });
      if (classDiff !== 0) return classDiff;
      const nameDiff = String(a.name || "").trim().localeCompare(String(b.name || "").trim(), "id", { sensitivity: "base" });
      if (nameDiff !== 0) return nameDiff;
      return String(a.id).localeCompare(String(b.id));
    });

    const keys = [];
    for (const student of students) {
      const pairId = String(student.id);
      keys.push(`${pairId}-student`, `${pairId}-companion`);
    }
    grouped.set(groupName, keys);
  }

  return grouped;
}

function buildOrderedSeatPairs(layout) {
  const linear = flattenSeatLayoutBySection(layout);
  const orderedPairs = [];
  const pairMap = new Map();

  for (const entry of linear) {
    const key = normalizeSeatKey(entry);
    if (!key) continue;
    const pairId = getPairIdFromSeatKey(key);
    if (!pairId) continue;
    if (!pairMap.has(pairId)) {
      const tile = seatTileMap.value.get(key) || seatTileMap.value.get(`${pairId}-student`) || seatTileMap.value.get(`${pairId}-companion`);
      const pair = {
        pairId,
        className: tile?.groupName || "Tanpa Jurusan",
        keys: [],
      };
      pairMap.set(pairId, pair);
      orderedPairs.push(pair);
    }
    const pair = pairMap.get(pairId);
    if (!pair.keys.includes(key)) {
      pair.keys.push(key);
    }
  }

  for (const pair of orderedPairs) {
    const canonicalKeys = [`${pair.pairId}-student`, `${pair.pairId}-companion`];
    const nextKeys = [];
    for (const key of canonicalKeys) {
      if (seatTileMap.value.has(key)) {
        nextKeys.push(key);
      }
    }
    pair.keys = nextKeys.length ? nextKeys : pair.keys;
  }

  return { orderedPairs, emptySlotCount: linear.filter((entry) => !normalizeSeatKey(entry)).length };
}

function groupSeatPairsByClass(layout) {
  const { orderedPairs, emptySlotCount } = buildOrderedSeatPairs(layout);
  const groupedClasses = [];
  const classIndexMap = new Map();

  for (const pair of orderedPairs) {
    if (!classIndexMap.has(pair.className)) {
      classIndexMap.set(pair.className, groupedClasses.length);
      groupedClasses.push({ className: pair.className, pairs: [] });
    }
    groupedClasses[classIndexMap.get(pair.className)].pairs.push(pair);
  }

  return { groupedClasses, classIndexMap, emptySlotCount, orderedPairs };
}

function createGroupedSeatLayout(layout, groupOrder) {
  const groupSeatKeyMap = buildGroupSeatKeyMap();
  const orderedKeys = groupOrder.flatMap((groupName) => groupSeatKeyMap.get(groupName) || []);
  const emptySlotCount = flattenSeatLayout(layout).filter((entry) => !normalizeSeatKey(entry)).length;
  const extraEmptyRows = Math.floor(emptySlotCount / seatColumns.value);
  return createSeatLayoutFromOrderedKeys(orderedKeys, seatColumns.value, extraEmptyRows);
}

function reorderClassBlocksInLayout(layout, sourceClass, targetClass) {
  const currentGroups = [...classGroups.value];
  if (!currentGroups.length) {
    return { layout, changed: false, reason: "Belum ada pasangan bangku pada layout." };
  }

  const sourceIndex = currentGroups.indexOf(sourceClass);
  const targetIndex = currentGroups.indexOf(targetClass);
  if (sourceIndex === -1 || targetIndex === -1) {
    return { layout, changed: false, reason: "Rombongan kelas tidak ditemukan pada layout saat ini." };
  }
  if (sourceClass === targetClass) {
    return { layout, changed: false, reason: "" };
  }

  const nextGroups = [...currentGroups];
  [nextGroups[sourceIndex], nextGroups[targetIndex]] = [nextGroups[targetIndex], nextGroups[sourceIndex]];

  return {
    layout: createGroupedSeatLayout(layout, nextGroups),
    changed: true,
    reason: "",
  };
}

function moveSeatPair(layout, pairId, targetIndex) {
  const studentKey = `${pairId}-student`;
  const companionKey = `${pairId}-companion`;
  const linear = flattenSeatLayout(layout);
  const sourceIndexes = [linear.indexOf(studentKey), linear.indexOf(companionKey)].filter((index) => index !== -1).sort((a, b) => a - b);
  if (sourceIndexes.length === 0) return layout;

  const firstSource = sourceIndexes[0];
  const lastSource = sourceIndexes[sourceIndexes.length - 1];
  if (targetIndex >= firstSource && targetIndex <= lastSource + 1) {
    return layout;
  }

  const removalSet = new Set(sourceIndexes);
  const remaining = linear.filter((_, index) => !removalSet.has(index));
  const removedBeforeTarget = sourceIndexes.filter((index) => index < targetIndex).length;
  const insertionIndex = Math.max(0, Math.min(remaining.length, targetIndex - removedBeforeTarget));
  remaining.splice(insertionIndex, 0, studentKey, companionKey);
  return chunkSeatLayout(remaining);
}

function reflowSeatLayout(layout, columns) {
  const rows = Array.isArray(layout) ? layout : [];
  if (!rows.length) return [];

  const keys = [];
  const seen = new Set();
  let trailingEmptyRows = 0;

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = Array.isArray(rows[index]) ? rows[index] : [];
    if (row.some((value) => isSeatKey(value))) break;
    trailingEmptyRows += 1;
  }

  for (const row of rows) {
    for (const value of Array.isArray(row) ? row : []) {
      if (!isSeatKey(value)) continue;
      const key = value.trim();
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  }

  if (keys.length === 0) {
    return Array.from({ length: rows.length }, () => Array(columns).fill(null));
  }

  const next = [];
  for (let index = 0; index < keys.length; index += columns) {
    const row = keys.slice(index, index + columns);
    while (row.length < columns) row.push(null);
    next.push(row);
  }
  for (let index = 0; index < trailingEmptyRows; index += 1) {
    next.push(Array(columns).fill(null));
  }
  return next;
}

function applySeatMapPayload(payload) {
  seatColumns.value = clampSeatColumns(payload?.seat_map_columns);
  seatColumnsInput.value = String(seatColumns.value);
  seatColorMode.value = normalizeSeatColorMode(payload?.seat_map_color_mode);
  const parsedLayout = reflowSeatLayout(parseSeatLayout(payload?.seat_map_layout), seatColumns.value);
  hasCustomSeatLayout.value = parsedLayout.length > 0;
  seatLayout.value = hasCustomSeatLayout.value ? parsedLayout : [];
}

function ensureEditableLayout() {
  if (hasCustomSeatLayout.value) return;
  seatLayout.value = createDefaultSeatLayout(seatTileMap.value, seatColumns.value);
  hasCustomSeatLayout.value = true;
}

function onClassDragStart(className) {
  if (!canEditLayout.value) return;
  ensureEditableLayout();
  draggingClassName.value = className;
  classDragTarget.value = className;
}

function onClassDragOver(className) {
  if (!canEditLayout.value || !draggingClassName.value) return;
  classDragTarget.value = className;
}

async function onClassDrop(className) {
  if (!canEditLayout.value || !draggingClassName.value) return;
  ensureEditableLayout();
  const sourceClass = draggingClassName.value;
  if (sourceClass === className) {
    onClassDragEnd();
    return;
  }
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const { layout: nextLayout, changed, reason } = reorderClassBlocksInLayout(seatLayout.value, sourceClass, className);
  if (!changed) {
    if (reason) {
      toast.error(reason);
    }
    onClassDragEnd();
    return;
  }
  seatLayout.value = nextLayout;
  const saved = await persistSeatLayout(nextLayout, `Urutan rombongan ${sourceClass} berhasil dipindahkan.`);
  if (!saved) {
    seatLayout.value = previousLayout;
  }
  onClassDragEnd();
}

function onClassDragEnd() {
  draggingClassName.value = "";
  classDragTarget.value = "";
}

function cloneSeatLayout(layout) {
  return layout.map((row) => (Array.isArray(row) ? [...row] : Array(seatColumns.value).fill(null)));
}

async function persistSeatLayout(nextLayout, successMessage) {
  try {
    const { data } = await eventSettingsService.updateSeatMap({
      seat_map_columns: seatColumns.value,
      seat_map_color_mode: seatColorMode.value,
      seat_map_layout: hasCustomSeatLayout.value ? JSON.stringify(nextLayout) : "",
    });
    applySeatMapPayload(data.data);
    if (successMessage) {
      toast.success(successMessage);
    }
    return true;
  } catch (err) {
    toast.error(apiMessage(err, "Gagal menyimpan layout denah bangku"));
    return false;
  }
}

async function onSeatDragStart(rowIndex, seatIndex) {
  if (!canEditLayout.value) return;
  ensureEditableLayout();
  const seatKey = seatLayout.value[rowIndex]?.[seatIndex];
  if (!seatKey) return;
  const pairId = getPairIdFromSeatKey(seatKey);
  if (!pairId) return;
  draggingSeat.value = { pairId };
  dropTarget.value = { row: rowIndex, col: seatIndex };
}

function onSeatDragOver(rowIndex, seatIndex) {
  if (!canEditLayout.value || !draggingSeat.value) return;
  dropTarget.value = { row: rowIndex, col: seatIndex };
}

async function onSeatDrop(rowIndex, seatIndex) {
  if (!canEditLayout.value || !draggingSeat.value) return;
  ensureEditableLayout();
  const targetIndex = rowIndex * seatColumns.value + seatIndex;
  const targetKey = seatLayout.value[rowIndex]?.[seatIndex];
  if (targetKey && getPairIdFromSeatKey(targetKey) === draggingSeat.value.pairId) {
    draggingSeat.value = null;
    dropTarget.value = null;
    return;
  }
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const nextLayout = moveSeatPair(seatLayout.value, draggingSeat.value.pairId, targetIndex);
  seatLayout.value = nextLayout;
  const saved = await persistSeatLayout(nextLayout, "Layout bangku berhasil dipindahkan.");
  if (!saved) {
    seatLayout.value = previousLayout;
  }
  draggingSeat.value = null;
  dropTarget.value = null;
}

function onSeatDragEnd() {
  draggingSeat.value = null;
  dropTarget.value = null;
}

async function addRowBelow() {
  if (!canEditLayout.value) return;
  ensureEditableLayout();
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const nextLayout = cloneSeatLayout(seatLayout.value);
  nextLayout.push(Array(seatColumns.value).fill(null));
  seatLayout.value = nextLayout;
  const saved = await persistSeatLayout(nextLayout, "Baris bangku baru ditambahkan.");
  if (!saved) {
    seatLayout.value = previousLayout;
  }
}

async function resetLayout() {
  if (!canEditLayout.value) return;
  const confirmed = await swalConfirm({
    title: "Reset layout bangku?",
    text: "Layout kustom akan dihapus dan bangku kembali ke susunan otomatis.",
    confirmButtonText: "Reset",
    icon: "warning",
  });
  if (!confirmed) return;
  const previousLayout = cloneSeatLayout(seatLayout.value);
  const previousCustomLayout = hasCustomSeatLayout.value;
  seatLayout.value = [];
  hasCustomSeatLayout.value = false;
  const saved = await persistSeatLayout([], "Layout bangku berhasil direset.");
  if (!saved) {
    seatLayout.value = previousLayout;
    hasCustomSeatLayout.value = previousCustomLayout;
  }
}

onMounted(() => {
  loadSeatMapSettings();
  students.fetchStudents({ ...filters, page: 1, limit: 20 });
  fetchSeatMap();
});
</script>

<style scoped>
.seat-map-shell {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.85);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 18px 45px -28px rgba(15, 23, 42, 0.35);
}
.dark .seat-map-shell {
  border-color: rgba(51, 65, 85, 0.7);
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
}
:deep(.table-wrap .th) {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
  font-size: 0.68rem;
}
:deep(.table-wrap .td) {
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
  font-size: 0.82rem;
}
:deep(.table-wrap .badge) {
  padding: 0.3rem 0.55rem;
  font-size: 0.68rem;
}
:deep(.table-wrap td:nth-child(3)),
:deep(.table-wrap td:nth-child(4)) {
  font-size: 0.82rem !important;
}
.seat-stage-wrap {
  display: flex;
  justify-content: center;
}
.seat-stage {
  display: inline-flex;
  min-width: min(100%, 480px);
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #111827, #334155);
  padding: 0.55rem 1rem;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  box-shadow: 0 16px 34px -24px rgba(15, 23, 42, 0.9);
}
.seat-column-control {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 0.3rem 0.45rem 0.3rem 0.75rem;
  color: #475569;
  box-shadow: 0 6px 18px -16px rgba(15, 23, 42, 0.35);
}
.dark .seat-column-control {
  border-color: #334155;
  background: #0f172a;
  color: #cbd5e1;
}
.seat-column-control input {
  width: 4rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 0 0.65rem;
  text-align: center;
  color: #0f172a;
  font-weight: 800;
  outline: none;
}
.dark .seat-column-control input {
  border-color: #475569;
  background: #1e293b;
  color: #f8fafc;
}
.seat-mode-control {
  display: inline-flex;
  gap: 0.2rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.25rem;
}
.dark .seat-mode-control {
  border-color: #334155;
  background: #0f172a;
}
.seat-mode-control button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0.45rem 0.7rem;
  color: #64748b;
  font-weight: 800;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.seat-mode-control button.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.55);
}
.class-chip {
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.class-chip.is-draggable {
  cursor: grab;
}
.class-chip.is-draggable:active {
  cursor: grabbing;
}
.class-chip.is-draggable:hover {
  transform: translateY(-1px);
}
.class-chip.is-dragging {
  opacity: 0.6;
  transform: scale(0.98);
}
.class-chip.is-drop-target {
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 10px 24px -18px rgba(15, 23, 42, 0.75);
}
.class-chip-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  margin-left: 0.15rem;
}
.class-chip-legend-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}
.dark .seat-mode-control button {
  color: #94a3b8;
}
.dark .seat-mode-control button.active {
  background: #1e293b;
  color: #a5b4fc;
}
.seat-map-board {
  --seat-size: 2.15rem;
  --seat-gap: 0.28rem;
  --aisle-size: 1.8rem;
  min-width: max(100%, calc(1.8rem + (var(--seat-cols) * var(--seat-size)) + (var(--seat-cols) * var(--seat-gap)) + var(--aisle-size) + 1.5rem));
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 0.75rem;
}
.dark .seat-map-board {
  border-color: rgba(51, 65, 85, 0.75);
  background: rgba(15, 23, 42, 0.72);
}
.seat-row {
  display: grid;
  grid-template-columns: 1.8rem repeat(var(--left-seat-cols), var(--seat-size)) var(--aisle-size) repeat(var(--right-seat-cols), var(--seat-size));
  align-items: center;
  gap: var(--seat-gap);
  justify-content: center;
}
.seat-row + .seat-row {
  margin-top: 0.28rem;
}
.seat-row-label {
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 800;
  text-align: center;
}
.seat-aisle {
  align-self: stretch;
  display: block;
  min-height: 1.85rem;
  border-radius: 9999px;
  border: 1px dashed #cbd5e1;
  background:
    linear-gradient(180deg, transparent 0, transparent 45%, rgba(148, 163, 184, 0.5) 45%, rgba(148, 163, 184, 0.5) 55%, transparent 55%, transparent 100%);
}
.dark .seat-aisle {
  border-color: #475569;
  background:
    linear-gradient(180deg, transparent 0, transparent 45%, rgba(100, 116, 139, 0.65) 45%, rgba(100, 116, 139, 0.65) 55%, transparent 55%, transparent 100%);
}
.seat-slot {
  position: relative;
  display: flex;
  min-height: 1.85rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  border: 1px dashed transparent;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}
.seat-slot.is-drop-target {
  border-color: #38bdf8;
  background-color: rgba(56, 189, 248, 0.12);
}
.seat-tile[draggable="true"] {
  cursor: grab;
}
.seat-tile[draggable="true"]:active {
  cursor: grabbing;
}
.seat-tile {
  width: var(--seat-size);
  height: 1.85rem;
  min-height: 1.85rem;
  border-radius: 0.42rem;
  border: 1px solid transparent;
  padding: 0;
  text-align: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.seat-tile:not(.seat-tile-placeholder):hover {
  transform: translateY(-2px);
}
.seat-tile-attended {
  border-color: #047857;
  background: linear-gradient(180deg, #059669, #047857);
  color: #ffffff;
  box-shadow: 0 8px 14px -12px rgba(4, 120, 87, 0.9);
}
.seat-tile-class {
  box-shadow: 0 8px 14px -12px rgba(15, 23, 42, 0.75);
}
.seat-tile-empty {
  border-color: #dbe3ed;
  background: linear-gradient(180deg, #f8fafc, #e5e7eb);
  color: #334155;
}
.dark .seat-tile-empty {
  border-color: #475569;
  background: linear-gradient(180deg, #334155, #1e293b);
  color: #cbd5e1;
}
.seat-tile-placeholder {
  visibility: hidden;
}
.seat-number {
  display: block;
  font-size: 0.58rem;
  font-weight: 900;
  line-height: 1;
}
@media (max-width: 640px) {
  .seat-map-board {
    --seat-size: 2rem;
    --seat-gap: 0.22rem;
    padding: 0.6rem;
  }
  .seat-tile {
    height: 1.75rem;
    min-height: 1.75rem;
  }
}
</style>
