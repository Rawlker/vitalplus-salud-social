# Vitalplus Image Service

Servicio que genera imágenes PNG 1080x1080 para posts de redes sociales de Vitalplus Salud.

## Uso

### POST /generate
```json
{
  "tag": "Día de la Madre",
  "titulo": "Salud para toda tu familia",
  "cuerpo": "Porque las mamás merecen lo mejor...",
  "cta": "Cotiza tu plan",
  "fecha": "Mayo 2026",
  "plantilla": "plantilla-a"  // opcional, si null elige aleatoria
}
```
Devuelve: imagen PNG 1080x1080

### GET /preview?tag=...&titulo=...&cuerpo=...
Para pruebas rápidas desde el navegador.

## Deploy en Railway

1. Sube este repositorio a GitHub
2. En Railway: New Project → Deploy from GitHub
3. Railway detecta el Dockerfile automáticamente
4. Variables de entorno: ninguna requerida
5. El servicio queda disponible en una URL pública tipo `https://vitalplus-image-service.up.railway.app`
