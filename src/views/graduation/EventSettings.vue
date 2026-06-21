<template>
  <main class="space-y-5 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="page-eyebrow">CMS Undangan</p>
        <h1 class="page-title">Template Undangan</h1>
        <p class="page-subtitle">Simpan banyak template, pilih yang aktif, dan atur warna tema undangan.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary" @click="newTemplate">
          <Icon icon="ph:plus-bold" /> Template Baru
        </button>
        <button class="btn-primary" :disabled="loading" @click="save">
          <Icon v-if="loading" icon="ph:spinner-bold" class="animate-spin" />
          <Icon v-else icon="ph:floppy-disk-bold" />
          {{ form.id ? "Simpan Perubahan" : "Simpan Template Baru" }}
        </button>
      </div>
    </div>

    <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <button v-for="template in templates" :key="template.id"
        class="rounded-2xl border bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-card dark:bg-slate-800"
        :class="template.id === form.id ? 'border-primary ring-2 ring-primary-100 dark:ring-primary-500/20' : 'border-slate-200 dark:border-slate-700'"
        @click="selectTemplate(template)">
        <div class="mb-4 flex gap-1">
          <span class="h-4 flex-1 rounded-full" :style="{ backgroundColor: template.theme_primary }"></span>
          <span class="h-4 flex-1 rounded-full" :style="{ backgroundColor: template.theme_secondary }"></span>
          <span class="h-4 flex-1 rounded-full" :style="{ backgroundColor: template.theme_accent }"></span>
        </div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ template.template_name }}</p>
            <p class="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{{ template.event_title }}</p>
            <p v-if="template.audio_url" class="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
              <Icon icon="ph:music-notes-bold" /> MP3 aktif
            </p>
          </div>
          <span v-if="template.is_active"
            class="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Aktif</span>
        </div>
        <div class="mt-4 flex gap-2">
          <button class="btn-secondary !px-3 !py-2 text-xs" :disabled="template.is_active"
            @click.stop="activate(template)">Gunakan</button>
          <button class="btn-secondary !px-3 !py-2 text-xs" @click.stop="duplicate(template)">Duplikat</button>
          <button class="btn-secondary !px-3 !py-2 text-xs hover:!border-rose-200 hover:!text-rose-600"
            :disabled="template.is_active" @click.stop="removeTemplate(template)">Hapus</button>
        </div>
      </button>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section class="space-y-5">
        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">Logo Sekolah</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload logo sekolah ke Cloudflare R2 dan pakai di undangan publik.</p>
            </div>
            <input ref="logoInput" type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.svg,image/*" class="hidden" @change="handleLogoUpload" />
            <button type="button" class="btn-secondary" :disabled="logoUploading" @click="logoInput?.click()">
              <Icon v-if="logoUploading" icon="ph:spinner-bold" class="animate-spin" />
              <Icon v-else icon="ph:upload-simple-bold" />
              {{ logoUploading ? "Uploading..." : form.school_logo_url ? "Ganti Logo" : "Upload Logo" }}
            </button>
          </div>

          <div v-if="form.school_logo_url" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
                <img :src="form.school_logo_url" alt="Logo sekolah" class="h-full w-full object-contain" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ form.school_name }}</p>
                <p class="mt-1 break-all font-mono text-[11px] text-slate-400">{{ form.school_logo_url }}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Logo ini akan tampil di cover undangan dan kartu undangan.</p>
              </div>
              <button type="button" class="btn-secondary hover:!border-rose-200 hover:!text-rose-600" @click="removeLogo">
                <Icon icon="ph:trash-bold" /> Hapus
              </button>
            </div>
          </div>
          <div v-else class="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Icon icon="ph:image-square-bold" class="text-xl" />
            Belum ada logo sekolah untuk template ini.
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold text-slate-900 dark:text-white">Identitas Template</h2>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block">
              <span class="label">Nama Template</span>
              <input v-model="form.template_name" class="input" placeholder="Formal Navy Gold" />
            </label>
            <label class="block">
              <span class="label">Judul Acara</span>
              <input v-model="form.event_title" class="input" placeholder="Graduation Ceremony 2026" />
            </label>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold text-slate-900 dark:text-white">Tema Warna</h2>
            <span class="text-xs text-slate-400">Warna ini diterapkan ke halaman undangan publik.</span>
          </div>

          <!-- Presets -->
          <div class="mt-4 flex flex-wrap gap-2">
            <button v-for="preset in colorPresets" :key="preset.name" type="button"
              class="group inline-flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-xs font-medium text-slate-600 transition hover:border-primary-300 hover:bg-primary-50/60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/60"
              @click="applyPreset(preset)">
              <span class="flex">
                <span class="h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-800"
                  :style="{ backgroundColor: preset.theme_primary }"></span>
                <span class="-ml-2 h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-800"
                  :style="{ backgroundColor: preset.theme_accent }"></span>
              </span>
              {{ preset.name }}
            </button>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="color in colorFields" :key="color.key" class="block">
              <span class="label !mb-1 flex items-center justify-between">
                <span>{{ color.label }}</span>
                <span class="text-[11px] font-normal text-slate-400">{{ color.hint }}</span>
              </span>
              <div class="flex gap-2">
                <input v-model="form[color.key]" type="color"
                  class="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" />
                <input v-model="form[color.key]" class="input font-mono text-xs uppercase" />
              </div>
            </label>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold text-slate-900 dark:text-white">Layout &amp; Tampilan</h2>
            <span class="text-xs text-slate-400">Atur gaya & bagian yang tampil di undangan.</span>
          </div>

          <!-- Layout variant -->
          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <button v-for="variant in layoutVariants" :key="variant.value" type="button"
              class="rounded-2xl border p-4 text-left transition" :class="form.layout_variant === variant.value
                ? 'border-primary bg-primary-50/60 ring-2 ring-primary-100 dark:bg-primary-500/10 dark:ring-primary-500/20'
                : 'border-slate-200 hover:border-primary-200 dark:border-slate-700 dark:hover:border-slate-600'"
              @click="form.layout_variant = variant.value">
              <div class="flex items-center justify-between">
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  <Icon :icon="variant.icon" class="text-lg" />
                </span>
                <Icon :icon="form.layout_variant === variant.value ? 'ph:check-circle-fill' : 'ph:circle'"
                  class="text-lg"
                  :class="form.layout_variant === variant.value ? 'text-primary-600' : 'text-slate-300'" />
              </div>
              <p class="mt-3 font-semibold text-slate-900 dark:text-white">{{ variant.label }}</p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ variant.desc }}</p>
            </button>
          </div>

          <!-- Section order (drag & drop) -->
          <div class="mt-5 mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Urutan Bagian</p>
            <span class="flex items-center gap-1 text-[11px] text-slate-400">
              <Icon icon="ph:hand-grabbing-bold" /> seret untuk ubah urutan
            </span>
          </div>
          <draggable
            v-model="sections"
            :item-key="(el) => el"
            handle=".drag-handle"
            :animation="180"
            ghost-class="section-ghost"
            class="space-y-2"
          >
            <template #item="{ element: type, index }">
              <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                <button type="button" class="drag-handle cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-500">
                  <Icon icon="ph:dots-six-vertical-bold" class="text-lg" />
                </button>
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">{{ index + 1 }}</span>
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                  <Icon :icon="sectionMeta[type].icon" />
                </span>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ sectionMeta[type].label }}</span>
                <span v-if="sectionMeta[type].core" class="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-700">Wajib</span>
                <button v-else type="button" class="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Hapus bagian" @click="removeSection(type)">
                  <Icon icon="ph:trash-bold" />
                </button>
              </div>
            </template>
          </draggable>

          <!-- Add section -->
          <div class="mt-4">
            <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Tambah Bagian</p>
            <div v-if="addableSections.length" class="flex flex-wrap gap-2">
              <button
                v-for="type in addableSections"
                :key="type"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-300 hover:bg-primary-50/60 hover:text-primary-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
                @click="addSection(type)"
              >
                <Icon icon="ph:plus-bold" /> <Icon :icon="sectionMeta[type].icon" /> {{ sectionMeta[type].label }}
              </button>
            </div>
            <p v-else class="text-xs text-slate-400">Semua bagian sudah ditampilkan di undangan.</p>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">Susunan Acara</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Susun agenda dalam bentuk tabel. Header kolom dan jumlah baris bisa diubah langsung dari CMS.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-secondary !px-3 !py-2 text-xs" @click="addAgendaColumn">
                <Icon icon="ph:columns-plus-right-bold" /> Tambah Kolom
              </button>
              <button type="button" class="btn-secondary !px-3 !py-2 text-xs" @click="addAgendaRow">
                <Icon icon="ph:rows-plus-bottom-bold" /> Tambah Baris
              </button>
              <button type="button" class="btn-secondary !px-3 !py-2 text-xs" @click="resetAgendaTable">
                <Icon icon="ph:arrow-counter-clockwise-bold" /> Reset Tabel
              </button>
            </div>
          </div>

          <label class="mt-4 block">
            <span class="label">Judul Susunan Acara</span>
            <input v-model="agendaTitle" class="input" placeholder="Susunan Acara" />
          </label>

          <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50/90 dark:bg-slate-800/80">
                <tr>
                  <th v-for="(header, headerIndex) in agendaHeaders" :key="`header-${headerIndex}`" class="px-3 py-3 align-top">
                    <div class="flex items-start gap-2">
                      <input
                        v-model="agendaHeaders[headerIndex]"
                        class="input !h-9 !rounded-lg !py-1.5 text-xs font-semibold"
                        :placeholder="`Header ${headerIndex + 1}`"
                      />
                      <button
                        type="button"
                        class="mt-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                        title="Hapus kolom"
                        :disabled="agendaHeaders.length === 1"
                        @click="removeAgendaColumn(headerIndex)"
                      >
                        <Icon icon="ph:trash-bold" />
                      </button>
                    </div>
                  </th>
                  <th class="w-24 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white dark:divide-slate-700/60 dark:bg-slate-900/40">
                <tr v-for="(row, rowIndex) in agendaRows" :key="`row-${rowIndex}`" class="align-top">
                  <td v-for="(cell, cellIndex) in row" :key="`cell-${rowIndex}-${cellIndex}`" class="px-3 py-3">
                    <input
                      v-model="agendaRows[rowIndex][cellIndex]"
                      class="input !h-9 !rounded-lg !py-1.5 text-sm"
                      :placeholder="`Isi ${cellIndex + 1}`"
                    />
                  </td>
                  <td class="px-3 py-3">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
                      :disabled="agendaRows.length === 1"
                      @click="removeAgendaRow(rowIndex)"
                    >
                      <Icon icon="ph:trash-bold" /> Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Gunakan kolom untuk waktu, kegiatan, keterangan, atau data lain sesuai kebutuhan acara.
          </p>
        </div>

        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">Musik Undangan</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload file MP3 ke Cloudflare R2 dan pakai untuk template ini.</p>
            </div>
            <input ref="audioInput" type="file" accept=".mp3,audio/mpeg" class="hidden" @change="handleAudioUpload" />
            <button type="button" class="btn-secondary" :disabled="audioUploading" @click="audioInput?.click()">
              <Icon v-if="audioUploading" icon="ph:spinner-bold" class="animate-spin" />
              <Icon v-else icon="ph:upload-simple-bold" />
              {{ audioUploading ? "Uploading..." : "Upload MP3" }}
            </button>
          </div>

          <div v-if="form.audio_url" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <label class="block">
                  <span class="label">Judul Musik</span>
                  <input v-model="form.audio_title" class="input" placeholder="Background Music" />
                </label>
                <audio class="mt-3 w-full" :src="form.audio_url" controls preload="metadata"></audio>
                <p class="mt-2 break-all font-mono text-[11px] text-slate-400">{{ form.audio_url }}</p>
              </div>
              <button type="button" class="btn-secondary hover:!border-rose-200 hover:!text-rose-600" @click="removeAudio">
                <Icon icon="ph:trash-bold" /> Hapus
              </button>
            </div>
            <label class="mt-4 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <input v-model="form.audio_autoplay" type="checkbox" class="mt-1 rounded border-slate-300 text-primary focus:ring-primary" />
              <span>
                Autoplay saat undangan dibuka
                <span class="block text-xs text-slate-400">Sebagian browser tetap meminta interaksi user sebelum audio bisa diputar.</span>
              </span>
            </label>
          </div>
          <div v-else class="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Icon icon="ph:music-notes-bold" class="text-xl" />
            Belum ada musik untuk template ini.
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold text-slate-900 dark:text-white">Detail Acara</h2>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block">
              <span class="label">Nama Sekolah</span>
              <input v-model="form.school_name" class="input" placeholder="SMK ..." />
            </label>
            <label class="block">
              <span class="label">Tahun Kelulusan</span>
              <input v-model="form.graduation_year" class="input" placeholder="2026" />
            </label>
            <label class="block">
              <span class="label">Sapaan Penerima</span>
              <input v-model="form.recipient_greeting" class="input" placeholder="Yth. Siswa/i dan Orang Tua/Wali" />
            </label>
            <label class="block">
              <span class="label">Tanggal</span>
              <input v-model="form.event_date" class="input" placeholder="Sabtu, 20 Juni 2026" />
            </label>
            <label class="block">
              <span class="label">Waktu</span>
              <input v-model="form.event_time" class="input" placeholder="08.00 WIB - selesai" />
            </label>
            <div class="block md:col-span-2">
              <span class="label flex items-center gap-1.5">
                <Icon icon="ph:timer-bold" class="text-primary-600" /> Tanggal &amp; Waktu Acara
                <span class="font-normal text-slate-400">(untuk hitung mundur di undangan)</span>
              </span>
              <div
                class="dt-field relative flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/60 dark:focus-within:ring-primary-500/20"
                @click="openDatePicker"
              >
                <Icon icon="ph:calendar-dots-bold" class="shrink-0 text-xl text-primary-600" />
                <input
                  ref="datetimeInput"
                  v-model="form.event_datetime"
                  type="datetime-local"
                  class="dt-input w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                />
                <button
                  v-if="form.event_datetime"
                  type="button"
                  class="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-700"
                  title="Kosongkan"
                  @click.stop="form.event_datetime = ''"
                >
                  <Icon icon="ph:x-bold" />
                </button>
              </div>
              <p v-if="eventDatetimePreview" class="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Icon icon="ph:check-circle-fill" class="text-emerald-500" />
                Hitung mundur menuju: <span class="font-medium text-slate-700 dark:text-slate-200">{{ eventDatetimePreview }}</span>
              </p>
              <p v-else class="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <Icon icon="ph:warning-circle-fill" />
                Belum diisi — hitung mundur tidak akan tampil di undangan.
              </p>
            </div>
            <label class="block">
              <span class="label">Nama Gedung / Venue</span>
              <input v-model="form.venue_name" class="input" placeholder="Aula Utama Sekolah" />
            </label>
            <label class="block">
              <span class="label">Dress Code Siswa</span>
              <input v-model="form.dress_code_student" class="input" placeholder="Seragam sekolah / formal rapi" />
            </label>
            <label class="block">
              <span class="label">Dress Code Orang Tua</span>
              <input v-model="form.dress_code_parent" class="input" placeholder="Batik / formal rapi" />
            </label>
            <div class="block md:col-span-2">
              <span class="label flex items-center gap-1.5">
                <Icon icon="ph:map-pin-bold" class="text-primary-600" /> Pilih Lokasi di Peta
              </span>
              <LocationPicker v-model:address="form.venue_address" v-model:maps-url="form.maps_url" />
            </div>
            <label class="block md:col-span-2">
              <span class="label">Alamat Lengkap <span class="font-normal text-slate-400">(terisi otomatis dari peta,
                  bisa diedit)</span></span>
              <textarea v-model="form.venue_address" class="input min-h-[86px]"
                placeholder="Jl. Pendidikan No. 1"></textarea>
            </label>
            <label class="block md:col-span-2">
              <span class="label">Google Maps URL <span class="font-normal text-slate-400">(terisi otomatis dari
                  peta)</span></span>
              <input v-model="form.maps_url" class="input font-mono text-xs"
                placeholder="https://www.google.com/maps/search/?api=1&query=..." />
            </label>
            <label class="block md:col-span-2">
              <span class="label">Kalimat Pembuka</span>
              <textarea v-model="form.opening_text" class="input min-h-[110px]"></textarea>
            </label>
            <label class="block md:col-span-2">
              <span class="label">Catatan Tambahan</span>
              <textarea v-model="form.additional_note" class="input min-h-[90px]"></textarea>
            </label>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold text-slate-900 dark:text-white">Template WhatsApp</h2>
          <textarea v-model="form.whatsapp_template"
            class="input mt-4 min-h-[320px] font-mono text-xs leading-6"></textarea>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold text-slate-900 dark:text-white">Template Email</h2>
          <label class="mt-4 block">
            <span class="label">Subject</span>
            <input v-model="form.email_subject" class="input" />
          </label>
          <label class="mt-4 block">
            <span class="label">Isi Email</span>
            <textarea v-model="form.email_template" class="input min-h-[300px] font-mono text-xs leading-6"></textarea>
          </label>
        </div>
      </section>

      <aside class="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <section class="card p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-slate-900 dark:text-white">Preview Undangan</h2>
            <span class="badge-success !rounded-md">Live</span>
          </div>

          <!-- Mini replica of the public invitation card -->
          <div class="mt-4 rounded-2xl p-3" :style="{ backgroundColor: form.theme_background }">
            <div class="overflow-hidden rounded-xl ring-1"
              :style="{ backgroundColor: form.theme_surface, color: form.theme_text, '--tw-ring-color': rgba(form.theme_accent, 0.4) }">
              <!-- header -->
              <div class="relative overflow-hidden px-4 py-6 text-center"
                :style="{ background: `linear-gradient(140deg, ${form.theme_primary}, ${form.theme_secondary})` }">
                <span class="absolute -right-4 -top-4 h-16 w-16 rounded-full"
                  :style="{ backgroundColor: rgba(form.theme_accent, 0.18) }"></span>
                <div class="relative">
                  <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border bg-white"
                    :style="{ borderColor: rgba(form.theme_accent, 0.6), color: form.theme_accent }">
                    <img v-if="form.school_logo_url" :src="form.school_logo_url" alt="Logo sekolah" class="h-full w-full object-contain p-1" />
                    <Icon v-else icon="ph:graduation-cap-fill" class="text-base" />
                  </div>
                  <p class="text-[9px] font-semibold uppercase tracking-[0.2em]" :style="{ color: form.theme_accent }">
                    {{ form.school_name }}</p>
                  <p class="mt-1 text-sm font-bold leading-tight text-white">{{ form.event_title }}</p>
                  <span class="mt-2 inline-block rounded-full border px-2 py-0.5 text-[9px] font-semibold"
                    :style="{ borderColor: rgba(form.theme_accent, 0.5), color: form.theme_accent }">
                    Tahun {{ form.graduation_year }}
                  </span>
                </div>
              </div>
              <!-- body -->
              <div class="p-4">
                <p class="text-center text-[9px] font-semibold uppercase tracking-wide"
                  :style="{ color: rgba(form.theme_text, 0.55) }">{{ form.recipient_greeting }}</p>
                <p class="mt-1 text-center text-base font-bold" :style="{ color: form.theme_text }">Nama Siswa</p>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <div class="rounded-lg border p-2 text-center"
                    :style="{ borderColor: rgba(form.theme_accent, 0.3), backgroundColor: rgba(form.theme_accent, 0.1) }">
                    <p class="text-[8px] uppercase tracking-wide" :style="{ color: rgba(form.theme_text, 0.55) }">Siswa</p>
                    <p class="text-lg font-extrabold" :style="{ color: previewHighlight }">001</p>
                  </div>
                  <div class="rounded-lg border p-2 text-center"
                    :style="{ borderColor: rgba(form.theme_accent, 0.3), backgroundColor: rgba(form.theme_accent, 0.1) }">
                    <p class="text-[8px] uppercase tracking-wide" :style="{ color: rgba(form.theme_text, 0.55) }">Pendamping</p>
                    <p class="text-lg font-extrabold" :style="{ color: previewHighlight }">002</p>
                  </div>
                </div>
                <div class="mt-3 rounded-lg px-3 py-2 text-center text-[10px] font-semibold text-white"
                  :style="{ backgroundColor: form.theme_primary }">
                  Buka Google Maps
                </div>
              </div>
            </div>
          </div>
          <router-link to="/admin/students"
            class="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <Icon icon="ph:arrow-square-out-bold" /> Buka undangan asli dari menu Data Siswa
          </router-link>
        </section>

        <section class="card p-5">
          <h2 class="font-semibold text-slate-900 dark:text-white">Placeholder</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Klik untuk copy.</p>
          <div class="mt-4 space-y-2">
            <button v-for="item in placeholders" :key="item"
              class="w-full rounded-lg border border-slate-100 px-3 py-2 text-left font-mono text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/60"
              @click="copy(item)">
              {{ item }}
            </button>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import LocationPicker from "@/components/graduation/LocationPicker.vue";
import { pickHighlight } from "@/helper/color";
import { eventSettingsService } from "@/services/eventSettingsService";
import { useToastStore } from "@/store/toast";
import { apiMessage } from "@/services/api";
import { swalConfirm } from "@/helper/swal";

const toast = useToastStore();
const datetimeInput = ref(null);
const logoInput = ref(null);
const audioInput = ref(null);
const logoUploading = ref(false);
const audioUploading = ref(false);
const defaultAgendaTitle = "Susunan Acara";
const defaultAgendaHeaders = ["Waktu", "Kegiatan"];
const defaultAgendaRows = [
  ["07.00", "Registrasi"],
  ["08.00", "Pembukaan"],
  ["09.00", "Sambutan"],
];
const agendaTitle = ref(defaultAgendaTitle);
const agendaHeaders = ref([...defaultAgendaHeaders]);
const agendaRows = ref(defaultAgendaRows.map((row) => [...row]));

function openDatePicker() {
  const el = datetimeInput.value;
  if (!el) return;
  try {
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  } catch {
    /* picker already open (e.g. clicked the field directly) */
  }
}

