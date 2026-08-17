
const SCRIPT_URL = 'https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js';
const LOAD_TIMEOUT_MS = 8000;

let loadPromise = null;

export function loadGoogleTrendsScript() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.trends && window.trends.embed) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      loadPromise = null;
      reject(new Error('Google Trends script load timed out'));
    }, LOAD_TIMEOUT_MS);

    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        clearTimeout(timeout);
        resolve();
      });
      existing.addEventListener('error', () => {
        clearTimeout(timeout);
        loadPromise = null;
        reject(new Error('Google Trends script failed to load'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeout);
      loadPromise = null;
      reject(new Error('Google Trends script failed to load'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

// ---- Global render queue: ek waqt mein sirf 1 widget render, gap ke sath ----
// Isse Google ka embed quota (USER_TYPE_EMBED_OVER_QUOTA / 429) trigger hone se bachte hain
const MIN_GAP_MS = 1200;
let renderQueue = Promise.resolve();
let lastRenderAt = 0;

export function queueWidgetRender(renderFn) {
  renderQueue = renderQueue.then(async () => {
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastRenderAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRenderAt = Date.now();
    return renderFn();
  });
  return renderQueue;
}