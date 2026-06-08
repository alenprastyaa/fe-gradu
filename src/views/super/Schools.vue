<template>
  <main class="space-y-6 p-4 sm:p-6 dark:bg-black">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="page-eyebrow">Super Admin</p>
        <h1 class="page-title">Setup Sekolah</h1>
        <p class="page-subtitle">Kelola sekolah dan akun admin sekolah dari satu dashboard.</p>
      </div>
      <button class="btn-primary px-4 py-2.5" :disabled="loading" @click="load">
        <Icon :icon="loading ? 'ph:spinner-bold' : 'ph:arrows-clockwise-bold'" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <transition name="fade">
      <p v-if="message.text" :class="message.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'" class="rounded-xl px-4 py-3 text-sm">
        {{ message.text }}
      </p>
    </transition>

    <div class="grid gap-5 xl:grid-cols-2">
      <section class="card p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-slate-900 dark:text-white">{{ editingSchoolId ? "Edit Sekolah" : "Tambah Sekolah" }}</h2>
          <button v-if="editingSchoolId" class="text-sm font-medium text-slate-500 hover:text-slate-700" @click="resetSchoolForm">Batal</button>
        </div>
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveSchool">
          <label class="block sm:col-span-2">
            <span class="label">Nama Sekolah</span>
            <input v-model="schoolForm.name" class="input" placeholder="SMK Contoh" required />
          </label>
          <label class="block">
            <span class="label">Slug</span>
            <input v-model="schoolForm.slug" class="input" placeholder="smk-contoh" />
          </label>
          <label class="block">
            <span class="label">Logo URL</span>
            <input v-model="schoolForm.logo_url" class="input" placeholder="https://..." />
          </label>
          <label class="block sm:col-span-2">
            <span class="label">Alamat</span>
            <textarea v-model="schoolForm.address" class="input min-h-[96px]" placeholder="Alamat sekolah"></textarea>
          </label>
          <label class="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input v-model="schoolForm.is_active" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary-600" />
            Aktif
          </label>
          <div class="sm:col-span-2">
            <button class="btn-primary px-4 py-2.5" :disabled="savingSchool">
              <Icon :icon="savingSchool ? 'ph:spinner-bold' : 'ph:floppy-disk-bold'" :class="{ 'animate-spin': savingSchool }" />
              Simpan Sekolah
            </button>
          </div>
        </form>
      </section>

      <section class="card p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-slate-900 dark:text-white">{{ editingAdminId ? "Edit Admin" : "Tambah Admin" }}</h2>
          <button v-if="editingAdminId" class="text-sm font-medium text-slate-500 hover:text-slate-700" @click="resetAdminForm">Batal</button>
        </div>
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveAdmin">
          <label class="block">
            <span class="label">Nama Admin</span>
            <input v-model="adminForm.name" class="input" placeholder="Admin Sekolah" required />
          </label>
          <label class="block">
            <span class="label">Email</span>
            <input v-model="adminForm.email" type="email" class="input" placeholder="admin@sekolah.sch.id" required />
          </label>
          <label class="block">
            <span class="label">Role</span>
            <select v-model="adminForm.role" class="input">
              <option value="school_admin">Admin Sekolah</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </label>
          <label v-if="adminForm.role === 'school_admin'" class="block">
            <span class="label">Sekolah</span>
            <select v-model="adminForm.school_id" class="input" required>
              <option value="">Pilih sekolah</option>
              <option v-for="school in schools" :key="school.id" :value="school.id">{{ school.name }}</option>
            </select>
          </label>
          <label class="block sm:col-span-2">
            <span class="label">Password</span>
            <input v-model="adminForm.password" type="password" class="input" :placeholder="editingAdminId ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'" :required="!editingAdminId" />
          </label>
          <div class="sm:col-span-2">
            <button class="btn-primary px-4 py-2.5" :disabled="savingAdmin">
              <Icon :icon="savingAdmin ? 'ph:spinner-bold' : 'ph:user-plus-bold'" :class="{ 'animate-spin': savingAdmin }" />
              Simpan Admin
            </button>
          </div>
        </form>
      </section>
    </div>

    <section class="card overflow-hidden">
      <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
        <h2 class="font-semibold text-slate-900 dark:text-white">Daftar Sekolah</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
            <tr>
              <th class="px-5 py-3">Sekolah</th>
              <th class="px-5 py-3">Slug</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-for="school in schools" :key="school.id">
              <td class="px-5 py-3">
                <p class="font-medium text-slate-900 dark:text-white">{{ school.name }}</p>
                <p class="text-xs text-slate-400">{{ school.address || "-" }}</p>
              </td>
              <td class="px-5 py-3 text-slate-500">{{ school.slug }}</td>
              <td class="px-5 py-3">
                <span :class="school.is_active ? 'badge-success' : 'badge-warning'">{{ school.is_active ? "Aktif" : "Nonaktif" }}</span>
              </td>
              <td class="px-5 py-3 text-right">
                <button class="mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit" @click="editSchool(school)">
                  <Icon icon="ph:pencil-simple-bold" />
                </button>
                <button class="rounded-lg p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-700" title="Hapus" @click="deleteSchool(school)">
                  <Icon icon="ph:trash-bold" />
                </button>
              </td>
            </tr>
            <tr v-if="schools.length === 0">
              <td colspan="4" class="px-5 py-10 text-center text-slate-400">Belum ada sekolah.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card overflow-hidden">
      <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
        <h2 class="font-semibold text-slate-900 dark:text-white">Daftar Admin</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
            <tr>
              <th class="px-5 py-3">Admin</th>
              <th class="px-5 py-3">Role</th>
              <th class="px-5 py-3">Sekolah</th>
              <th class="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr v-for="admin in admins" :key="admin.id">
              <td class="px-5 py-3">
                <p class="font-medium text-slate-900 dark:text-white">{{ admin.name }}</p>
                <p class="text-xs text-slate-400">{{ admin.email }}</p>
              </td>
              <td class="px-5 py-3 text-slate-500">{{ roleLabel(admin.role) }}</td>
              <td class="px-5 py-3 text-slate-500">{{ admin.school_name || "-" }}</td>
              <td class="px-5 py-3 text-right">
                <button class="mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit" @click="editAdmin(admin)">
                  <Icon icon="ph:pencil-simple-bold" />
                </button>
                <button class="rounded-lg p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-700" title="Hapus" @click="deleteAdmin(admin)">
                  <Icon icon="ph:trash-bold" />
                </button>
              </td>
            </tr>
            <tr v-if="admins.length === 0">
              <td colspan="4" class="px-5 py-10 text-center text-slate-400">Belum ada admin.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Icon } from "@iconify/vue";