const previewHighlight = computed(() => pickHighlight(form.theme_accent, form.theme_surface, form.theme_text));

const eventDatetimePreview = computed(() => {
  if (!form.event_datetime) return "";
  const d = new Date(form.event_datetime);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
const loading = ref(false);
const templates = ref([]);

const defaultForm = {
  id: null,
  template_name: "Formal Navy Gold",
  is_active: false,
  event_title: "Graduation Ceremony 2026",
  school_name: "Nama Sekolah",
  graduation_year: "2026",
  recipient_greeting: "Yth. Siswa/i dan Orang Tua/Wali",
  opening_text: "Dengan hormat, kami mengundang Anda untuk menghadiri acara wisuda sebagai bentuk apresiasi atas pencapaian dan perjalanan pendidikan siswa/i.",
  event_date: "Sabtu, 20 Juni 2026",
  event_time: "08.00 WIB - selesai",
  venue_name: "Aula Utama Sekolah",
  venue_address: "Jl. Pendidikan No. 1",
  maps_url: "",
  dress_code_student: "Seragam sekolah / formal rapi",
  dress_code_parent: "Batik / formal rapi",
  additional_note: "Mohon hadir 30 menit sebelum acara dimulai dan tunjukkan QR Code kepada petugas registrasi.",
  schedule_title: defaultAgendaTitle,
  schedule_headers: JSON.stringify(defaultAgendaHeaders),
  schedule_rows: JSON.stringify(defaultAgendaRows),
  school_logo_url: "",
  school_logo_key: "",
  whatsapp_template: "",
  email_subject: "Undangan Resmi {{event_title}} untuk {{student_name}}",
  email_template: "",
  audio_url: "",
  audio_key: "",
  audio_title: "",
  audio_autoplay: false,
  theme_primary: "#0f172a",
  theme_secondary: "#1e293b",
  theme_accent: "#facc15",
  theme_background: "#020617",
  theme_surface: "#ffffff",
  theme_text: "#0f172a",
  event_datetime: "",
  layout_variant: "classic",
  show_countdown: true,
  show_map: true,
  show_qr: true,
  show_note: true,
  layout_sections: "",
  seat_map_columns: 20,
  seat_map_color_mode: "attendance",
  seat_map_layout: "",
};

const layoutVariants = [
  { value: "classic", label: "Classic", desc: "Header tengah, elegan & formal", icon: "ph:cards-bold" },
  { value: "modern", label: "Modern", desc: "Header rata kiri, aksen tegas", icon: "ph:sidebar-bold" },
  { value: "festive", label: "Festive", desc: "Hitung mundur menonjol di atas", icon: "ph:confetti-bold" },
];

// Invitation building blocks. Core blocks are always present; the rest can be
// added/removed and freely reordered via drag & drop.
const KNOWN_SECTIONS = ["recipient", "countdown", "details", "agenda", "map", "seat", "qr", "note"];
const CORE_SECTIONS = ["recipient", "details", "seat"];
const sectionMeta = {
  recipient: { label: "Penerima & Sambutan", icon: "ph:user-bold", core: true },
  countdown: { label: "Hitung Mundur", icon: "ph:timer-bold" },
  details: { label: "Detail Acara", icon: "ph:calendar-dots-bold", core: true },
  agenda: { label: "Susunan Acara", icon: "ph:list-bullets-bold" },
  map: { label: "Peta Lokasi", icon: "ph:map-trifold-bold" },
  seat: { label: "Nomor Bangku", icon: "ph:armchair-bold", core: true },
  qr: { label: "QR Code", icon: "ph:qr-code-bold" },
  note: { label: "Catatan Kehadiran", icon: "ph:note-bold" },
};

const sections = ref([...KNOWN_SECTIONS]);

const addableSections = computed(() => KNOWN_SECTIONS.filter((type) => !sections.value.includes(type)));

function addSection(type) {
  if (!sections.value.includes(type)) sections.value.push(type);
}
function removeSection(type) {
  if (CORE_SECTIONS.includes(type)) return; // core blocks can't be removed
  sections.value = sections.value.filter((t) => t !== type);
}

// Build the section list from a template: prefer saved layout_sections,
// otherwise derive from the legacy show_* toggles. Core blocks always included.
function sectionsFromTemplate(tpl) {
  let list = null;
  if (tpl.layout_sections) {
    try {
      const parsed = JSON.parse(tpl.layout_sections);
      if (Array.isArray(parsed) && parsed.length) {
        list = parsed.map((s) => (typeof s === "string" ? s : s?.type)).filter((x) => KNOWN_SECTIONS.includes(x));
      }
    } catch {
      list = null;
    }
  }
  if (!list || !list.length) {
    list = KNOWN_SECTIONS.filter((type) => {
      if (type === "countdown") return tpl.show_countdown !== false;
      if (type === "map") return tpl.show_map !== false;
      if (type === "qr") return tpl.show_qr !== false;
      if (type === "note") return tpl.show_note !== false;
      return true;
    });
  }
  if (!list.includes("agenda")) {
    list.splice(Math.min(list.length, 3), 0, "agenda");
  }
  CORE_SECTIONS.forEach((c) => {
    if (!list.includes(c)) list.push(c);
  });
  return [...new Set(list)];
}

function cloneAgendaRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => (Array.isArray(row) ? row.slice() : []));
}

