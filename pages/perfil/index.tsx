"use client";

import { useState, useEffect } from "react";
import {
  View,
  Flex,
  Text,
  Image,
  Button,
  Divider,
  Card,
  Heading,
  Link as AmplifyLink,
  Loader,
  Alert,
  SelectField,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { signOut, getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import Header from "../../components/header";
import Footer from "../../components/footer";

const client = generateClient<Schema>();

// ---------- Tipos ----------
type Report = Schema["Report"]["type"] & { imageUrl?: string };
type StatusType = "Pendiente" | "En progreso" | "Resuelto";
type CategoryType =
  | "bache"
  | "alumbrado"
  | "agua"
  | "contaminacion"
  | "basura"
  | "otro";

// ---------- Subcomponentes ----------
function StatusBadge({ status }: { status: StatusType }) {
  const configs: Record<
    StatusType,
    { label: string; background: string; color: string }
  > = {
    Pendiente: {
      label: "Pendiente",
      background: "#fde68a",
      color: "#92400e",
    },
    "En progreso": {
      label: "En progreso",
      background: "#bfdbfe",
      color: "#1e3a8a",
    },
    Resuelto: {
      label: "Resuelto",
      background: "#bbf7d0",
      color: "#065f46",
    },
  };
  const cfg = configs[status] || configs["Pendiente"];
  return (
    <View
      as="span"
      backgroundColor={cfg.background}
      color={cfg.color}
      borderRadius="9999px"
      padding="0.25rem 0.75rem"
      fontSize="0.75rem"
      fontWeight="600"
      display="inline-block"
    >
      {cfg.label}
    </View>
  );
}

function CategoryIcon({ category }: { category: CategoryType }) {
  const icons: Record<CategoryType, string> = {
    bache: "🚗",
    alumbrado: "💡",
    agua: "💧",
    contaminacion: "☁️",
    basura: "🗑️",
    otro: "📍",
  };

  const labels: Record<CategoryType, string> = {
    bache: "Bache",
    alumbrado: "Alumbrado",
    agua: "Fuga de Agua",
    contaminacion: "Contaminación",
    basura: "Basura",
    otro: "Otro",
  };

  return (
    <Flex direction="row" alignItems="center" gap="0.25rem">
      <Text fontSize="1.5rem">{icons[category]}</Text>
      <Text fontSize="0.875rem" fontWeight="500">
        {labels[category]}
      </Text>
    </Flex>
  );
}

// ---------- Componente principal ----------
export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // 🔹 Modal de edición
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<StatusType>("Pendiente");

  const handleLogout = async () => {
    await signOut();
  };

  // 🔄 Cargar reportes del usuario autenticado
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const user = await getCurrentUser();
        setUserEmail(user.signInDetails?.loginId || user.username);
        setIsLoggedIn(true);

        const { data, errors } = await client.models.Report.list();

        if (errors) throw new Error("Error al cargar los reportes");

        // Obtener URLs de S3
        const reportsWithUrls = await Promise.all(
          data.map(async (report) => {
            let imageUrl = "";
            if (report.s3Key) {
              try {
                const urlResult = await getUrl({
                  path: report.s3Key,
                  options: { expiresIn: 3600 },
                });
                imageUrl = urlResult.url.toString();
              } catch (err) {
                console.error("Error obteniendo URL:", err);
              }
            }
            return { ...report, imageUrl };
          })
        );

        // Ordenar más recientes primero
        reportsWithUrls.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setMyReports(reportsWithUrls);
      } catch (err: any) {
        setError(err.message || "Error al cargar reportes del usuario");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // ✅ Guardar edición de estado
  const handleSaveStatus = async () => {
    if (!editingReport) return;
    try {
      const updated = await client.models.Report.update({
        id: editingReport.id,
        status: newStatus,
      });
      setMyReports((prev) =>
        prev.map((r) =>
          r.id === editingReport.id
            ? { ...r, status: updated.data?.status }
            : r
        )
      );
      setEditingReport(null);
      alert("Estado actualizado correctamente ✅");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Hubo un error al guardar el cambio");
    }
  };

  // ❌ Eliminar reporte
  const handleDelete = async (reportId: string) => {
    if (showDeleteConfirm === reportId) {
      try {
        await client.models.Report.delete({ id: reportId });
        setMyReports((prev) => prev.filter((r) => r.id !== reportId));
        alert("Reporte eliminado correctamente");
      } catch (error) {
        console.error("Error eliminando reporte:", error);
        alert("Hubo un error al eliminar el reporte");
      } finally {
        setShowDeleteConfirm(null);
      }
    } else {
      setShowDeleteConfirm(reportId);
    }
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentPage=""
        handleLogout={handleLogout}
      />

      <View backgroundColor="var(--amplify-colors-background-primary)" minHeight="100vh" padding="2rem">
        <Card variation="outlined" marginBottom="2rem" padding="2rem" borderRadius="1rem">
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
            <Flex direction="column">
              <Flex
                width="4rem"
                height="4rem"
                backgroundColor="var(--amplify-colors-brand-primary-60)"
                borderRadius="50%"
                justifyContent="center"
                alignItems="center"
                fontSize="2rem"
                color="white"
                marginBottom="1rem"
              >
                👤
              </Flex>
              <Heading level={2}>Mi Perfil</Heading>
              <Text color="var(--amplify-colors-font-tertiary)">{userEmail}</Text>
            </Flex>
          </Flex>

          <Divider marginTop="1.5rem" marginBottom="1.5rem" />

          <Flex gap="2rem">
            <Flex direction="column">
              <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">Total de reportes</Text>
              <Text fontWeight="bold" fontSize="1.5rem">{myReports.length}</Text>
            </Flex>
            <Flex direction="column">
              <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">Completados</Text>
              <Text color="green" fontWeight="bold" fontSize="1.5rem">
                {myReports.filter((r) => r.status === "Resuelto").length}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Errores y carga */}
        {error && <Alert variation="error">{error}</Alert>}
        {loading && (
          <Flex justifyContent="center" alignItems="center" padding="3rem">
            <Loader size="large" />
            <Text marginLeft="1rem">Cargando reportes...</Text>
          </Flex>
        )}

        {/* Lista de reportes */}
        {!loading && (
          <>
            <Heading level={3} marginBottom="1rem">Mis Reportes</Heading>

            {myReports.length > 0 ? (
              <Flex direction="column" gap="1rem">
                {myReports.map((report) => (
                  <Card key={report.id} variation="outlined" padding="1.5rem" borderRadius="1rem">
                    <Flex direction={{ base: "column", medium: "row" }} gap="1rem">
                      {report.imageUrl ? (
                        <Image
                          src={report.imageUrl}
                          alt={report.title || ""}
                          width="200px"
                          height="120px"
                          borderRadius="0.75rem"
                          objectFit="cover"
                        />
                      ) : (
                        <Flex
                          width="200px"
                          height="120px"
                          backgroundColor="var(--amplify-colors-background-secondary)"
                          borderRadius="0.75rem"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text fontSize="2rem">📷</Text>
                        </Flex>
                      )}

                      <Flex direction="column" flex="1">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600">{report.title}</Text>
                          <StatusBadge status={report.status as StatusType} />
                        </Flex>
                        <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
                          {report.description}
                        </Text>
                        <Flex gap="1rem" marginTop="0.5rem">
                          <Text fontSize="0.875rem">📍 {report.location || "Ubicación no especificada"}</Text>
                          {report.category && <CategoryIcon category={report.category as CategoryType} />}
                        </Flex>
                      </Flex>

                      <Flex direction="column" gap="0.5rem">
                        <Button variation="primary" onClick={() => setEditingReport(report)}>
                          Editar estado
                        </Button>
                        <Button
                          variation={showDeleteConfirm === report.id ? "destructive" : "link"}
                          onClick={() => handleDelete(report.id)}
                        >
                          {showDeleteConfirm === report.id ? "Confirmar eliminación" : "Eliminar"}
                        </Button>
                        {showDeleteConfirm === report.id && (
                          <Button variation="link" onClick={() => setShowDeleteConfirm(null)}>
                            Cancelar
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            ) : (
              <Card textAlign="center" padding="3rem" variation="outlined">
                <Text fontSize="3rem">📭</Text>
                <Heading level={4}>Sin reportes creados</Heading>
                <Text color="var(--amplify-colors-font-tertiary)">
                  Aún no has creado ningún reporte.
                </Text>
                <AmplifyLink href="/create">Crear nuevo reporte</AmplifyLink>
              </Card>
            )}
          </>
        )}
      </View>

      {/* 🪟 Modal de edición */}
      {editingReport && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="center"
          alignItems="center"
          style={{ zIndex: 1000 }}
        >
          <Card width="400px" padding="2rem" borderRadius="1rem" backgroundColor="white">
            <Heading level={4}>Editar estado</Heading>
            <Text marginTop="0.5rem" color="gray">{editingReport.title}</Text>

            <SelectField
              label="Nuevo estado"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as StatusType)}
              marginTop="1rem"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Resuelto">Resuelto</option>
            </SelectField>

            <Flex justifyContent="flex-end" gap="1rem" marginTop="1.5rem">
              <Button variation="link" onClick={() => setEditingReport(null)}>
                Cancelar
              </Button>
              <Button variation="primary" onClick={handleSaveStatus}>
                Guardar cambios
              </Button>
            </Flex>
          </Card>
        </Flex>
      )}

      <Footer />
    </>
  );
}
