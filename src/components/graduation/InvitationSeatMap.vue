<template>
  <div class="invite-seat-map" :style="themeStyle">
    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Denah Bangku</p>
        <h3 class="mt-1 text-sm font-extrabold text-slate-900">Layout Nomor Bangku</h3>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold">
        <span class="legend-chip bg-emerald-50 text-emerald-700 ring-emerald-200">
          <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
          Sudah Absen
        </span>
        <span class="legend-chip bg-slate-100 text-slate-600 ring-slate-200">
          <span class="h-2 w-2 rounded-full bg-slate-400"></span>
          Belum Absen
        </span>
        <span class="legend-chip text-slate-900 ring-[var(--seat-accent)]" :style="{ backgroundColor: accentSoft }">
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: accent }"></span>
          Bangku Anda
        </span>
      </div>
    </div>

    <div class="seat-stage-wrap px-3 pt-3">
      <div class="seat-stage">
        <Icon icon="ph:graduation-cap-bold" />
        PANGGUNG WISUDA
      </div>
    </div>

    <div class="overflow-x-auto px-2 py-3 sm:px-3">
      <div class="seat-map-board" :style="boardStyle">
        <div v-for="(row, rowIndex) in seatRows" :key="rowIndex" class="seat-row">
          <span class="seat-row-label">{{ String(rowIndex + 1).padStart(2, "0") }}</span>
          <template v-for="(seat, seatIndex) in row" :key="seat?.key || `${rowIndex}-${seatIndex}`">
            <span v-if="seatIndex === leftSeatColumns" class="seat-aisle" aria-hidden="true"></span>
            <span
              v-if="seat"
              class="seat-tile"
              :class="seatTileClass(seat)"
              :title="`${seat.number} - ${seat.name} (${seat.role})`"
            >
              <span class="seat-number">{{ seat.number }}</span>
            </span>
            <span v-else class="seat-tile seat-tile-placeholder"></span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { rgba } from "@/helper/color";

const props = defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Number, default: 20 },
  layout: { type: [Array, String], default: () => [] },
  highlightNumbers: { type: Array, default: () => [] },
  accent: { type: String, default: "#facc15" },
  textColor: { type: String, default: "#0f172a" },
});

const seatColumns = computed(() => Math.min(40, Math.max(4, Number(props.columns) || 20)));
const leftSeatColumns = computed(() => Math.floor(seatColumns.value / 2));
const highlightSet = computed(() => new Set(props.highlightNumbers.map((number) => String(number))));
const accent = computed(() => props.accent || "#facc15");
const accentSoft = computed(() => rgba(accent.value, 0.16));
const themeStyle = computed(() => ({
  "--seat-accent": accent.value,
  "--seat-accent-soft": accentSoft.value,
  "--seat-text": props.textColor,
}));
const boardStyle = computed(() => ({
  "--seat-cols": seatColumns.value,
  "--left-seat-cols": leftSeatColumns.value,
  "--right-seat-cols": seatColumns.value - leftSeatColumns.value,
}));
const seatTileMap = computed(() => buildSeatTileMap(props.items));
const customLayoutRows = computed(() => normalizeLayout(parseLayout(props.layout), seatColumns.value));

function seatTileClass(seat) {
  return {
    "seat-tile-attended": seat.attended && !seat.highlighted,
    "seat-tile-empty": !seat.attended && !seat.highlighted,
    "seat-tile-highlight": seat.highlighted,
  };
}

const seatRows = computed(() => {
  const primaryKeys = Array.from(seatTileMap.value.keys()).filter((key) => isPrimarySeatKey(key));
  if (customLayoutRows.value.length && !isLegacyFullRowLayout(customLayoutRows.value, primaryKeys, seatColumns.value)) {
    return customLayoutRows.value.map((row) => row.map((key) => (key ? seatTileMap.value.get(key) || null : null)));
  }

  const tiles = primaryKeys.map((key) => seatTileMap.value.get(key));
  const rowCount = Math.ceil(tiles.length / seatColumns.value);
  const leftColumns = leftSeatColumns.value;
  const rightColumns = seatColumns.value - leftColumns;
  const leftCapacity = rowCount * leftColumns;
  const leftTiles = tiles.slice(0, leftCapacity);
  const rightTiles = tiles.slice(leftCapacity);
  const rows = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const left = leftTiles.slice(rowIndex * leftColumns, rowIndex * leftColumns + leftColumns);
    const right = rightTiles.slice(rowIndex * rightColumns, rowIndex * rightColumns + rightColumns);
    while (left.length < leftColumns) left.push(null);
    while (right.length < rightColumns) right.push(null);
    rows.push([...left, ...right]);
  }

  return rows;
});

