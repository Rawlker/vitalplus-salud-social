// copy-generator.js
// Genera el copy para posts de VitalPlus Salud usando Claude API

const fetch = require('node-fetch');
const { fechaEspecial, FECHAS } = require('./fechas');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// El calendario de fechas ahora vive en fechas.js (con prioridades y fechas móviles).

// ─── Banco de temas con categoría ────────────────────────────────────────────
// Categorías:
//   comparativa → Plantilla A (oscura, impactante) — EPS vs prepagada, valor
//   educativa   → Plantilla B (vibrante) — hábitos y salud preventiva
//   especial    → Plantilla C (blanca, fresca) — fechas especiales y temas emocionales

const TEMAS_SALUD = [
  // ── Educativa / Preventiva → Plantilla B ──────────────────────────────────
  { tema: "Importancia de los chequeos médicos preventivos anuales",           categoria: "educativa" },
  { tema: "Cómo elegir el plan de salud ideal para tu familia",                categoria: "educativa" },
  { tema: "Alimentación saludable y su impacto en la salud a largo plazo",     categoria: "educativa" },
  { tema: "Ejercicio físico: cuánto es suficiente para mantenerse sano",       categoria: "educativa" },
  { tema: "Señales de alerta que no debes ignorar y consultar con tu médico",  categoria: "educativa" },
  { tema: "Cómo prepararse para una cita médica y aprovecharla al máximo",     categoria: "educativa" },
  { tema: "Salud cardiovascular: hábitos para cuidar tu corazón",              categoria: "educativa" },
  { tema: "La importancia de vacunarse en todas las etapas de la vida",        categoria: "educativa" },
  { tema: "Manejo del estrés y su relación con la salud física",               categoria: "educativa" },
  { tema: "Sueño y salud: por qué dormir bien es fundamental",                 categoria: "educativa" },
  { tema: "Hidratación: por qué tomar suficiente agua es vital",               categoria: "educativa" },
  { tema: "Cómo MedPlus Medicina Prepagada facilita el acceso a especialistas",categoria: "educativa" },
  { tema: "Diferencia entre urgencias y emergencias médicas",                  categoria: "educativa" },
  { tema: "Salud visual: cuándo ir al oftalmólogo",                            categoria: "educativa" },
  { tema: "Salud oral y su conexión con la salud general",                     categoria: "educativa" },
  { tema: "Por qué tener un médico de cabecera cambia tu calidad de vida",     categoria: "educativa" },
  { tema: "La importancia de la salud mental y cómo cuidarla",                 categoria: "educativa" },
  { tema: "Salud infantil: controles y cuidados para los más pequeños",        categoria: "educativa" },

  // ── Comparativa / Alto valor → Plantilla A ────────────────────────────────
  { tema: "Beneficios de la medicina prepagada vs. el sistema público",        categoria: "comparativa" },
  { tema: "Qué NO cubre una medicina prepagada y por qué es importante saberlo", categoria: "comparativa" },
  { tema: "3 errores comunes al comprar una póliza o plan de salud en Colombia", categoria: "comparativa" },
  { tema: "EPS vs medicina prepagada: ¿cuál es la diferencia real?",           categoria: "comparativa" },
  { tema: "Qué pasa si te enfermas en Colombia sin medicina prepagada",        categoria: "comparativa" },
  { tema: "¿Vale la pena pagar una medicina prepagada si ya tienes EPS?",      categoria: "comparativa" },
  { tema: "Cuánto tiempo tarda en atenderte una EPS vs una prepagada",         categoria: "comparativa" },
  { tema: "Qué especialistas están cubiertos en MedPlus y cuáles no",         categoria: "comparativa" },
  { tema: "Los 5 errores que la gente comete al elegir un plan de salud",      categoria: "comparativa" },
  { tema: "Por qué la sala de urgencias de tu clínica importa tanto como el médico", categoria: "comparativa" },
  { tema: "Qué revisar en la letra pequeña antes de firmar un plan de salud",  categoria: "comparativa" },

  // ── Especial / Emocional → Plantilla C ───────────────────────────────────
];

