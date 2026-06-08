<template>
  <div class="dashboard p-4">
    <div class="wrapper-card grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-2 mt-5">
      <div class="card bg-white dark:bg-gray-800 w-full rounded-md p-5 border dark:border-gray-700 flex">
        <div class="p-2 max-w-sm">
          <div class="bg-slate-100 rounded-full w-14 h-14 text-lg p-3 text-slate-400 mx-auto dark:bg-slate-800 dark:text-slate-400">
            <Icon icon="ph:wallet-bold" class="h-[30px] w-[30px]" />
          </div>
        </div>
        <div class="block p-2 w-full">
          <p class="font-semibold text-gray-900 dark:text-gray-200 text-xl">
            {{ formatCurrency(role === 'admin' ? summary.totalPayouts : summary.totalWithdraw) }}
          </p>
          <h2 class="font-normal text-gray-400 text-md mt-1">Total Penarikan</h2>
        </div>
      </div>

      <div class="card bg-white dark:bg-gray-800 w-full rounded-md p-5 border dark:border-gray-700 flex">
        <div class="p-2 max-w-sm">
          <div class="bg-slate-100 rounded-full w-14 h-14 text-lg p-3 text-slate-400 mx-auto dark:bg-slate-800 dark:text-slate-400">
            <Icon icon="ph:hand-deposit-bold" class="h-[30px] w-[30px]" />
          </div>
        </div>
        <div class="block p-2 w-full">
          <p class="font-semibold text-gray-900 dark:text-gray-200 text-xl">
            {{ formatCurrency(role === 'admin' ? summary.totalDeposits : summary.totalDeposit) }}
          </p>
          <h2 class="font-normal text-gray-400 text-md mt-1">Total Setoran</h2>
        </div>
      </div>

      <div class="card bg-white dark:bg-gray-800 w-full rounded-md p-5 border dark:border-gray-700 flex">
        <div class="p-2 max-w-sm">
          <div class="bg-slate-100 rounded-full w-14 h-14 text-lg p-3 text-slate-400 mx-auto dark:bg-slate-800 dark:text-slate-400">
            <Icon icon="ph:user-circle-bold" class="h-[30px] w-[30px]" />
          </div>
        </div>
        <div class="block p-2 w-full">
          <p class="font-semibold text-gray-900 dark:text-gray-200 text-xl">
            {{ role === 'admin' ? summary.totalCustomers : summary.transactionCount }}
          </p>
          <h2 class="font-normal text-gray-400 text-md mt-1">{{ role === 'admin' ? 'Total Pelanggan'
            : 'Jumlah Transaksi' }}</h2>
        </div>
      </div>

      <div class="card bg-white dark:bg-gray-800 w-full rounded-md p-5 border dark:border-gray-700 flex">
        <div class="p-2 max-w-sm">
          <div class="bg-slate-100 rounded-full w-14 h-14 text-lg p-3 text-slate-400 mx-auto dark:bg-slate-800 dark:text-slate-400">
            <Icon icon="ph:chart-line-up-bold" class="h-[30px] w-[30px]" />
          </div>
        </div>
        <div class="block p-2 w-full">
          <p class="font-semibold text-gray-900 dark:text-gray-200 text-xl">
            {{ formatCurrency(role === 'admin' ? summary.totalBalance : summary.currentBalance) }}
          </p>
          <h2 class="font-normal text-gray-400 text-md mt-1">Saldo Saat Ini</h2>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
      <div :class="role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'"
        class="bg-white dark:bg-gray-800 p-5 w-full rounded-md border dark:border-gray-700">
        <h2 class="font-bold text-lg text-gray-800 dark:text-gray-200">Transaksi Terakhir</h2>
        <p class="text-gray-400 font-normal">Daftar aktivitas transaksi terbaru</p>
        <div class="wrapping-table mt-10 overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Transaksi</th>
                <th class="px-6 py-3">Tanggal & Waktu</th>
                <th class="px-6 py-3">Jumlah</th>
                <th v-if="role === 'user'" class="px-6 py-3">Penalti</th>
                <th class="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700" v-for="items in tableTransaction"
                :key="items.id">
                <td class="px-6 py-4">{{ translateTransaction(items.transaction || items.type) }}</td>
                <td class="px-6 py-4">{{ items.datetime || items.date }}</td>
                <td class="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{{ typeof items.amount === 'number'
                  ? formatCurrency(items.amount) : items.amount || formatCurrency(items.displayAmount) }}</td>
                <td v-if="role === 'user'" class="px-6 py-4 text-red-500">{{ formatCurrency(items.penalty) }}</td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-md capitalize"
                    :class="getStatusClass(items.statusTransaction || items.status)">
                    {{ translateStatus(items.statusTransaction || items.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="tableTransaction.length === 0">
                <td :colspan="role === 'user' ? 5 : 4" class="px-6 py-4 text-center">Tidak ada transaksi terbaru</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="role === 'admin'"
        class="lg:col-span-1 bg-white dark:bg-gray-800 p-5 border dark:border-gray-700 rounded-md w-full">
        <div>
          <h2 class="text-lg font-semibold dark:text-gray-200">PENGGUNA BARU</h2>
          <p class="text-gray-400">Anggota yang baru saja bergabung.</p>
        </div>
        <div class="divide-y h-96 mt-5 dark:divide-gray-700 overflow-y-auto">
          <div class="p-3 w-full" v-for="user in recentUsers" :key="user.id">
            <div class="flex gap-5 items-center">
              <div class="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {{ (user.full_name || user.username).charAt(0).toUpperCase() }}
              </div>
              <div>
                <h2 class="dark:text-gray-200 font-semibold">{{ user.full_name || user.username }}</h2>
                <p class="text-sm text-gray-400">@{{ user.username }}</p>
              </div>
            </div>
          </div>
          <div class="p-3 w-full text-center text-gray-400" v-if="recentUsers.length === 0">
            Tidak ada pengguna ditemukan
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

const router = useRouter();
const role = localStorage.getItem("role"); // 'admin' atau 'user'

const summary = ref({});
const tableTransaction = ref([]);
const recentUsers = ref([]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const translateTransaction = (text) => {
  if (!text) return "-";
  return text
    .toLowerCase()
    .replace("deposit from", "Setoran dari")
    .replace("withdrawal by", "Penarikan oleh")
    .replace("deposit", "Setoran")
    .replace("withdraw", "Penarikan");
};

const translateStatus = (status) => {
  const map = { completed: 'Selesai', progress: 'Proses', success: 'Berhasil', failed: 'Gagal' };
  return map[status] || status;
};

const getStatusClass = (status) => {
  if (['completed', 'success'].includes(status)) return 'text-green-800 bg-green-300';
  if (status === 'progress') return 'text-purple-800 bg-purple-300';
  return 'text-red-800 bg-red-300';
};

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token");
    const endpoint = role === 'admin'
      ? "https://alentest.my.id/tabungan/api/dashboard"
      : "https://alentest.my.id/tabungan/api/user/dashboard";

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Unauthorized");

    const result = await response.json();

    summary.value = result.summary;
    tableTransaction.value = role === 'admin' ? result.latestTransactions : result.recentTransactions;
    recentUsers.value = result.recentUsers || [];

  } catch (error) {
    router.push({ name: "Login" });
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>
