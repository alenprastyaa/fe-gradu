import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: {
    popup: "graduation-toast",
    timerProgressBar: "swal2-timer-progress-bar",
  },
});

function swalClasses({ danger = false } = {}) {
  return {
    container: "graduation-swal-container",
    popup: "graduation-swal-popup",
    icon: "graduation-swal-icon",
    title: "graduation-swal-title",
    htmlContainer: "graduation-swal-html",
    actions: "graduation-swal-actions",
    confirmButton: danger ? "graduation-swal-confirm graduation-swal-confirm-danger" : "graduation-swal-confirm",
    cancelButton: "graduation-swal-cancel",
  };
}

export function swalToast(icon, title, text = "") {
  return toast.fire({ icon, title, text });
}

export function swalError(title, text = "") {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Tutup",
    buttonsStyling: false,
    customClass: swalClasses(),
  });
}

export function swalList({ title, message, items = [], icon = "error" }) {
  const html = [
    message ? `<p class="swal2-html-message">${escapeHtml(message)}</p>` : "",
    items.length
      ? `<ul class="swal2-html-list">${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`
      : "",
  ].join("");

  return Swal.fire({
    icon,
    title,
    html,
    width: "min(92vw, 560px)",
    confirmButtonText: "Tutup",
    buttonsStyling: false,
    customClass: swalClasses(),
  });
}

export async function swalConfirm({ title, text, confirmButtonText = "Lanjutkan", icon = "question", danger = false }) {
  const result = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Batal",
    buttonsStyling: false,
    customClass: swalClasses({ danger }),
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function swalScanStatus({ success = true, title, text = "", timer = 3000 }) {
  const statusClass = success ? "graduation-swal-status-success" : "graduation-swal-status-error";
  const iconMarkup = success
    ? `<span class="graduation-scan-icon graduation-scan-icon-success"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg></span>`
    : `<span class="graduation-scan-icon graduation-scan-icon-error"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></span>`;
  const html = [
    iconMarkup,
    `<div class="graduation-scan-content">`,
    `<p class="graduation-scan-title">${escapeHtml(title)}</p>`,
    text ? `<p class="graduation-scan-text">${escapeHtml(text)}</p>` : "",
    `<span class="graduation-scan-loading"><span></span><span></span><span></span></span>`,
    `</div>`,
  ].join("");

  return Swal.fire({
    html,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      ...swalClasses(),
      popup: `graduation-swal-popup graduation-swal-status-popup ${statusClass}`,
      htmlContainer: "graduation-swal-status-html",
      timerProgressBar: "graduation-swal-status-progress",
    },
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