function parseAgendaHeaders(value) {
  let headers = [];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        headers = parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      headers = [];
    }
  }
  if (!headers.length) headers = [...defaultAgendaHeaders];
  return headers;
}

function parseAgendaRows(value, headerCount) {
  let rows = [];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        rows = parsed;
      }
    } catch {
      rows = [];
    }
  }
  if (!rows.length) rows = defaultAgendaRows;
  const width = Math.max(1, Number(headerCount) || defaultAgendaHeaders.length);
  return rows.map((row) => {
    const cells = Array.isArray(row) ? row.map((item) => String(item || "").trim()) : [];
    while (cells.length < width) cells.push("");
    return cells.slice(0, width);
  });
}

function syncAgendaFromForm() {
  agendaTitle.value = String(form.schedule_title || defaultAgendaTitle).trim() || defaultAgendaTitle;
  agendaHeaders.value = parseAgendaHeaders(form.schedule_headers);
  agendaRows.value = parseAgendaRows(form.schedule_rows, agendaHeaders.value.length);
}

function syncAgendaToForm() {
  form.schedule_title = String(agendaTitle.value || "").trim() || defaultAgendaTitle;
  form.schedule_headers = JSON.stringify(agendaHeaders.value.map((header) => String(header || "").trim() || "Kolom"));
  form.schedule_rows = JSON.stringify(agendaRows.value.map((row) => {
    const normalized = Array.isArray(row) ? row.slice(0, agendaHeaders.value.length) : [];
    while (normalized.length < agendaHeaders.value.length) normalized.push("");
    return normalized.map((cell) => String(cell || "").trim());
  }));
}

