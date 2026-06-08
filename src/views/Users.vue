<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Manajemen Pengguna</h1>
      <button @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
        + Tambah Pengguna Baru
      </button>
    </div>

    <div v-if="globalSuccessMessage"
      class="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-md flex justify-between items-center">
      <span>{{ globalSuccessMessage }}</span>
      <button @click="globalSuccessMessage = ''" class="text-green-700 font-bold text-lg">&times;</button>
    </div>

    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border dark:border-gray-700 flex flex-wrap items-end gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari Username</label>
        <input v-model="searchQuery.username" type="text" placeholder="Mulai ketik nama..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter Tanggal Lahir</label>
        <input v-model="searchQuery.dob" type="date"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
      </div>
      <div class="flex gap-2">
        <button @click="clearSearch" v-if="searchQuery.username || searchQuery.dob"
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Hapus Filter
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center dark:text-gray-300 py-10">
      <span class="animate-pulse">Memuat data...</span>
    </div>
    <div v-else-if="errorMessage" class="p-3 text-sm text-red-500 bg-red-100 rounded-md mb-4">
      {{ errorMessage }}
    </div>
    <div v-else-if="users.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-10 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
      Tidak ada pengguna yang sesuai dengan kriteria pencarian.
    </div>
    <div v-else class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              No</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Username</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Nama Lengkap</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              No. HP</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Alamat</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Tanggal Lahir</th>
            <th scope="col"
              class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(user, index) in users" :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ user.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ user.full_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ user.phone || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ user.address || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{
              formatTanggalIndo(user.dob) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
              <button @click="openEditModal(user)"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 px-3 py-1 rounded-md transition-colors">
                Edit
              </button>
              <button @click="confirmDelete(user)"
                class="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-md transition-colors">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative">
        <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold dark:text-white">Tambah Pengguna Baru</h2>
          <button @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
        </div>
        <div class="p-6">
          <div v-if="addErrorMessage" class="mb-4 p-3 text-sm text-red-500 bg-red-100 rounded-md">
            {{ addErrorMessage }}
          </div>
          <form @submit.prevent="submitAddUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input v-model="newUser.username" type="text" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kata Sandi</label>
                <input v-model="newUser.password" type="password" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input v-model="newUser.full_name" type="text" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                <input v-model="newUser.dob" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. HP</label>
              <input v-model="newUser.phone" type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
              <textarea v-model="newUser.address" required rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700 mt-6">
              <button type="button" @click="closeModal"
                class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors">Batal</button>
              <button type="submit" :disabled="isAdding"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isAdding ? 'Menyimpan...' : 'Simpan Pengguna' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative">
        <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-bold dark:text-white">Edit Pengguna</h2>
          <button @click="closeEditModal"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
        </div>
        <div class="p-6">
          <div v-if="editErrorMessage" class="mb-4 p-3 text-sm text-red-500 bg-red-100 rounded-md">
            {{ editErrorMessage }}
          </div>
          <form @submit.prevent="submitEditUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username (Tidak dapat
                  diubah)</label>
                <input :value="editUser.username" type="text" disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kata Sandi Baru
                  (Opsional)</label>
                <input v-model="editUser.password" type="password" placeholder="Kosongkan jika tidak diubah"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input v-model="editUser.full_name" type="text" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                <input v-model="editUser.dob" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. HP</label>
              <input v-model="editUser.phone" type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
              <textarea v-model="editUser.address" required rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700 mt-6">
              <button type="button" @click="closeEditModal"
                class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors">Batal</button>
              <button type="submit" :disabled="isEditing"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isEditing ? 'Menyimpan...' : 'Perbarui Pengguna' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { swalConfirm, swalError } from '@/helper/swal';

const token = localStorage.getItem('token');
const baseUrl = 'https://alentest.my.id/tabungan';
const router = useRouter()

const users = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const globalSuccessMessage = ref('');

const showAddModal = ref(false);
const isAdding = ref(false);
const addErrorMessage = ref('');
const newUser = reactive({
  username: '',
  password: '',
  full_name: '',
  dob: '',
  address: '',
  phone: ''
});

