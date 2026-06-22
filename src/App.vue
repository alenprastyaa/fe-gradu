<template>
  <router-view v-if="isPublicRoute" />
  <div
    v-else
    class="app-root flex min-h-screen bg-slate-50 font-lexend text-slate-800 dark:bg-slate-950 dark:text-slate-200"
  >
    <transition name="fade">
      <div
        v-if="sidebar"
        class="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        @click="close"
      ></div>
    </transition>

    <div
      class="lg:block"
      :class="{ 'lg:block hidden': !sidebar, block: sidebar }"
    >
      <div
        class="lg:flex-auto w-sidebar bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 lg:z-0 z-30 overflow-auto lg:relative fixed"
      >
        <perfect-scrollbar class="h-screen">
          <Sidebar @sidebarToggle="close" />
        </perfect-scrollbar>
      </div>
    </div>

    <div
      class="app-scroll flex flex-auto w-full flex-col overflow-auto h-screen bg-slate-50 transition-colors dark:bg-black"
      id="body-scroll"
    >
      <Header class="shrink-0" @sidebarToggle="open" />

      <transition
        name="slide-up"
        mode="out-in"
      >
        <router-view />
      </transition>
      <Footer v-if="!$route.meta.hideFooter" class="mt-auto shrink-0" />
    </div>
  </div>
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
        bodyScrollbar: null,
      };
    },

    components: {
      Header,
      Footer,
      Sidebar,
    },
    computed: {
      isPublicRoute() {
        return !!this.$route.meta.hideNav;
      },
    },
    watch: {
      $route() {
        this.sidebar = false;
        this.syncBodyOverflow();
        this.initDesktopScrollbar();
      },
    },
    mounted() {
      this.syncBodyOverflow();
      this.initDesktopScrollbar();
      window.addEventListener("resize", this.initDesktopScrollbar, { passive: true });
    },
    beforeUnmount() {
      window.removeEventListener("resize", this.initDesktopScrollbar);
      document.body.style.overflow = "";
      if (this.bodyScrollbar) {
        this.bodyScrollbar.destroy();
        this.bodyScrollbar = null;
      }
    },
    methods: {
      open() {
        this.sidebar = true;
      },
      close() {
        this.sidebar = false;
      },
      syncBodyOverflow() {
        document.body.style.overflow = this.isPublicRoute ? "auto" : "hidden";
      },
      initDesktopScrollbar() {
        const target = document.querySelector("#body-scroll");
        if (!target) return;
        if (this.isPublicRoute) {
          if (this.bodyScrollbar) {
            this.bodyScrollbar.destroy();
            this.bodyScrollbar = null;
          }
          return;
        }
        const useNativeMobileScroll = !window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
        if (useNativeMobileScroll) {
          if (this.bodyScrollbar) {
            this.bodyScrollbar.destroy();
            this.bodyScrollbar = null;
          }
          return;
        }
        if (!this.bodyScrollbar) {
          this.bodyScrollbar = Scrollbar.init(target);
        }
      },
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
