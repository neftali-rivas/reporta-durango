import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*=====================================================================
SCHEMA PARA REPORTES CIUDADANOS (S3 STORAGE)
- Guarda imágenes en S3
- Autenticación: solo usuarios autenticados pueden crear/ver
- Incluye conteo de vistas, geolocalización y estado
=====================================================================*/

const schema = a.schema({
  // ============ MODELO: REPORT ============

  Report: a
    .model({
      title: a.string().required(),
      description: a.string(),
      category: a.string().required(), // Ejemplo: "bache", "luz rota", etc.
      status: a.string().default("Pendiente"), // "Pendiente", "En progreso", "Resuelto"
      location: a.string().required(), // Dirección o nombre de la zona
      latitude: a.float(),
      longitude: a.float(),
      // ---- ARCHIVO S3 ----
      s3Key: a.string().required(), // clave del archivo en S3 (imagen principal)
      thumbnailKey: a.string(), // opcional: miniatura o versión reducida
      mimeType: a.string(), // image/jpeg, image/png, etc.
      fileSize: a.integer(), // tamaño del archivo en bytes
      author: a.string(), // nombre o email del autor
      date: a.date(),
      views: a.integer().default(0),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated(), // Solo usuarios logueados
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // Solo usuarios autenticados
  },
});
