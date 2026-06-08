<template>
  <footer class="bg-slate-50 px-4 pb-6 pt-2 sm:px-6 dark:bg-black">
    <div
      class="flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-400 sm:flex-row dark:border-slate-800">
      <p>&copy; {{ year }} Graduation Invitation CMS</p>
      <p>Dibuat oleh <span class="font-medium text-slate-500 dark:text-slate-300">Alen Prastya</span></p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