function addAgendaColumn() {
  agendaHeaders.value.push(`Kolom ${agendaHeaders.value.length + 1}`);
  agendaRows.value = agendaRows.value.map((row) => {
    const next = Array.isArray(row) ? row.slice() : [];
    next.push("");
    return next;
  });
}

function removeAgendaColumn(index) {
  if (agendaHeaders.value.length <= 1) return;
  agendaHeaders.value.splice(index, 1);
  agendaRows.value = agendaRows.value.map((row) => {
    const next = Array.isArray(row) ? row.slice() : [];
    next.splice(index, 1);
    while (next.length < agendaHeaders.value.length) next.push("");
    return next;
  });
}

function addAgendaRow() {
  agendaRows.value.push(Array.from({ length: agendaHeaders.value.length }, () => ""));
}

function removeAgendaRow(index) {
  if (agendaRows.value.length <= 1) return;
  agendaRows.value.splice(index, 1);
}

function resetAgendaTable() {
  agendaTitle.value = defaultAgendaTitle;
  agendaHeaders.value = [...defaultAgendaHeaders];
  agendaRows.value = cloneAgendaRows(defaultAgendaRows);
}

const defaultWhatsapp = `Assalamu'alaikum Wr. Wb.

{{recipient_greeting}},

Dengan hormat, kami mengundang {{student_name}} untuk menghadiri:

*{{event_title}}*
{{school_name}}

Hari/Tanggal: {{event_date}}
Waktu: {{event_time}}
Tempat: {{venue_name}}
Alamat: {{venue_address}}
Dress Code Siswa: {{dress_code_student}}
Dress Code Orang Tua: {{dress_code_parent}}

Data Undangan:
Nama: {{student_name}}
Kelas: {{class_name}}
Jurusan: {{major}}
Nomor Siswa: {{student_seat_number}}
Nomor Pendamping: {{companion_seat_number}}

Undangan digital dan QR Code:
{{invitation_link}}

{{additional_note}}

Wassalamu'alaikum Wr. Wb.`;

