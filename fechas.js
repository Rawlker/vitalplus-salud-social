// fechas.js - Calendario de fechas especiales de VitalPlus
// Prioridad: 1 = Salud, 2 = B2B/laboral, 3 = Colombia, 4 = Mundial/curiosas
// Si varias fechas caen el mismo día, gana la de menor número (y en empate, la primera de la lista).
// Para agregar una fecha: copia una línea F(...) o M(...) y ajusta los datos.

const F = (mes, dia, p, nombre, angulo) => ({ mes, dia, p, nombre, angulo });
// M = día móvil: dow 0=domingo ... 6=sábado, n = 1..4 (o -1 para el último)
const M = (mes, dow, n, p, nombre, angulo) => ({ mes, nth: { dow, n }, p, nombre, angulo });

const FECHAS = [
  // ENERO
  F(1, 1, 4, 'Año Nuevo', 'propósitos de salud para el año'),
  F(1, 21, 4, 'Día Mundial del Abrazo', 'afecto y bienestar emocional'),
  F(1, 24, 4, 'Día Internacional de la Educación', 'educación en salud y prevención'),
  F(1, 28, 2, 'Día Internacional de la Protección de Datos', 'privacidad de tus datos de salud'),

  // FEBRERO
  F(2, 4, 1, 'Día Mundial contra el Cáncer', 'detección temprana y chequeos'),
  F(2, 10, 4, 'Día Mundial de las Legumbres', 'alimentación saludable'),
  F(2, 11, 4, 'Día de la Mujer y la Niña en la Ciencia', 'ciencia y salud'),
  F(2, 14, 3, 'Día de San Valentín', 'cuidar a quienes amas'),
  F(2, 15, 1, 'Día Internacional del Cáncer Infantil', 'atención pediátrica oportuna'),
  F(2, 28, 1, 'Día Mundial de las Enfermedades Raras', 'acceso a especialistas'),

  // MARZO
  F(3, 3, 1, 'Día Mundial de la Audición', 'chequeo auditivo'),
  F(3, 4, 1, 'Día Mundial de la Obesidad', 'hábitos y prevención'),
  F(3, 8, 3, 'Día Internacional de la Mujer', 'salud de la mujer y chequeos'),
  M(3, 4, 2, 1, 'Día Mundial del Riñón', 'hidratación y chequeos renales'),
  F(3, 15, 4, 'Día Mundial de los Derechos del Consumidor', 'elegir un plan de salud informado'),
  F(3, 20, 1, 'Día Mundial de la Salud Bucodental', 'salud oral y salud general'),
  F(3, 20, 4, 'Día Internacional de la Felicidad', 'bienestar emocional'),
  F(3, 21, 1, 'Día Mundial del Síndrome de Down', 'inclusión y atención especializada'),
  F(3, 22, 1, 'Día Mundial del Agua', 'hidratación'),
  F(3, 24, 1, 'Día Mundial de la Tuberculosis', 'diagnóstico oportuno'),

  // ABRIL
  F(4, 2, 1, 'Día Mundial de Concienciación sobre el Autismo', 'inclusión y acceso a especialistas'),
  F(4, 6, 4, 'Día del Deporte para el Desarrollo y la Paz', 'actividad física'),
  F(4, 7, 1, 'Día Mundial de la Salud', 'prevención y acceso a salud'),
  F(4, 14, 1, 'Día Mundial de la Enfermedad de Chagas', 'prevención y diagnóstico'),
  F(4, 17, 1, 'Día Mundial de la Hemofilia', 'atención especializada'),
  F(4, 22, 4, 'Día de la Tierra', 'entorno saludable'),
  F(4, 23, 4, 'Día del Idioma', 'cómo explicar la salud en palabras simples'),
  F(4, 24, 1, 'Semana Mundial de la Inmunización', 'vacunación en todas las etapas'),
  M(4, 3, -1, 2, 'Día de la Secretaria', 'bienestar del equipo de trabajo'),
  M(4, 6, -1, 3, 'Día de los Niños en Colombia', 'salud infantil y controles'),
  F(4, 28, 2, 'Día Mundial de la Seguridad y Salud en el Trabajo', 'salud laboral y colectivos empresariales'),
  F(4, 29, 4, 'Día Internacional de la Danza', 'movimiento y bienestar'),

  // MAYO
  F(5, 1, 2, 'Día del Trabajo', 'salud como beneficio laboral'),
  M(5, 2, 1, 1, 'Día Mundial del Asma', 'salud respiratoria'),
  F(5, 5, 1, 'Día Mundial de la Higiene de Manos', 'prevención básica'),
  M(5, 0, 2, 3, 'Día de la Madre', 'cuidar a mamá'),
  F(5, 12, 1, 'Día Internacional de la Enfermería', 'reconocimiento al personal de salud'),
  F(5, 15, 3, 'Día Internacional de la Familia', 'plan de salud familiar'),
  F(5, 15, 3, 'Día del Maestro', 'bienestar de los docentes'),
  F(5, 17, 1, 'Día Mundial de la Hipertensión', 'chequeo de la presión'),
  F(5, 25, 1, 'Día Mundial de la Tiroides', 'chequeos y diagnóstico'),
  F(5, 28, 1, 'Día de Acción por la Salud de la Mujer', 'prevención y chequeos'),
  F(5, 29, 1, 'Día Mundial de la Salud Digestiva', 'alimentación y hábitos'),
  F(5, 31, 1, 'Día Mundial Sin Tabaco', 'hábitos saludables'),

  // JUNIO
  F(6, 1, 3, 'Día Internacional de la Infancia', 'salud infantil'),
  F(6, 3, 4, 'Día Mundial de la Bicicleta', 'actividad física'),
  F(6, 5, 4, 'Día Mundial del Medio Ambiente', 'entorno saludable'),
  F(6, 7, 1, 'Día Mundial de la Inocuidad de los Alimentos', 'alimentación segura'),
  F(6, 14, 1, 'Día Mundial del Donante de Sangre', 'solidaridad y salud'),
  F(6, 19, 1, 'Día Mundial de la Anemia Falciforme', 'atención especializada'),
  M(6, 0, 3, 3, 'Día del Padre', 'cuidar a papá y chequeos masculinos'),
  F(6, 21, 4, 'Día Internacional del Yoga', 'bienestar y manejo del estrés'),
  F(6, 23, 4, 'Día Olímpico', 'actividad física'),
  F(6, 27, 2, 'Día de las Micro, Pequeñas y Medianas Empresas', 'colectivos para pymes'),

  // JULIO
  F(7, 20, 3, 'Día de la Independencia de Colombia', 'orgullo colombiano y salud'),
  F(7, 22, 1, 'Día Mundial del Cerebro', 'salud mental y neurológica'),
  F(7, 28, 1, 'Día Mundial contra la Hepatitis', 'vacunación y prevención'),
  F(7, 30, 4, 'Día Internacional de la Amistad', 'redes de apoyo y bienestar'),

  // AGOSTO
  F(8, 1, 1, 'Semana Mundial de la Lactancia Materna', 'salud materno-infantil'),
  F(8, 7, 3, 'Batalla de Boyacá', 'orgullo colombiano'),
  F(8, 12, 4, 'Día Internacional de la Juventud', 'hábitos desde jóvenes'),
  F(8, 20, 1, 'Día Mundial del Mosquito', 'prevención del dengue'),

  // SEPTIEMBRE
  F(9, 8, 1, 'Día Mundial de la Fisioterapia', 'rehabilitación y movimiento'),
  M(9, 6, 2, 1, 'Día Mundial de los Primeros Auxilios', 'saber qué hacer en una emergencia'),
  F(9, 17, 1, 'Día Mundial de la Seguridad del Paciente', 'atención segura'),
  M(9, 6, 3, 3, 'Día del Amor y la Amistad', 'cuidar a los tuyos'),
  F(9, 21, 4, 'Día Internacional de la Paz', 'bienestar y tranquilidad'),
  F(9, 25, 1, 'Día Mundial del Farmacéutico', 'uso responsable de medicamentos'),
  F(9, 28, 1, 'Día Mundial de la Rabia', 'prevención y vacunación de mascotas'),
  F(9, 29, 1, 'Día Mundial del Corazón', 'salud cardiovascular'),

  // OCTUBRE
  F(10, 1, 3, 'Día Internacional del Café', 'el café colombiano y el ritual de pausar y cuidarte'),
  F(10, 2, 4, 'Día Internacional de la No Violencia', 'cuidar tu salud como acto de paz'),
  M(10, 5, 1, 4, 'Día Mundial de la Sonrisa', 'salud oral'),
  F(10, 5, 4, 'Día Mundial de los Docentes', 'bienestar de los docentes'),
  F(10, 10, 1, 'Día Mundial de la Salud Mental', 'cuidar la mente'),
  M(10, 4, 2, 1, 'Día Mundial de la Visión', 'chequeo con el oftalmólogo'),
  F(10, 12, 1, 'Día Mundial de la Artritis', 'diagnóstico oportuno'),
  F(10, 15, 1, 'Día Mundial del Lavado de Manos', 'prevención básica'),
  F(10, 16, 1, 'Día Mundial de la Alimentación', 'alimentación saludable'),
  F(10, 18, 1, 'Día Mundial de la Menopausia', 'salud de la mujer'),
  F(10, 19, 1, 'Día Mundial del Cáncer de Mama', 'autoexamen y mamografía'),
  F(10, 24, 1, 'Día Mundial de la Poliomielitis', 'vacunación'),
  F(10, 29, 1, 'Día Mundial del ACV', 'señales de alerta'),
  F(10, 31, 3, 'Halloween', 'cuidar a los niños y su salud oral'),

  // NOVIEMBRE
  F(11, 8, 1, 'Día Mundial de la Radiología', 'diagnóstico por imágenes'),
  F(11, 12, 1, 'Día Mundial de la Neumonía', 'prevención y vacunación'),
  F(11, 13, 4, 'Día Mundial de la Bondad', 'bienestar emocional'),
  F(11, 14, 1, 'Día Mundial de la Diabetes', 'prevención y chequeos'),
  F(11, 17, 1, 'Día Mundial de la Prematuridad', 'cuidado materno-infantil'),
  M(11, 3, 3, 1, 'Día Mundial de la EPOC', 'salud respiratoria'),
  F(11, 18, 1, 'Semana de Concientización sobre Antibióticos', 'uso responsable de medicamentos'),
  F(11, 19, 1, 'Día Internacional del Hombre', 'chequeos y salud masculina'),
  F(11, 20, 4, 'Día Universal del Niño', 'salud infantil'),

  // DICIEMBRE
  F(12, 1, 1, 'Día Mundial del SIDA', 'prevención y pruebas'),
  F(12, 3, 1, 'Día del Médico', 'reconocimiento al personal médico'),
  F(12, 5, 4, 'Día Internacional del Voluntario', 'solidaridad'),
  F(12, 7, 3, 'Noche de Velitas', 'tradición familiar'),
  F(12, 12, 1, 'Día de la Cobertura Sanitaria Universal', 'acceso a salud de calidad'),
  F(12, 18, 3, 'Día Internacional del Migrante', 'colombianos en el exterior y su familia en Colombia'),
  F(12, 25, 4, 'Navidad', 'tiempo en familia y salud'),
  F(12, 31, 4, 'Fin de Año', 'propósitos de salud para el nuevo año'),
];

