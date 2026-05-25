// copy-generator.js
// Genera el copy para posts de VitalPlus Salud usando Claude API

const fetch = require('node-fetch');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ─── Calendario de fechas importantes Colombia ───────────────────────────────
const FECHAS_IMPORTANTES = [
  { mes: 1,  dia: 1,  nombre: "Año Nuevo" },
  { mes: 2,  dia: 14, nombre: "Día de San Valentín" },
  { mes: 3,  dia: 8,  nombre: "Día Internacional de la Mujer" },
  { mes: 4,  dia: 7,  nombre: "Día Mundial de la Salud" },
  { mes: 4,  dia: 22, nombre: "Día de la Tierra" },
  { mes: 5,  dia: 11, nombre: "Día de la Madre en Colombia" },
  { mes: 6,  dia: 1,  nombre: "Día Mundial de los Niños" },
  { mes: 6,  dia: 21, nombre: "Día del Padre en Colombia" },
  { mes: 7,  dia: 20, nombre: "Día de la Independencia de Colombia" },
  { mes: 8,  dia: 12, nombre: "Día Internacional de la Juventud" },
  { mes: 9,  dia: 29, nombre: "Día Mundial del Corazón" },
  { mes: 10, dia: 2,  nombre: "Día Internacional de la No Violencia" },
  { mes: 10, dia: 10, nombre: "Día Mundial de la Salud Mental" },
  { mes: 10, dia: 31, nombre: "Halloween" },
  { mes: 11, dia: 14, nombre: "Día Mundial de la Diabetes" },
  { mes: 11, dia: 17, nombre: "Día Mundial de la Enfermedad Pulmonar Obstructiva" },
  { mes: 12, dia: 1,  nombre: "Día Mundial del SIDA" },
  { mes: 12, dia: 25, nombre: "Navidad" },
  { mes: 12, dia: 31, nombre: "Fin de Año" },
];

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

// ─── Detectar fecha importante esta semana ───────────────────────────────────
function getFechaImportanteEstaSemana() {
  const hoy = new Date();
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    const encontrada = FECHAS_IMPORTANTES.find(f => f.mes === mes && f.dia === dia);
    if (encontrada) return encontrada;
  }
  return null;
}

// ─── Generar copy con Claude API ─────────────────────────────────────────────
async function generarCopy() {
  const fechaImportante = getFechaImportanteEstaSemana();

  let temaTexto, categoria, esFechaEspecial;

  if (fechaImportante) {
    // Fecha especial → siempre plantilla C
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

  const prompt = `Eres el community manager de VitalPlus Salud, una empresa colombiana autorizada para vender planes de MedPlus Medicina Prepagada.

Tu tarea es crear el copy para una publicación de redes sociales (Facebook e Instagram) sobre el siguiente tema:
"${temaTexto}"

INSTRUCCIONES:
- Tono: cercano, cálido, profesional pero accesible. Habla de "tú".
- Audiencia: colombianos de clase media y alta interesados en cuidar su salud.
- NO menciones precios ni hagas promesas específicas de cobertura.
- Siempre menciona "MedPlus Medicina Prepagada" al menos una vez.
- El copy debe motivar a cotizar o conocer más sobre los planes.
${esFechaEspecial ? '- Es una fecha especial, dale un toque emotivo y celebratorio.' : categoria === 'comparativa' ? '- Es contenido comparativo, sé directo y usa datos o contrastes para generar impacto.' : '- Es contenido educativo, enfócate en dar valor e información útil.'}

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

module.exports = { generarCopy, getFechaImportanteEstaSemana, TEMAS_SALUD, FECHAS_IMPORTANTES };
