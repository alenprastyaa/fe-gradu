<template>
  <div class="flex flex-col items-center">
    <canvas ref="el" class="h-52 w-52"></canvas>
    <button
      type="button"
      class="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95"
      :style="{ backgroundColor: dark, color: light }"
      @click.stop="downloadPng"
    >
      <span>Unduh QR</span>
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  value: { type: String, default: "" },
  dark: { type: String, default: "#0f172a" },
  light: { type: String, default: "#ffffff" },
  size: { type: Number, default: 208 },
});

const el = ref(null);

async function render() {
  if (!el.value || !props.value) return;
  await QRCode.toCanvas(el.value, props.value, {
    width: props.size,
    margin: 1,
    color: { dark: props.dark, light: props.light },
  });
}

function downloadPng(filename = "qr-code.png") {
  if (!el.value) return;
  const safeName = String(filename || "qr-code.png").replace(/[\\/:*?"<>|]+/g, "-").trim() || "qr-code.png";
  console.log("[QR] download requested", {
    filename: safeName,
    hasCanvas: !!el.value,
    size: props.size,
    valueLength: String(props.value || "").length,
  });
  const canvas = el.value;
  canvas.toBlob((blob) => {
    console.log("[QR] canvas toBlob result", { hasBlob: !!blob, blobSize: blob?.size || 0 });
    if (!blob) {
      console.warn("[QR] download aborted: canvas returned empty blob");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeName.endsWith(".png") ? safeName : `${safeName}.png`;
    console.log("[QR] triggering browser download", { download: link.download, objectUrl: url });
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

onMounted(render);
watch(() => [props.value, props.dark, props.light], render);

defineExpose({ downloadPng });
</script>
