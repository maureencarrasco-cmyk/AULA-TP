const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3010/preview/ruta-aprendizaje", { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector(".aula-path--lineal", { timeout: 20000 });
  await page.screenshot({ path: "/app/public/preview-shots/modelo-a-lineal.png" });
  const b = await page.$("#modelo-b");
  if (b) await b.screenshot({ path: "/app/public/preview-shots/modelo-b-serpenteante.png" });
  const c = await page.$("#modelo-c");
  if (c) await c.screenshot({ path: "/app/public/preview-shots/modelo-c-sendero.png" });
  await page.screenshot({ path: "/app/public/preview-shots/ruta-completa.png", fullPage: true });
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