// ─── Mapa de categoría → plantilla ───────────────────────────────────────────
const PLANTILLA_POR_CATEGORIA = {
  educativa:   'plantilla-b',
  comparativa: 'plantilla-a',
  especial:    'plantilla-c',
};

// ─── Fecha especial de HOY (zona Bogotá) ─────────────────────────────────────
// Se mantiene el nombre original por si otro archivo lo importa.
// Devuelve { nombre, angulo, prioridad } o null.
function getFechaImportanteEstaSemana() {
  return fechaEspecial();
}

// ─── Generar copy con Claude API ─────────────────────────────────────────────
async function generarCopy() {
  const fechaImportante = getFechaImportanteEstaSemana();

  let temaTexto, categoria, esFechaEspecial;

  if (fechaImportante) {
    // Fecha especial de hoy → siempre plantilla C
    temaTexto = `Fecha especial: ${fechaImportante.nombre}`;
    categoria = 'especial';
    esFechaEspecial = true;
  } else {
    // Tema aleatorio del banco
    const seleccionado = TEMAS_SALUD[Math.floor(Math.random() * TEMAS_SALUD.length)];
    temaTexto = seleccionado.tema;
    categoria = seleccionado.categoria;
    esFechaEspecial = false;
  }

  const plantilla = PLANTILLA_POR_CATEGORIA[categoria];

  // Instrucción de tono según el tipo de contenido
  let instruccionTipo;
  if (esFechaEspecial) {
    const base = fechaImportante.prioridad === 1
      ? '- Es una fecha de salud: tono informativo, empático y esperanzador, sin dramatismo ni miedo. No uses tono festivo.'
      : '- Es una fecha especial, dale un toque emotivo y celebratorio.';
    instruccionTipo = `${base}\n- Conecta la fecha con la salud usando este ángulo: ${fechaImportante.angulo}.`;
  } else if (categoria === 'comparativa') {
    instruccionTipo = '- Es contenido comparativo, sé directo y usa datos o contrastes para generar impacto.';
  } else {
    instruccionTipo = '- Es contenido educativo, enfócate en dar valor e información útil.';
  }

  const prompt = `Eres el community manager de VitalPlus Salud, una empresa colombiana autorizada para vender planes de MedPlus Medicina Prepagada.

Tu tarea es crear el copy para una publicación de redes sociales (Facebook e Instagram) sobre el siguiente tema:
"${temaTexto}"

INSTRUCCIONES:
- Tono: cercano, cálido, profesional pero accesible. Habla de "tú".
- Audiencia: colombianos de clase media y alta interesados en cuidar su salud.
- NO menciones precios ni hagas promesas específicas de cobertura.
- Siempre menciona "MedPlus Medicina Prepagada" al menos una vez.
- El copy debe motivar a cotizar o conocer más sobre los planes.
${instruccionTipo}

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta (sin backticks ni texto adicional):
{
  "tag": "máximo 4 palabras en mayúsculas, ej: DÍA MUNDIAL DE LA SALUD",
  "titulo": "título impactante de máximo 8 palabras",
  "cuerpo": "2 oraciones máximo, máximo 180 caracteres total",
  "cta": "llamado a la acción de máximo 4 palabras",
  "tema": "${temaTexto}",
  "es_fecha_especial": ${esFechaEspecial},
  "pexels_keywords": "2-4 palabras en inglés para buscar una foto relevante en Pexels, ej: happy family doctor colombia"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  console.log('Claude API response:', JSON.stringify(data));
  const text = data.content[0].text.trim();

  // Limpiar posibles backticks
  const clean = text.replace(/```json|```/g, '').trim();
  const copy = JSON.parse(clean);

  // Agregar plantilla al objeto retornado
  copy.plantilla = plantilla;
  copy.categoria = categoria;

  return copy;
}

// FECHAS_IMPORTANTES se conserva en los exports por compatibilidad (ahora apunta a fechas.js)
module.exports = { generarCopy, getFechaImportanteEstaSemana, TEMAS_SALUD, FECHAS_IMPORTANTES: FECHAS };
