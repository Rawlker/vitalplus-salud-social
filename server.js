const express = require('express');
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TEMPLATES = ['plantilla-a', 'plantilla-b', 'plantilla-c'];

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Vitalplus Image Service' });
});

// Endpoint principal: genera imagen PNG
app.post('/generate', async (req, res) => {
  const {
    tag = '',
    titulo = '',
    cuerpo = '',
    cta = 'Cotiza tu plan',
    fecha = '',
    plantilla = null // null = aleatoria
  } = req.body;

  // Elegir plantilla
  const templateName = plantilla && TEMPLATES.includes(plantilla)
    ? plantilla
    : TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];

  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({ error: `Plantilla no encontrada: ${templateName}` });
  }

  let html = fs.readFileSync(templatePath, 'utf-8');

  // Inyectar contenido dinámico via JS inline
  const injection = `
    <script>
      window.addEventListener('DOMContentLoaded', () => {
        const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };
        set('tag', ${JSON.stringify(tag)});
        set('titulo', ${JSON.stringify(titulo)});
        set('cuerpo', ${JSON.stringify(cuerpo)});
        set('cta', ${JSON.stringify(cta)});
        set('fecha', ${JSON.stringify(fecha || new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))});
      });
    </script>
  `;
  html = html.replace('</body>', `${injection}</body>`);

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // esperar fuentes Google

    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
      type: 'png'
    });

    res.set('Content-Type', 'image/png');
    res.set('X-Template-Used', templateName);
    res.send(screenshot);

  } catch (err) {
    console.error('Error generando imagen:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

// Preview rápido (GET con query params para pruebas)
app.get('/preview', async (req, res) => {
  req.body = {
    tag: req.query.tag || 'Tip de salud',
    titulo: req.query.titulo || 'Tu salud es lo primero',
    cuerpo: req.query.cuerpo || 'Con MedPlus tienes acceso a los mejores especialistas.',
    cta: req.query.cta || 'Cotiza tu plan',
    plantilla: req.query.plantilla || null
  };

  // Reusar lógica del POST
  return app._router.handle(
    Object.assign(req, { method: 'POST', url: '/generate' }),
    res,
    () => {}
  );
});

app.listen(PORT, () => {
  console.log(`✅ Vitalplus Image Service corriendo en puerto ${PORT}`);
});