const showEditModal = ref(false);
const isEditing = ref(false);
const editErrorMessage = ref('');
const editUser = reactive({
  id: '',
  username: '',
  password: '',
  full_name: '',
  dob: '',
  address: '',
  phone: ''
});

const searchQuery = reactive({
  username: '',
  dob: ''
});

const formatToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const formatToYYYYMMDD = (dateString) => {
  if (!dateString) return '';

  if (typeof dateString === 'string') {
    const normalizedDate = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) return normalizedDate;
  }

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTanggalIndo = (dateString) => {
  if (!dateString) return '-';
  const normalizedDate = formatToYYYYMMDD(dateString);

  if (!normalizedDate) return '-';

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const fetchUsers = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    users.value = data.data || data;
  } catch (error) {
    errorMessage.value = `Gagal memuat data: ${error.message}`;
    router.push({
      name: "Login"
    })
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async () => {
  if (!searchQuery.username && !searchQuery.dob) {
    return fetchUsers();
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const url = new URL(`${baseUrl}/api/users/search`);
    if (searchQuery.username) url.searchParams.append('username', searchQuery.username);
    if (searchQuery.dob) {
      const formattedDob = formatToDDMMYYYY(searchQuery.dob);
      url.searchParams.append('dob', formattedDob);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      users.value = [];
      return;
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan');

    if (Array.isArray(data)) {
      users.value = data;
    } else if (data && Array.isArray(data.data)) {
      users.value = data.data;
    } else {
      users.value = [data];
    }

  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
}, { deep: true });

const clearSearch = () => {
  searchQuery.username = '';
  searchQuery.dob = '';
};

const closeModal = () => {
  showAddModal.value = false;
  addErrorMessage.value = '';
  Object.assign(newUser, { username: '', password: '', full_name: '', dob: '', address: '', phone: '' });
};

const submitAddUser = async () => {
  isAdding.value = true;
  addErrorMessage.value = '';

  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Gagal menambahkan pengguna.`);

    globalSuccessMessage.value = `Pengguna ${newUser.full_name} berhasil ditambahkan!`;
    closeModal();
    fetchUsers();
    clearSearch();
  } catch (error) {
    addErrorMessage.value = error.message;
  } finally {
    isAdding.value = false;
  }
};

const openEditModal = (user) => {
  editUser.id = user.id;
  editUser.username = user.username;
  editUser.full_name = user.full_name;
  editUser.dob = formatToYYYYMMDD(user.dob);
  editUser.address = user.address;
  editUser.phone = user.phone || '';
  editUser.password = '';
  editErrorMessage.value = '';
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editErrorMessage.value = '';
};

const submitEditUser = async () => {
  isEditing.value = true;
  editErrorMessage.value = '';

  const payload = {
    full_name: editUser.full_name,
    dob: editUser.dob,
    address: editUser.address,
    phone: editUser.phone
  };

  if (editUser.password) {
    payload.password = editUser.password;
  }

  try {
    const response = await fetch(`${baseUrl}/api/users/${editUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Gagal memperbarui pengguna.`);

    globalSuccessMessage.value = `Data ${editUser.full_name} berhasil diperbarui!`;
    closeEditModal();
    fetchUsers();
  } catch (error) {
    editErrorMessage.value = error.message;
  } finally {
    isEditing.value = false;
  }
};

const confirmDelete = async (user) => {
  const isConfirmed = await swalConfirm({
    title: 'Hapus pengguna?',
    text: `Pengguna "${user.username}" akan dihapus permanen.`,
    confirmButtonText: 'Hapus',
    icon: 'warning',
    danger: true,
  });

  if (!isConfirmed) return;

  try {
    const response = await fetch(`${baseUrl}/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Gagal menghapus pengguna.`);

    globalSuccessMessage.value = `Pengguna ${user.username} berhasil dihapus!`;
    fetchUsers();
  } catch (error) {
    swalError('Gagal menghapus pengguna', error.message);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