// Fecha de hoy en Colombia (Railway corre en UTC, así que no se usa new Date() directo)
function hoyBogota() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => Number(partes.find((p) => p.type === t).value);
  return { anio: get('year'), mes: get('month'), dia: get('day') };
}

function nthDia(anio, mes, dow, n) {
  const dias = [];
  const d = new Date(Date.UTC(anio, mes - 1, 1));
  while (d.getUTCMonth() === mes - 1) {
    if (d.getUTCDay() === dow) dias.push(d.getUTCDate());
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return n === -1 ? dias[dias.length - 1] : dias[n - 1];
}

// Devuelve la fecha especial de mayor prioridad para hoy (o la fecha dada), o null
function fechaEspecial(fecha = hoyBogota()) {
  const { anio, mes, dia } = fecha;
  const coinciden = FECHAS.filter((f) => {
    if (f.mes !== mes) return false;
    const d = f.nth ? nthDia(anio, mes, f.nth.dow, f.nth.n) : f.dia;
    return d === dia;
  });
  if (!coinciden.length) return null;
  coinciden.sort((a, b) => a.p - b.p); // sort estable: en empate gana la primera de la lista
  const g = coinciden[0];
  return { nombre: g.nombre, angulo: g.angulo, prioridad: g.p };
}

module.exports = { fechaEspecial, hoyBogota, FECHAS };
