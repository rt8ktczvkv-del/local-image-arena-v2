import { Txt2ImgWorkerClient } from 'web-txt2img';
import { env } from '@xenova/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.remoteHost = 'https://huggingface.co/';
env.remotePathTemplate = '{model}/resolve/{revision}/';
env.useBrowserCache = true;

const $ = id => document.getElementById(id);
let client = null;
let loaded = false;
let currentBlob = null;
let currentUrl = null;

function setProgress(p = {}) {
  if (p.pct != null) $('progress').value = p.pct;
  else $('progress').removeAttribute('value');

  let size = '';
  if (p.bytesDownloaded != null && p.totalBytesExpected != null) {
    size = ` · ${(p.bytesDownloaded/1024/1024).toFixed(0)}/${(p.totalBytesExpected/1024/1024).toFixed(0)} MB`;
  }
  $('status').textContent =
    `${p.message ?? p.phase ?? 'Arbeite …'}${p.pct != null ? ` · ${p.pct}%` : ''}${size}`;
}

async function init() {
  if (!navigator.gpu) {
    $('gpu').textContent = 'WebGPU fehlt';
    $('gpu').classList.add('bad');
    $('status').textContent = 'WebGPU ist auf diesem Gerät nicht verfügbar.';
    return;
  }

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) {
    $('gpu').textContent = 'Kein GPU Adapter';
    $('gpu').classList.add('bad');
    $('status').textContent = 'Kein WebGPU-Adapter verfügbar.';
    return;
  }

  client = Txt2ImgWorkerClient.createDefault();
  const caps = await client.detect();

  if (!caps.webgpu) {
    $('gpu').textContent = 'WebGPU nicht erkannt';
    $('gpu').classList.add('bad');
    $('status').textContent = 'Die KI-Bibliothek erkennt WebGPU nicht.';
    return;
  }

  $('gpu').textContent = 'WebGPU bereit';
  $('gpu').classList.add('ok');
  $('load').disabled = false;
  $('status').textContent = 'Bereit. Tippe auf „Lokales Modell laden“.';
}

$('random').onclick = () => {
  $('seed').value = Math.floor(Math.random() * 2147483647);
};

$('load').onclick = async () => {
  $('load').disabled = true;
  $('generate').disabled = true;
  $('status').textContent = 'SD‑Turbo wird geladen …';

  try {
    const wasmPaths = new URL('./ort/', import.meta.url).href;
    const res = await client.load('sd-turbo', {
      backendPreference: ['webgpu'],
      wasmPaths
    }, setProgress);

    if (!res?.ok) throw new Error(res?.message || res?.reason || 'Modelldownload fehlgeschlagen');

    loaded = true;
    $('load').textContent = 'Modell geladen ✓';
    $('generate').disabled = false;
    $('progress').value = 100;
    $('status').textContent = `Modell bereit · Backend: ${res.backendUsed || 'webgpu'}`;
  } catch (e) {
    console.error(e);
    $('status').textContent = 'Modellfehler: ' + (e?.message || e);
    $('load').disabled = false;
    $('load').textContent = 'Nochmal versuchen';
  }
};

$('generate').onclick = async () => {
  if (!loaded || !client) return;
  const prompt = $('prompt').value.trim();
  if (!prompt) {
    $('status').textContent = 'Bitte zuerst einen Prompt eingeben.';
    return;
  }

  $('generate').disabled = true;
  try {
    const seed = Math.max(0, Number($('seed').value) || 0);
    const { promise } = client.generate(
      { prompt, seed },
      e => setProgress({ ...e, message: e.phase ? `Generiere: ${e.phase}` : 'Generiere …' }),
      { busyPolicy: 'queue', debounceMs: 200 }
    );

    const res = await promise;
    if (!res?.ok) throw new Error(res?.message || res?.reason || 'Generierung fehlgeschlagen');

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentBlob = res.blob;
    currentUrl = URL.createObjectURL(currentBlob);

    $('result').src = currentUrl;
    $('result').hidden = false;
    $('empty').hidden = true;
    $('actions').hidden = false;
    $('download').href = currentUrl;
    $('progress').value = 100;
    $('status').textContent = `Fertig · Seed ${seed}`;
  } catch (e) {
    console.error(e);
    $('status').textContent = 'Generierungsfehler: ' + (e?.message || e);
  } finally {
    $('generate').disabled = !loaded;
  }
};

$('share').onclick = async () => {
  if (!currentBlob) return;
  const file = new File([currentBlob], 'local-image.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Local Image Arena' }); } catch {}
  } else {
    $('download').click();
  }
};

init().catch(e => {
  console.error(e);
  $('status').textContent = 'Startfehler: ' + (e?.message || e);
});
