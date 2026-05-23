const express = require('express');
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { generarCopy } = require('./copy-generator');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Permitir cualquier host (Railway proxy)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const PORT = process.env.PORT || 3000;
const TEMPLATES = ['plantilla-a', 'plantilla-b', 'plantilla-c'];

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Vitalplus Image Service' });
});

// ─── Subir imagen a Cloudinary ────────────────────────────────────────────────
async function subirACloudinary(base64Image) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary no configurado');
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'vitalplus';

    // Generar firma
    const crypto = require('crypto');
    const signString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    // Preparar form data
    const formData = new URLSearchParams();
    formData.append('file', `data:image/png;base64,${base64Image}`);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Cloudinary error:', err);
      return null;
    }

    const data = await response.json();
    return data.secure_url;

  } catch (err) {
    console.error('Error subiendo a Cloudinary:', err.message);
    return null;
  }
}

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
    await page.goto('about:blank');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // esperar fuentes Google

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

// ─── Buscar imagen en Pexels ──────────────────────────────────────────────────
async function buscarImagenPexels(keywords) {
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    console.warn('⚠️ PEXELS_API_KEY no configurada, usando imagen por defecto');
    return null;
  }

  try {
    // Buscar 5 fotos y elegir una al azar para variedad
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&orientation=square&per_page=5`;
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY }
    });

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.warn('Pexels no devolvió fotos para:', keywords);
      return null;
    }

    // Foto aleatoria entre los resultados
    const foto = data.photos[Math.floor(Math.random() * data.photos.length)];

    // URL cuadrada 800x800, perfecta para posts 1080x1080
    return {
      url: foto.src.large2x || foto.src.large,
      photographer: foto.photographer,
      pexels_page: foto.url
    };

  } catch (err) {
    console.error('Error buscando imagen en Pexels:', err.message);
    return null;
  }
}

// Endpoint completo: genera copy + imagen en un solo llamado
app.post('/generate-post', async (req, res) => {
  try {
    // 1. Generar copy con Claude (incluye pexels_keywords)
    const copy = await generarCopy();

    // 2. Buscar imagen en Pexels con las keywords generadas por Claude
    const keywords = copy.pexels_keywords || 'happy family health colombia';
    const pexelsImage = await buscarImagenPexels(keywords);
    console.log('Pexels imagen:', pexelsImage ? pexelsImage.url : 'no encontrada, sin imagen');

    // 3. Elegir plantilla
    const templateName = copy.plantilla || 'plantilla-c';

    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');

    // 4. Inyectar copy + imagen de Pexels en el template
    const injection = `
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };
          set('tag', ${JSON.stringify(copy.tag)});
          set('titulo', ${JSON.stringify(copy.titulo)});
          set('cuerpo', ${JSON.stringify(copy.cuerpo)});
          set('cta', ${JSON.stringify(copy.cta)});
          set('fecha', ${JSON.stringify(new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))});

          // Insertar imagen de Pexels si existe
          ${pexelsImage ? `
          const imgEl = document.getElementById('pexels-img');
          if (imgEl) {
            imgEl.src = ${JSON.stringify(pexelsImage.url)};
            imgEl.style.display = 'block';
          }
          ` : ''}
        });
      </script>
    `;
    html = html.replace('</body>', `${injection}</body>`);

    let browser;
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
      type: 'png'
    });

    await browser.close();

    // 5. Subir imagen a Cloudinary y obtener URL pública
    const base64 = screenshot.toString('base64');
    const imagenUrl = await subirACloudinary(base64);
    console.log('Cloudinary URL:', imagenUrl || 'no disponible, usando base64');

    // 6. Devolver copy + imagen
    res.json({
      copy,
      plantilla: templateName,
      imagen_base64: base64,
      imagen_url: imagenUrl || null,
      pexels: pexelsImage || null
    });

  } catch (err) {
    console.error('Error en generate-post:', err);
    res.status(500).json({ error: err.message });
  }
});
