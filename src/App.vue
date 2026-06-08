<template>
  <!-- App -->
  <div class="flex min-h-screen bg-slate-50 font-lexend text-slate-800 dark:bg-slate-950 dark:text-slate-200">
    <!-- Mobile overlay -->
    <transition name="fade">
      <div
        v-if="sidebar && !$route.meta.hideNav"
        class="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        @click="close"
      ></div>
    </transition>

    <div
      v-if="!$route.meta.hideNav"
      class="lg:block"
      :class="{ 'lg:block hidden': !sidebar, block: sidebar }"
    >
      <div
        class="lg:flex-auto w-sidebar bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 lg:z-0 z-30 overflow-auto lg:relative fixed"
      >
        <perfect-scrollbar class="h-screen">
          <Sidebar
            v-if="!$route.meta.hideNav"
            @sidebarToggle="close"
          />
        </perfect-scrollbar>
      </div>
    </div>

    <div
      class="flex flex-auto w-full flex-col overflow-auto h-screen bg-slate-50 transition-colors dark:bg-black"
      id="body-scroll"
    >
      <Header
        v-if="!$route.meta.hideNav"
        class="shrink-0"
        @sidebarToggle="open"
      />

      <transition
        name="slide-up"
        mode="out-in"
      >
        <router-view />
      </transition>
      <Footer
        v-if="!$route.meta.hideNav"
        class="mt-auto shrink-0"
      />
    </div>
  </div>
  <!-- End app -->
</template>

<script>
  // Vue components
  import Sidebar from "@/components/Sidebar";
  import Header from "@/components/Header";
  import Footer from "@/components/Footer";
  // npm-js
  import Scrollbar from "smooth-scrollbar";

  export default {
    name: "App",

    data() {
      return {
        sidebarDark: false,
        sidebar: false,
      };
    },

    components: {
      Header,
      Footer,
      Sidebar,
    },
    methods: {
      open() {
        this.sidebar = true;
      },
      close() {
        this.sidebar = false;
      },
    },
    watch: {
      $route() {
        this.sidebar = false;
      },
    },
    mounted() {
      Scrollbar.init(document.querySelector("#body-scroll"));
    },
  };
</script>

<style>
  /*
  Enter and leave animations can use different
  durations and timing functions.
*/
  .slide-up-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-up-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
</style>