import { apiMessage } from "@/services/api";
import { superAdminService } from "@/services/superAdminService";

const schools = ref([]);
const admins = ref([]);
const loading = ref(false);
const savingSchool = ref(false);
const savingAdmin = ref(false);
const editingSchoolId = ref("");
const editingAdminId = ref("");
const message = reactive({ type: "", text: "" });

const schoolForm = reactive({ name: "", slug: "", address: "", logo_url: "", is_active: true });
const adminForm = reactive({ name: "", email: "", password: "", role: "school_admin", school_id: "" });

async function load() {
  loading.value = true;
  try {
    const [schoolRes, adminRes] = await Promise.all([superAdminService.schools(), superAdminService.admins()]);
    schools.value = schoolRes.data.data || [];
    admins.value = adminRes.data.data || [];
  } catch (error) {
    notify("error", apiMessage(error, "Gagal mengambil data super admin"));
  } finally {
    loading.value = false;
  }
}

async function saveSchool() {
  savingSchool.value = true;
  try {
    const payload = { ...schoolForm };
    if (editingSchoolId.value) await superAdminService.updateSchool(editingSchoolId.value, payload);
    else await superAdminService.createSchool(payload);
    resetSchoolForm();
    notify("success", "Sekolah berhasil disimpan");
    await load();
  } catch (error) {
    notify("error", apiMessage(error, "Gagal menyimpan sekolah"));
  } finally {
    savingSchool.value = false;
  }
}

async function saveAdmin() {
  savingAdmin.value = true;
  try {
    const payload = {
      ...adminForm,
      school_id: adminForm.role === "school_admin" ? adminForm.school_id : null,
    };
    if (editingAdminId.value) await superAdminService.updateAdmin(editingAdminId.value, payload);
    else await superAdminService.createAdmin(payload);
    resetAdminForm();
    notify("success", "Admin berhasil disimpan");
    await load();
  } catch (error) {
    notify("error", apiMessage(error, "Gagal menyimpan admin"));
  } finally {
    savingAdmin.value = false;
  }
}

function editSchool(school) {
  editingSchoolId.value = school.id;
  Object.assign(schoolForm, {
    name: school.name,
    slug: school.slug,
    address: school.address || "",
    logo_url: school.logo_url || "",
    is_active: school.is_active,
  });
}

function editAdmin(admin) {
  editingAdminId.value = admin.id;
  Object.assign(adminForm, {
    name: admin.name,
    email: admin.email,
    password: "",
    role: admin.role,
    school_id: admin.school_id || "",
  });
}

async function deleteSchool(school) {
  if (!confirm(`Hapus sekolah ${school.name}?`)) return;
  try {
    await superAdminService.deleteSchool(school.id);
    notify("success", "Sekolah berhasil dihapus");
    await load();
  } catch (error) {
    notify("error", apiMessage(error, "Gagal menghapus sekolah"));
  }
}

async function deleteAdmin(admin) {
  if (!confirm(`Hapus admin ${admin.name}?`)) return;
  try {
    await superAdminService.deleteAdmin(admin.id);
    notify("success", "Admin berhasil dihapus");
    await load();
  } catch (error) {
    notify("error", apiMessage(error, "Gagal menghapus admin"));
  }
}

function resetSchoolForm() {
  editingSchoolId.value = "";
  Object.assign(schoolForm, { name: "", slug: "", address: "", logo_url: "", is_active: true });
}

function resetAdminForm() {
  editingAdminId.value = "";
  Object.assign(adminForm, { name: "", email: "", password: "", role: "school_admin", school_id: "" });
}

function notify(type, text) {
  message.type = type;
  message.text = text;
}

function roleLabel(role) {
  return role === "super_admin" ? "Super Admin" : "Admin Sekolah";
}

onMounted(load);
</script>
