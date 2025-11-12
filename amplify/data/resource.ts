import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // 📝 Modelo principal de Reportes
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
      author: a.string(),
      date: a.date(),
      views: a.integer().default(0),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      comments: a.hasMany("Comment", "reportId"),
      likes: a.hasMany("Like", "reportId"),
    })
    .authorization((allow) => [allow.authenticated()]),

  // 💬 Modelo de Comentarios
  Comment: a
    .model({
      content: a.string().required(),
      author: a.string().required(),
      reportId: a.id().required(),
      report: a.belongsTo("Report", "reportId"),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ❤️ Modelo de Likes
  Like: a
    .model({
      reportId: a.id().required(),
      report: a.belongsTo("Report", "reportId"),
      userId: a.string().required(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // 📅 Modelo de Eventos y Acciones Comunitarias
  Event: a
    .model({
      title: a.string().required(), // nombre del evento
      description: a.string().required(),
      date: a.datetime().required(),
      location: a.string().required(),
      latitude: a.float(),
      longitude: a.float(),
      category: a.enum([
        "Limpieza",
        "Reforestacion",
        "Asamblea",
        "Marcha",
        "Voluntariado",
        "Otro",
      ]),
      organizer: a.string().required(),
      maxParticipants: a.integer(),

      // 👥 Campo virtual (no se guarda en BD)
      attendeesCount: a.integer().default(0),

      createdAt: a.datetime(),
      updatedAt: a.datetime(),

      // Relaciones
      participants: a.hasMany("EventParticipant", "eventId"),
      photos: a.hasMany("EventPhoto", "eventId"),
    })
    .authorization((allow) => [allow.authenticated()]),

  // 🙋‍♂️ Modelo de Participantes del Evento
  EventParticipant: a
    .model({
      eventId: a.id().required(),
      event: a.belongsTo("Event", "eventId"),
      userId: a.string().required(), // ID o nombre del usuario
      userName: a.string(),
      status: a.enum(["Confirmado", "Pendiente", "Cancelado"]),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // 📸 Modelo de Fotos del Evento
  EventPhoto: a
    .model({
      eventId: a.id().required(),
      event: a.belongsTo("Event", "eventId"),
      s3Key: a.string().required(),
      thumbnailKey: a.string(),
      mimeType: a.string(),
      fileSize: a.integer(),
      uploadedBy: a.string(),
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
