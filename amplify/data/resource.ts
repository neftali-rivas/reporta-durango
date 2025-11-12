import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Modelo principal de Reportes
  Report: a
    .model({
      title: a.string().required(),
      description: a.string(),
      category: a.string().required(),
      status: a.string().default("Pendiente"),
      location: a.string().required(),
      latitude: a.float(),
      longitude: a.float(),
      s3Key: a.string().required(),
      thumbnailKey: a.string(),
      mimeType: a.string(),
      fileSize: a.integer(),
      author: a.string(), // usuario creador
      date: a.date(),
      views: a.integer().default(0),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      // Relaciones
      comments: a.hasMany("Comment", "reportId"),
      likes: a.hasMany("Like", "reportId"),
    })
    .authorization((allow) => [allow.authenticated()]),

  // 🗨️ Modelo de comentarios
  Comment: a
    .model({
      content: a.string().required(),
      author: a.string().required(), // usuario que comenta
      reportId: a.id().required(), // relación con Report
      report: a.belongsTo("Report", "reportId"), // ✅ Relación bidireccional
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ❤️ Modelo de "me gusta"
  Like: a
    .model({
      reportId: a.id().required(), // relación con Report
      report: a.belongsTo("Report", "reportId"), // ✅ Relación bidireccional
      userId: a.string().required(), // usuario que dio like
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});