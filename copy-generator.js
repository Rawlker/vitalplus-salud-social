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

// ─── Banco de temas de salud ─────────────────────────────────────────────────
const TEMAS_SALUD = [
  "Importancia de los chequeos médicos preventivos anuales",
  "Beneficios de la medicina prepagada vs. el sistema público",
  "Cómo elegir el plan de salud ideal para tu familia",
  "La importancia de la salud mental y cómo cuidarla",
  "Alimentación saludable y su impacto en la salud a largo plazo",
  "Ejercicio físico: cuánto es suficiente para mantenerse sano",
  "Señales de alerta que no debes ignorar y consultar con tu médico",
  "Cómo prepararse para una cita médica y aprovecharla al máximo",
  "Salud cardiovascular: hábitos para cuidar tu corazón",
  "La importancia de vacunarse en todas las etapas de la vida",
  "Manejo del estrés y su relación con la salud física",
  "Sueño y salud: por qué dormir bien es fundamental",
  "Salud infantil: controles y cuidados para los más pequeños",
  "Salud en el adulto mayor: cómo mantener la calidad de vida",
  "Hidratación: por qué tomar suficiente agua es vital",
  "Cómo MedPlus Medicina Prepagada facilita el acceso a especialistas",
  "Diferencia entre urgencias y emergencias médicas",
  "Salud visual: cuándo ir al oftalmólogo",
  "Salud oral y su conexión con la salud general",
  "Por qué tener un médico de cabecera cambia tu calidad de vida",

  // Temas educativos / comparativos
  "Qué NO cubre una medicina prepagada y por qué es importante saberlo",
  "3 errores comunes al comprar una póliza o plan de salud en Colombia",
  "EPS vs medicina prepagada: ¿cuál es la diferencia real?",
  "Qué pasa si te enfermas en Colombia sin medicina prepagada",
  "¿Vale la pena pagar una medicina prepagada si ya tienes EPS?",
  "Cuánto tiempo tarda en atenderte una EPS vs una prepagada",
  "Qué especialistas están cubiertos en MedPlus y cuáles no",
  "Los 5 errores que la gente comete al elegir un plan de salud",
  "Por qué la sala de urgencias de tu clínica importa tanto como el médico",
  "Qué revisar en la letra pequeña antes de firmar un plan de salud",
];

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
  const tema = fechaImportante
    ? `Fecha especial: ${fechaImportante.nombre}`
    : TEMAS_SALUD[Math.floor(Math.random() * TEMAS_SALUD.length)];

  const esFechaEspecial = !!fechaImportante;

  const prompt = `Eres el community manager de VitalPlus Salud, una empresa colombiana autorizada para vender planes de MedPlus Medicina Prepagada.

Tu tarea es crear el copy para una publicación de redes sociales (Facebook e Instagram) sobre el siguiente tema:
"${tema}"

INSTRUCCIONES:
- Tono: cercano, cálido, profesional pero accesible. Habla de "tú".
- Audiencia: colombianos de clase media y alta interesados en cuidar su salud.
- NO menciones precios ni hagas promesas específicas de cobertura.
- Siempre menciona "MedPlus Medicina Prepagada" al menos una vez.
- El copy debe motivar a cotizar o conocer más sobre los planes.
${esFechaEspecial ? '- Es una fecha especial, dale un toque emotivo y celebratorio.' : '- Es contenido educativo, enfócate en dar valor e información útil.'}

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta (sin backticks ni texto adicional):
{
  "tag": "máximo 4 palabras en mayúsculas, ej: DÍA MUNDIAL DE LA SALUD",
  "titulo": "título impactante de máximo 8 palabras",
  "cuerpo": "2 oraciones máximo, máximo 180 caracteres total",
  "cta": "llamado a la acción de máximo 4 palabras",
  "tema": "${tema}",
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
  return JSON.parse(clean);
}

module.exports = { generarCopy, getFechaImportanteEstaSemana, TEMAS_SALUD, FECHAS_IMPORTANTES };