const defaultEmail = `{{recipient_greeting}},

Dengan hormat,

Kami mengundang {{student_name}} untuk menghadiri {{event_title}} yang diselenggarakan oleh {{school_name}}.

Undangan digital, QR Code registrasi, detail acara, dan nomor bangku tersedia melalui tautan berikut:
{{invitation_link}}

Ringkasan undangan:
Nama: {{student_name}} - {{class_name}} {{major}}
Nomor Siswa: {{student_seat_number}}
Nomor Pendamping: {{companion_seat_number}}

{{additional_note}}

Hormat kami,
Panitia {{event_title}}`;

const form = reactive({ ...defaultForm, whatsapp_template: defaultWhatsapp, email_template: defaultEmail });

const colorFields = [
  { key: "theme_primary", label: "Primary", hint: "Header & tombol" },
  { key: "theme_secondary", label: "Secondary", hint: "Gradien & ikon" },
  { key: "theme_accent", label: "Accent", hint: "Sorotan & garis" },
  { key: "theme_background", label: "Background", hint: "Latar halaman" },
  { key: "theme_surface", label: "Surface", hint: "Latar kartu" },
  { key: "theme_text", label: "Text", hint: "Warna teks" },
];

const colorPresets = [
  // Light surface (dark text)
  { name: "Navy Gold", theme_primary: "#0f172a", theme_secondary: "#1e293b", theme_accent: "#facc15", theme_background: "#020617", theme_surface: "#ffffff", theme_text: "#0f172a" },
  { name: "Royal Indigo", theme_primary: "#312e81", theme_secondary: "#4338ca", theme_accent: "#a5b4fc", theme_background: "#1e1b4b", theme_surface: "#ffffff", theme_text: "#1e1b4b" },
  { name: "Emerald", theme_primary: "#064e3b", theme_secondary: "#047857", theme_accent: "#34d399", theme_background: "#022c22", theme_surface: "#ffffff", theme_text: "#064e3b" },
  { name: "Maroon Rose", theme_primary: "#881337", theme_secondary: "#be123c", theme_accent: "#fb7185", theme_background: "#4c0519", theme_surface: "#fff1f2", theme_text: "#4c0519" },
  { name: "Sunset", theme_primary: "#7c2d12", theme_secondary: "#ea580c", theme_accent: "#fb923c", theme_background: "#431407", theme_surface: "#fff7ed", theme_text: "#7c2d12" },
  { name: "Ocean", theme_primary: "#0e7490", theme_secondary: "#0891b2", theme_accent: "#22d3ee", theme_background: "#083344", theme_surface: "#ecfeff", theme_text: "#155e75" },
  { name: "Plum", theme_primary: "#6b21a8", theme_secondary: "#9333ea", theme_accent: "#c084fc", theme_background: "#3b0764", theme_surface: "#faf5ff", theme_text: "#581c87" },
  { name: "Rose Blush", theme_primary: "#be185d", theme_secondary: "#db2777", theme_accent: "#f472b6", theme_background: "#500724", theme_surface: "#fff1f7", theme_text: "#831843" },
  // Dark surface (light text)
  { name: "Midnight", theme_primary: "#020617", theme_secondary: "#1e293b", theme_accent: "#38bdf8", theme_background: "#0b1120", theme_surface: "#0f172a", theme_text: "#e2e8f0" },
  { name: "Obsidian Gold", theme_primary: "#18181b", theme_secondary: "#292524", theme_accent: "#fcd34d", theme_background: "#09090b", theme_surface: "#1c1917", theme_text: "#f5f5f4" },
  { name: "Forest Night", theme_primary: "#052e16", theme_secondary: "#166534", theme_accent: "#4ade80", theme_background: "#021910", theme_surface: "#0b2a18", theme_text: "#dcfce7" },
  { name: "Galaxy", theme_primary: "#2e1065", theme_secondary: "#6d28d9", theme_accent: "#c4b5fd", theme_background: "#1a0a3c", theme_surface: "#20133f", theme_text: "#ede9fe" },
];

