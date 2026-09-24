const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9341;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'aula-module-entry-'));
const processChrome = spawn(chrome, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--disable-gpu',
  '--no-first-run',
  'http://127.0.0.1:8000/#course/1',
], { stdio: 'ignore' });
processChrome.unref();

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function retry(fn, attempts = 80) {
  let error;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (err) { error = err; await wait(100); }
  }
  throw error;
}

async function main() {
  const pages = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json`);
    if (!response.ok) throw new Error('Chrome aún no está disponible');
    return response.json();
  });
  const page = pages.find(item => item.type === 'page');
  assert.ok(page?.webSocketDebuggerUrl, 'No se encontró la página de prueba');

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const commandId = ++id;
    const timer = setTimeout(() => {
      pending.delete(commandId);
      reject(new Error(`El navegador no respondió a ${method}`));
    }, 5000);
    pending.set(commandId, {
      resolve: value => { clearTimeout(timer); resolve(value); },
      reject: error => { clearTimeout(timer); reject(error); },
    });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await send('Runtime.enable');
  await retry(async () => {
    const ready = await evaluate('document.readyState === "complete" && Boolean(document.querySelector("#login-form"))');
    if (!ready) throw new Error('Inicio de sesión aún no disponible');
  });
  await evaluate(`(()=>{
    const form=document.querySelector('#login-form');
    form.elements.username.value='docente';
    form.elements.password.value='DocenteTP2026!';
    form.requestSubmit();
  })()`);
  await retry(async () => {
    const ready = await evaluate('Boolean(document.querySelector("[data-course-href=\\"#course/1\\"]"))');
    if (!ready) throw new Error('Panel de cursos aún no disponible');
  });
  await evaluate('document.querySelector("[data-course-href=\\"#course/1\\"]").click()');
  await retry(async () => {
    const ready = await evaluate('Boolean(document.querySelector("[data-route-href=\\"#module/1\\"]"))');
    if (!ready) throw new Error('Ruta del curso aún no disponible');
  });
  await evaluate('document.querySelector("[data-route-href=\\"#module/1\\"]").click()');
  const state = await retry(async () => {
    const value = await evaluate(`({
      hash:location.hash,
      screen:document.body.dataset.screen||'',
      station:Boolean(document.querySelector('.station-body.s1')),
      reflection:Boolean(document.querySelector('#context-form')),
      loading:document.body.innerText.includes('Cargando módulo')
    })`);
    if (!value.station || !value.reflection || value.loading) throw new Error('El módulo aún no terminó de abrir');
    return value;
  });
  assert.equal(state.hash, '#module/1');
  assert.equal(state.screen, 'module');
  const routeImages = await retry(async () => {
    const value = await evaluate(`Array.from(document.querySelectorAll('.lr-track .lr-media img')).map(img=>({src:img.currentSrc,loaded:img.complete&&img.naturalWidth>0}))`);
    if (value.length !== 5 || value.some(image => !image.loaded)) throw new Error('Las imágenes de estaciones aún no cargan');
    return value;
  });
  assert.ok(routeImages.every(image => image.src.includes('/static/themes/route/climate-')));
  await Promise.race([send('Browser.close').catch(() => {}), wait(2000)]);
  socket.close();
  console.log('Module entry: the course button opens station 1 and its reflection form.');
}

main().finally(async () => {
  const exited = new Promise(resolve => processChrome.once('exit', resolve));
  try { processChrome.kill(); } catch (error) { /* Chrome ya terminó */ }
  await Promise.race([exited, wait(3000)]);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (error) { /* limpieza diferida de Windows */ }
}).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