function buildSeatTileMap(items) {
  const map = new Map();
  for (const student of items || []) {
    const attended = student.attendance_status === "hadir";
    const pairId = String(student.id);
    const studentKey = `${pairId}-student`;
    const companionKey = `${pairId}-companion`;
    const studentNumber = String(student.student_seat_number || "-");
    const companionNumber = String(student.companion_seat_number || "-");
    map.set(studentKey, {
      key: studentKey,
      number: studentNumber,
      role: "Siswa",
      name: student.name,
      attended,
      highlighted: highlightSet.value.has(studentNumber),
    });
    map.set(companionKey, {
      key: companionKey,
      number: companionNumber,
      role: "Pendamping",
      name: student.name,
      attended,
      highlighted: highlightSet.value.has(companionNumber),
    });
    map.set(`${pairId}:student`, map.get(studentKey));
    map.set(`${pairId}:companion`, map.get(companionKey));
  }
  return map;
}

function parseLayout(layout) {
  if (Array.isArray(layout)) return layout;
  if (typeof layout !== "string" || !layout.trim()) return [];
  try {
    const parsed = JSON.parse(layout);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLayout(layout, columns) {
  if (!Array.isArray(layout) || !layout.length) return [];
  return layout
    .map((row) => {
      const values = Array.isArray(row) ? row.filter((value) => typeof value === "string" && value.trim()) : [];
      const next = values.slice(0, columns);
      while (next.length < columns) next.push(null);
      return next;
    })
    .filter((row) => row.some((value) => value));
}

function isPrimarySeatKey(key) {
  return /-(student|companion)$/.test(String(key || ""));
}

function createFullRowSeatLayout(keys, columns) {
  const rows = [];
  for (let index = 0; index < keys.length; index += columns) {
    const row = keys.slice(index, index + columns);
    while (row.length < columns) row.push(null);
    rows.push(row);
  }
  return rows;
}

function isLegacyFullRowLayout(layout, keys, columns) {
  if (!Array.isArray(layout) || !layout.length || !keys.length) return false;
  const legacy = createFullRowSeatLayout(keys, columns);
  if (layout.length !== legacy.length) return false;
  return legacy.every((legacyRow, rowIndex) => {
    const row = Array.isArray(layout[rowIndex]) ? layout[rowIndex] : [];
    return legacyRow.every((legacyKey, columnIndex) => (row[columnIndex] || null) === legacyKey);
  });
}
</script>

<style scoped>
.invite-seat-map {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: var(--seat-text);
}
.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0.35rem 0.55rem;
  box-shadow: inset 0 0 0 1px var(--tw-ring-color);
}
.seat-stage-wrap {
  display: flex;
  justify-content: center;
}
.seat-stage {
  display: inline-flex;
  min-width: min(100%, 360px);
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #111827, #334155);
  padding: 0.45rem 0.85rem;
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.18em;
}
.seat-map-board {
  --seat-size: 1.65rem;
  --seat-gap: 0.18rem;
  --aisle-size: 1.15rem;
  min-width: max(100%, calc(1.35rem + (var(--seat-cols) * var(--seat-size)) + (var(--seat-cols) * var(--seat-gap)) + var(--aisle-size) + 1rem));
  border-radius: 0.85rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 0.55rem;
}
.seat-row {
  display: grid;
  grid-template-columns: 1.35rem repeat(var(--left-seat-cols), var(--seat-size)) var(--aisle-size) repeat(var(--right-seat-cols), var(--seat-size));
  align-items: center;
  justify-content: center;
  gap: var(--seat-gap);
}
.seat-row + .seat-row {
  margin-top: var(--seat-gap);
}
.seat-row-label {
  color: #94a3b8;
  font-size: 0.52rem;
  font-weight: 900;
  text-align: center;
}
.seat-aisle {
  align-self: stretch;
  display: block;
  min-height: 1.45rem;
  border-radius: 9999px;
  border: 1px dashed #cbd5e1;
  background:
    linear-gradient(180deg, transparent 0, transparent 45%, rgba(148, 163, 184, 0.45) 45%, rgba(148, 163, 184, 0.45) 55%, transparent 55%, transparent 100%);
}
.seat-tile {
  display: inline-flex;
  width: var(--seat-size);
  height: 1.45rem;
  min-height: 1.45rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.35rem;
  border: 1px solid transparent;
  text-align: center;
}
.seat-tile-attended {
  border-color: #047857;
  background: linear-gradient(180deg, #059669, #047857);
  color: #ffffff;
  box-shadow: 0 8px 14px -13px rgba(15, 23, 42, 0.7);
}
.seat-tile-empty {
  border-color: #dbe3ed;
  background: linear-gradient(180deg, #f8fafc, #e5e7eb);
  color: #334155;
}
.seat-tile-highlight {
  position: relative;
  z-index: 1;
  border-color: var(--seat-accent);
  background: linear-gradient(180deg, var(--seat-accent), #ffffff);
  color: #0f172a;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px var(--seat-accent), 0 12px 20px -16px rgba(15, 23, 42, 0.9);
  transform: scale(1.08);
}
.seat-tile-placeholder {
  visibility: hidden;
}
.seat-number {
  display: block;
  font-size: 0.48rem;
  font-weight: 950;
  line-height: 1;
}
@media (max-width: 640px) {
  .seat-map-board {
    --seat-size: 1.5rem;
    --seat-gap: 0.16rem;
    padding: 0.45rem;
  }
  .seat-tile {
    height: 1.35rem;
    min-height: 1.35rem;
  }
  .seat-number {
    font-size: 0.44rem;
  }
}
</style>