function applyPreset(preset) {
  const { name, ...colors } = preset;
  Object.assign(form, colors);
}

function hexToRgb(hex) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const int = parseInt(h, 16);
  if (Number.isNaN(int) || h.length !== 6) return { r: 15, g: 23, b: 42 };
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}
function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const placeholders = [
  "{{student_name}}",
  "{{class_name}}",
  "{{major}}",
  "{{student_seat_number}}",
  "{{companion_seat_number}}",
  "{{seat_number}}",
  "{{invitation_link}}",
  "{{event_title}}",
  "{{school_name}}",
  "{{event_date}}",
  "{{event_time}}",
  "{{venue_name}}",
  "{{venue_address}}",
  "{{maps_url}}",
  "{{dress_code}}",
  "{{dress_code_student}}",
  "{{dress_code_parent}}",
  "{{additional_note}}",
];

function fillForm(template) {
  Object.assign(form, { ...defaultForm, whatsapp_template: defaultWhatsapp, email_template: defaultEmail, ...template });
  syncAgendaFromForm();
  sections.value = sectionsFromTemplate(form);
}

function selectTemplate(template) {
  fillForm(template);
}

function newTemplate() {
  fillForm({ ...defaultForm, id: null, template_name: `Template Baru ${templates.value.length + 1}`, whatsapp_template: defaultWhatsapp, email_template: defaultEmail });
}

