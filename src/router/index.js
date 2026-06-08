import { createRouter, createWebHistory } from "vue-router";

// Default Pages
import Dashboard from "../views/Dashboard.vue";
// Component Pages
import Valert from "../views/components/alert.vue";
import Vaccrodion from "../views/components/accordion.vue";
import Vbadges from "../views/components/badges.vue";
import Vbreadcumb from "../views/components/breadcumbs.vue";
import Vbutton from "../views/components/button.vue";
import Vcard from "../views/components/card.vue";
import Vdropdown from "../views/components/dropdown.vue";
import Vmodal from "../views/components/modal.vue";
import Register from "../views/layouts/auth/Register.vue";
import ForgotPassword from "../views/layouts/auth/forgot-password.vue";
import Users from "../views/Users.vue"; // Import the new Users component
import GraduationLogin from "../views/graduation/Login.vue";
import GraduationDashboard from "../views/graduation/Dashboard.vue";
import GraduationStudents from "../views/graduation/Students.vue";
import GraduationImportStudents from "../views/graduation/ImportStudents.vue";
import GraduationSeatNumbers from "../views/graduation/SeatNumbers.vue";
import GraduationScanner from "../views/graduation/Scanner.vue";
import GraduationAttendanceReport from "../views/graduation/AttendanceReport.vue";
import GraduationEventSettings from "../views/graduation/EventSettings.vue";
import GraduationResetData from "../views/graduation/ResetData.vue";
import GraduationWhatsappBulk from "../views/graduation/WhatsappBulk.vue";
import PublicInvite from "../views/graduation/PublicInvite.vue";
import SuperSchools from "../views/super/Schools.vue";
import { useAuthStore } from "@/store/auth";

// layouts
import Blank from "../views/layouts/Blank.vue";

// error page
import Page404 from "../views/layouts/error/404.vue";
import Page500 from "../views/layouts/error/500.vue";
import PageMaintenance from "../views/layouts/error/maintenance.vue";
import Tables from "../views/tables.vue";
import Tabungan from "@/views/Tabungan.vue";

var appname = " - Graduation Invitation CMS";

const routes = [
  // Routes
  {
    path: "/",
    name: "Dashboard",
    redirect: "/admin/dashboard",
  },
  {
    path: "/super",
    redirect: "/super/schools",
  },
  {
    path: "/super/schools",
    name: "SuperSchools",
    component: SuperSchools,
    meta: { title: "Setup Sekolah " + appname, requiresAuth: true, role: "super_admin" },
  },
  {
    path: "/admin/dashboard",
    name: "GraduationDashboard",
    component: GraduationDashboard,
    meta: { title: "Dashboard " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/students",
    name: "GraduationStudents",
    component: GraduationStudents,
    meta: { title: "Data Siswa " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/students/import",
    name: "GraduationImportStudents",
    component: GraduationImportStudents,
    meta: { title: "Import Siswa " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/students/whatsapp-bulk",
    name: "GraduationWhatsappBulk",
    component: GraduationWhatsappBulk,
    meta: { title: "Link WhatsApp Terpilih " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/seats",
    name: "GraduationSeatNumbers",
    component: GraduationSeatNumbers,
    meta: { title: "Nomor Bangku " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/scanner",
    name: "GraduationScanner",
    component: GraduationScanner,
    meta: { title: "Scanner Absensi " + appname, requiresAuth: true, role: "school_admin", hideFooter: true },
  },
  {
    path: "/admin/attendance",
    name: "GraduationAttendanceReport",
    component: GraduationAttendanceReport,
    meta: { title: "Rekap Absensi " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/event-settings",
    name: "GraduationEventSettings",
    component: GraduationEventSettings,
    meta: { title: "Template Undangan " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/admin/reset-data",
    name: "GraduationResetData",
    component: GraduationResetData,
    meta: { title: "Reset Data " + appname, requiresAuth: true, role: "school_admin" },
  },
  {
    path: "/invite/:code",
    name: "PublicInvite",
    component: PublicInvite,
    meta: { title: "Undangan Graduation", hideNav: true },
  },
  {
    path: "/template/dashboard",
    name: "TemplateDashboard",
    component: Dashboard,
    meta: { title: "Template Dashboard " + appname },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { title: "Users " + appname },
  },
  {
    path: "/tabungan",
    name: "Tabungans",
    component: Tabungan,
    meta: { title: "Tabungan " + appname },
  },

  // Components based Routes
  {
    path: "/component/alert",
    name: "Valert",
    component: Valert,
    meta: { title: "Alert" + appname },
  },
  {
    path: "/component/accordion",
    name: "Vaccordion",
    component: Vaccrodion,
    meta: { title: "Accordion" + appname },
  },
  {
    path: "/component/badge",
    name: "Vbadge",
    component: Vbadges,
    meta: { title: "Badge" + appname },
  },
  {
    path: "/component/breadcumb",
    name: "Vbreadcumb",
    component: Vbreadcumb,
    meta: { title: "Breadcumb" + appname },
  },
  {
    path: "/component/button",
    name: "Vbutton",
    component: Vbutton,
    meta: { title: "Button" + appname },
  },
  {
    path: "/component/card",
    name: "Vcard",
    component: Vcard,
    meta: { title: "Card" + appname },
  },
  {
    path: "/component/dropdown",
    name: "Vdropdown",
    component: Vdropdown,
    meta: { title: "Dropdown" + appname },
  },
  {
    path: "/component/modal",
    name: "Vmodal",
    component: Vmodal,
    meta: { title: "Modal" + appname },
  },
  // layouts

  {
    path: "/Blank",
    name: "Blank Page",
    component: Blank,
    meta: { title: "Blank Page" + appname },
  },

  {
    path: "/auth/login",
    name: "Login",
    component: GraduationLogin,
    meta: { title: "Login" + appname, hideNav: true },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: Register,
    meta: { title: "Register" + appname, hideNav: true },
  },
  {
    path: "/auth/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { title: "i Forgot Password" + appname, hideNav: true },
  },
  // layout/error
  // default page 404
  {
    path: "/:pathMatch(.*)*",
    name: "Page404",
    component: Page404,
    meta: { title: "Upps! 404" + appname, hideNav: true },
  },
  {
    path: "/500",
    name: "Page500",
    component: Page500,
    meta: { title: "Server internal Error" + appname, hideNav: true },
  },
  {
    path: "/maintenance",
    name: "maintenance",
    component: PageMaintenance,
    meta: {
      title: "Sorry the app has been Maintenance" + appname,
      hideNav: true,
    },
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: {
      title: "Tables" + appname,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,

  linkExactActiveClass: "exact-active",
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }
  const role = auth.admin?.role || localStorage.getItem("role");
  if (to.meta.role && role && to.meta.role !== role) {
    next(role === "super_admin" ? "/super/schools" : "/admin/dashboard");
    return;
  }
  if (to.name === "Login" && auth.isAuthenticated) {
    next(role === "super_admin" ? "/super/schools" : "/admin/dashboard");
    return;
  }
  next();
});

export default router;
