"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import {
  View,
  Flex,
  Card,
  Heading,
  Text,
  Button,
  Badge,
  Divider,
  TextField,
  SelectField,
  Alert,
} from "@aws-amplify/ui-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

const client = generateClient<Schema>();

export default function EventosComunitarios() {
  const [events, setEvents] = useState<any[]>([]);
  const [participantsCount, setParticipantsCount] = useState<Record<string, number>>({});
  const [userParticipations, setUserParticipations] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Otro" as
      | "Limpieza"
      | "Reforestacion"
      | "Asamblea"
      | "Marcha"
      | "Voluntariado"
      | "Otro",
  });

  // Al montar: obtener usuario y luego eventos
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        // Dependiendo de tu implementación, adapta userId/username
        const uid = (user && (user.userId || user.username || user.signInDetails?.loginId)) || null;
        const uname = (user && (user.username || user.signInDetails?.loginId || "Usuario")) || "Usuario";
        setCurrentUserId(uid);
        setUserName(uname);
      } catch (err) {
        console.warn("No se pudo obtener usuario actual:", err);
        setCurrentUserId(null);
      } finally {
        // cargar eventos aunque no tengamos usuario (eso sí: sin marcar como "irás")
        await loadEvents();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Cargar eventos + conteos + participaciones del usuario */
  async function loadEvents() {
    try {
      setLoading(true);
      const { data: eventsData } = await client.models.Event.list({ limit: 200 });
      setEvents(eventsData || []);

      // Para cada evento, contar participantes confirmados
      const countsPromises = (eventsData || []).map(async (ev: any) => {
        const res = await client.models.EventParticipant.list({
          filter: { eventId: { eq: ev.id }, status: { eq: "Confirmado" } },
        });
        return { id: ev.id, count: res.data.length };
      });

      // Obtener eventos en los que el usuario está confirmado (si hay usuario)
      const myParticipationPromise = currentUserId
        ? client.models.EventParticipant.list({
            filter: { userId: { eq: currentUserId }, status: { eq: "Confirmado" } },
            limit: 1000,
          })
        : Promise.resolve({ data: [] });

      const [countsArray, myParticipationRes] = await Promise.all([
        Promise.all(countsPromises),
        myParticipationPromise,
      ]);

      const countsMap: Record<string, number> = {};
      countsArray.forEach((c) => (countsMap[c.id] = c.count));
      setParticipantsCount(countsMap);

      const myEventIds = new Set<string>((myParticipationRes.data || []).map((p: any) => p.eventId));
      setUserParticipations(myEventIds);
    } catch (err) {
      console.error("Error cargando eventos:", err);
      setMessage("❌ Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }

  /** Crear evento */
  async function handleCreateEvent() {
    try {
      await client.models.Event.create({
        ...newEvent,
        organizer: userName,
        date: new Date(newEvent.date).toISOString(),
      });
      setMessage("✅ Evento creado con éxito");
      setNewEvent({ title: "", description: "", date: "", location: "", category: "Otro" });
      setShowForm(false);
      await loadEvents();
    } catch (err) {
      console.error("Error creando evento:", err);
      setMessage("❌ Error al crear el evento");
    }
  }

  /**
   * Toggle de asistencia:
   * - Si ya vas: busca el registro EventParticipant con (eventId, userId) y lo elimina.
   * - Si no vas: crea EventParticipant.
   * Actualiza estados locales (participantsCount y userParticipations) de forma optimista.
   */
  async function toggleAttendance(eventId: string) {
    if (!currentUserId) {
      setMessage("🔐 Debes iniciar sesión para confirmar asistencia.");
      return;
    }

    try {
      // Verificar si ya existe un registro para este usuario+evento
      const { data: existing } = await client.models.EventParticipant.list({
        filter: { eventId: { eq: eventId }, userId: { eq: currentUserId } },
        limit: 10,
      });

      const isGoing = existing && existing.length > 0;

      if (isGoing) {
        // eliminar (si hay varios, eliminar todos para seguridad)
        for (const rec of existing) {
          try {
            await client.models.EventParticipant.delete({ id: rec.id });
          } catch (err) {
            console.warn("No se pudo borrar participante:", rec.id, err);
          }
        }

        // actualizar estado local
        setParticipantsCount((prev) => ({
          ...prev,
          [eventId]: Math.max(0, (prev[eventId] || 1) - existing.length),
        }));
        setUserParticipations((prev) => {
          const s = new Set(prev);
          s.delete(eventId);
          return s;
        });

        setMessage("❌ Has anulado tu asistencia");
      } else {
        // crear participante
        await client.models.EventParticipant.create({
          eventId,
          userId: currentUserId,
          userName,
          status: "Confirmado",
        });

        // actualizar estado local
        setParticipantsCount((prev) => ({
          ...prev,
          [eventId]: (prev[eventId] || 0) + 1,
        }));
        setUserParticipations((prev) => {
          const s = new Set(prev);
          s.add(eventId);
          return s;
        });

        setMessage("🎉 ¡Asistencia confirmada!");
      }
    } catch (err) {
      console.error("Error toggle attendance:", err);
      setMessage("❌ Error al actualizar tu asistencia");
    }
  }

  // UI helpers
  const categoryOptions = [
    "Limpieza",
    "Reforestacion",
    "Asamblea",
    "Marcha",
    "Voluntariado",
    "Otro",
  ] as const;

  return (
    <>
      <Header isLoggedIn={!!currentUserId} currentPage="eventos" handleLogout={async () => await signOut()} />

      <main>
        <View padding="2rem" maxWidth="1200px" margin="0 auto">
          <Card variation="elevated" padding="2rem" backgroundColor="var(--amplify-colors-green-10)">
            <Flex direction="column" alignItems="center" textAlign="center">
              <Text fontSize="4rem" marginBottom="1rem">📅</Text>
              <Heading level={1}>Eventos y Acciones Comunitarias</Heading>
              <Text fontSize="large" marginTop="1rem" maxWidth="800px">
                Participa en limpiezas, reforestaciones, voluntariados y más.
              </Text>
            </Flex>
          </Card>

          {message && (
            <Alert variation="info" marginTop="1rem" onDismiss={() => setMessage(null)}>
              {message}
            </Alert>
          )}

          <Flex justifyContent="center" marginTop="2rem">
            <Button variation="primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancelar" : "➕ Crear Evento"}
            </Button>
            <Button variation="link" onClick={loadEvents}>🔄 Recargar</Button>
          </Flex>

          {showForm && (
            <Card variation="outlined" marginTop="1rem" padding="1rem">
              <Heading level={4}>Crear nuevo evento</Heading>
              <Flex direction="column" gap="0.75rem" marginTop="0.5rem">
                <TextField label="Título" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <TextField label="Descripción" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                <TextField label="Ubicación" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                <TextField label="Fecha y hora" type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                <SelectField label="Categoría" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </SelectField>
                <Flex gap="0.5rem">
                  <Button variation="primary" onClick={handleCreateEvent}>📅 Publicar Evento</Button>
                </Flex>
              </Flex>
            </Card>
          )}

          <Heading level={2} marginTop="2rem">Próximos eventos</Heading>

          {loading ? (
            <Text>Cargando eventos...</Text>
          ) : events.length === 0 ? (
            <Text>No hay eventos registrados aún.</Text>
          ) : (
            <Flex direction="column" gap="1rem" marginTop="0.5rem">
              {events.map((ev) => {
                const isGoing = userParticipations.has(ev.id);
                const count = participantsCount[ev.id] || 0;
                return (
                  <Card key={ev.id} variation="outlined" padding="1rem">
                    <Flex direction="column" gap="0.5rem">
                      <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
                        <Heading level={4}>{ev.title}</Heading>
                        <Badge variation="success">{ev.category}</Badge>
                      </Flex>

                      <Text color="gray">{new Date(ev.date).toLocaleString()}</Text>
                      <Text>{ev.description}</Text>
                      <Text fontSize="small" color="gray">📍 {ev.location}</Text>

                      <Divider marginTop="0.5rem" marginBottom="0.5rem" />

                      <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
                        <Flex gap="0.5rem" alignItems="center">
                          {isGoing ? (
                            <Badge variation="info">✅ Irás al evento</Badge>
                          ) : (
                            <Button variation="primary" onClick={() => toggleAttendance(ev.id)}>
                              🙋‍♂️ Confirmar Asistencia
                            </Button>
                          )}

                          {/* Permitir anular si ya vas */}
                          {isGoing && (
                            <Button variation="link" onClick={() => toggleAttendance(ev.id)}>Anular asistencia</Button>
                          )}
                        </Flex>

                        <Text color="gray">👥 {count} asistentes confirmados</Text>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          )}

        </View>
      </main>

      <Footer />
    </>
  );
}