async function load() {
  const { data } = await eventSettingsService.list();
  templates.value = data.data || [];
  const active = templates.value.find((item) => item.is_active) || templates.value[0];
  if (active) fillForm(active);
}

async function save() {
  loading.value = true;
  try {
    syncAgendaToForm();
    // persist the drag-and-drop order, and keep legacy show_* flags in sync
    const payload = {
      ...form,
      layout_sections: JSON.stringify(sections.value),
      show_countdown: sections.value.includes("countdown"),
      schedule_title: form.schedule_title,
      schedule_headers: form.schedule_headers,
      schedule_rows: form.schedule_rows,
      show_map: sections.value.includes("map"),
      show_qr: sections.value.includes("qr"),
      show_note: sections.value.includes("note"),
    };
    const { data } = payload.id ? await eventSettingsService.update(payload) : await eventSettingsService.create(payload);
    await load();
    fillForm(data.data);
    toast.success(payload.id ? "Template berhasil diperbarui." : "Template baru berhasil disimpan.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal menyimpan template undangan"));
  } finally {
    loading.value = false;
  }
}

async function handleAudioUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".mp3")) {
    toast.warning("File harus berformat .mp3");
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    toast.warning("Ukuran MP3 maksimal 25MB");
    return;
  }
  audioUploading.value = true;
  try {
    const { data } = await eventSettingsService.uploadAudio(file);
    Object.assign(form, data.data);
    if (!form.audio_title) form.audio_title = file.name.replace(/\.mp3$/i, "");
    toast.success("MP3 berhasil diupload. Jangan lupa simpan template.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal upload MP3"));
  } finally {
    audioUploading.value = false;
  }
}

async function handleLogoUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  const name = file.name.toLowerCase();
  if (!/\.(png|jpe?g|webp|gif|svg)$/.test(name)) {
    toast.warning("File harus berformat gambar (png, jpg, webp, gif, svg).");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.warning("Ukuran logo maksimal 5MB");
    return;
  }
  logoUploading.value = true;
  try {
    const { data } = await eventSettingsService.uploadLogo(file);
    Object.assign(form, data.data);
    toast.success("Logo sekolah berhasil diupload. Jangan lupa simpan template.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal upload logo sekolah"));
  } finally {
    logoUploading.value = false;
  }
}

function removeAudio() {
  form.audio_url = "";
  form.audio_key = "";
  form.audio_title = "";
  form.audio_autoplay = false;
}

function removeLogo() {
  form.school_logo_url = "";
  form.school_logo_key = "";
}

async function activate(template) {
  try {
    const { data } = await eventSettingsService.activate(template.id);
    await load();
    fillForm(data.data);
    toast.success("Template aktif berhasil diganti.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal mengaktifkan template"));
  }
}

async function duplicate(template) {
  const copy = { ...template, id: null, is_active: false, template_name: `${template.template_name} Copy` };
  try {
    const { data } = await eventSettingsService.create(copy);
    await load();
    fillForm(data.data);
    toast.success("Template berhasil diduplikat.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal duplikat template"));
  }
}

async function removeTemplate(template) {
  if (template.is_active) return;
  const confirmed = await swalConfirm({
    title: "Hapus template?",
    text: `Template "${template.template_name}" akan dihapus permanen.`,
    confirmButtonText: "Hapus",
    icon: "warning",
    danger: true,
  });
  if (!confirmed) return;
  try {
    await eventSettingsService.remove(template.id);
    await load();
    toast.success("Template berhasil dihapus.");
  } catch (error) {
    toast.error(apiMessage(error, "Gagal menghapus template"));
  }
}

async function copy(value) {
  await navigator.clipboard?.writeText(value);
  toast.success(`${value} disalin.`);
}

onMounted(load);
</script>

<style scoped>
/* the wrapper handles the icon + opens the native picker on click */
.dt-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.dt-input::-webkit-datetime-edit {
  color: inherit;
}
.dt-field:hover {
  border-color: rgb(165 180 252);
}
.section-ghost {
  opacity: 0.5;
  border-style: dashed !important;
  border-color: rgb(99 102 241) !important;
  background: rgba(99, 102, 241, 0.06) !important;
}
</style>
