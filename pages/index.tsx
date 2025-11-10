"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { signOut } from "aws-amplify/auth";
import {
  View,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  Image,
  Badge,
  Divider,
  SelectField,
  ScrollView,
  Loader,
  Alert,
} from "@aws-amplify/ui-react";
import Header from "../components/header";
import Footer from "../components/footer";

const client = generateClient<Schema>();

type Report = Schema["Report"]["type"];

interface ReportWithUrl extends Report {
  imageUrl?: string;
}

export default function ReportesCiudadanos() {
  // Estados de datos
  const [reports, setReports] = useState<ReportWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de filtros
  const [category, setCategory] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [selectedReport, setSelectedReport] = useState<ReportWithUrl | null>(null);

  // Estados de UI
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = async () => {
      await signOut(); 
    };

  // 🔄 Cargar reportes al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  // 📥 Función para cargar reportes desde DynamoDB
  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      // Obtener reportes de DynamoDB
      const { data: reportsData, errors } = await client.models.Report.list({
        limit: 100, // Ajusta según necesites
      });

      if (errors) {
        console.error("Errores al cargar reportes:", errors);
        throw new Error("Error al cargar los reportes");
      }

      console.log("📦 Reportes cargados:", reportsData.length);

      // Obtener URLs de imágenes desde S3
      const reportsWithUrls = await Promise.all(
        reportsData.map(async (report) => {
          let imageUrl = "";
          
          if (report.s3Key) {
            try {
              const urlResult = await getUrl({
                path: report.s3Key,
                options: { expiresIn: 3600 }, // URL válida por 1 hora
              });
              imageUrl = urlResult.url.toString();
            } catch (error) {
              console.error(`Error obteniendo URL para ${report.s3Key}:`, error);
            }
          }

          return {
            ...report,
            imageUrl,
          };
        })
      );

      // Ordenar por fecha (más recientes primero)
      reportsWithUrls.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setReports(reportsWithUrls);
    } catch (err: any) {
      console.error("❌ Error cargando reportes:", err);
      setError(err.message || "Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  }

  // 🔄 Suscribirse a cambios en tiempo real (opcional)
  useEffect(() => {
    const subscription = client.models.Report.observeQuery().subscribe({
      next: async ({ items }) => {
        console.log("🔄 Reportes actualizados en tiempo real:", items.length);
        
        // Obtener URLs de las nuevas imágenes
        const reportsWithUrls = await Promise.all(
          items.map(async (report) => {
            let imageUrl = "";
            
            if (report.s3Key) {
              try {
                const urlResult = await getUrl({
                  path: report.s3Key,
                  options: { expiresIn: 3600 },
                });
                imageUrl = urlResult.url.toString();
              } catch (error) {
                console.error(`Error obteniendo URL:`, error);
              }
            }

            return {
              ...report,
              imageUrl,
            };
          })
        );

        // Ordenar por fecha
        reportsWithUrls.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setReports(reportsWithUrls);
      },
      error: (error) => {
        console.error("❌ Error en suscripción:", error);
      },
    });

    // Limpiar suscripción al desmontar
    return () => subscription.unsubscribe();
  }, []);

  
  // 🔍 Filtrar reportes
  const filteredReports = reports.filter((r) => {
    const matchCategory = category === "Todos" || r.category === category;
    const matchStatus = status === "Todos" || r.status === status;
    return matchCategory && matchStatus;
  });

  // 🎨 Obtener variación de Badge según estado
  const getStatusVariation = (status: string | null | undefined) => {
    if (status === "Pendiente") return "error";
    if (status === "Resuelto") return "success";
    return "info";
  };

  // 🎨 Emoji según categoría
  const getCategoryEmoji = (category: string | null | undefined) => {
    const emojis: Record<string, string> = {
      bache: "🚗",
      alumbrado: "💡",
      agua: "💧",
      contaminacion: "☁️",
      basura: "🗑️",
      otro: "📍",
    };
    return emojis[category?.toLowerCase() || "otro"] || "📍";
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentPage=""
        handleLogout={handleLogout}
      />

      <main>
        {/* Vista detalle */}
        {selectedReport ? (
          <View padding="2rem">
            <Button 
              onClick={() => setSelectedReport(null)} 
              variation="link"
            >
              ← Volver a los reportes
            </Button>

            <Card variation="outlined" marginTop="1rem" padding="1.5rem" className="card">
              <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
                <Heading level={3}>{selectedReport.title}</Heading>
                <Badge variation={getStatusVariation(selectedReport.status)}>
                  {selectedReport.status || "Pendiente"}
                </Badge>
              </Flex>

              <Flex alignItems="center" gap="1rem" marginTop="0.5rem" wrap="wrap">
                <Text>👤 {selectedReport.author || "Anónimo"}</Text>
                <Text color="gray">
                  📅 {selectedReport.date || new Date(selectedReport.createdAt || "").toLocaleDateString()}
                </Text>
              </Flex>

              {selectedReport.imageUrl ? (
                <Image
                  src={selectedReport.imageUrl}
                  alt={selectedReport.title || "Imagen del reporte"}
                  marginTop="1rem"
                  borderRadius="medium"
                  maxHeight="500px"
                  objectFit="cover"
                  width="100%"
                />
              ) : (
                <View
                  backgroundColor="var(--amplify-colors-background-secondary)"
                  padding="3rem"
                  textAlign="center"
                  marginTop="1rem"
                  borderRadius="medium"
                >
                  <Text fontSize="3rem">📷</Text>
                  <Text>Sin imagen disponible</Text>
                </View>
              )}

              <Flex gap="2rem" marginTop="1rem" wrap="wrap">
                <Text>
                  {getCategoryEmoji(selectedReport.category)} Categoría:{" "}
                  <strong>{selectedReport.category || "Sin categoría"}</strong>
                </Text>
                <Text>
                  📍 Ubicación: <strong>{selectedReport.location || "No especificada"}</strong>
                </Text>
              </Flex>

              {/* Mostrar coordenadas si existen */}
              {(selectedReport.latitude || selectedReport.longitude) && (
                <Text marginTop="0.5rem" fontSize="small" color="gray">
                  🗺️ Coordenadas: {selectedReport.latitude}, {selectedReport.longitude}
                </Text>
              )}

              <Divider marginTop="1rem" />
              
              <Heading level={5} marginTop="1rem">
                Descripción
              </Heading>
              <Text>{selectedReport.description || "Sin descripción"}</Text>

              {/* Información adicional */}
              <Divider marginTop="1rem" />
            </Card>
          </View>
        ) : (
          <View padding="2rem">
            <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
              <div>
                <Heading level={2}>Reportes Ciudadanos</Heading>
                <Text>
                  Conoce los problemas urbanos que la comunidad ha reportado. Juntos mejoramos nuestras ciudades.
                </Text>
              </div>
              <Button
                variation="primary"
                onClick={() => window.location.href = "/create"}
              >
                ➕ Crear Reporte
              </Button>
            </Flex>

            {/* Mensaje de error */}
            {error && (
              <Alert variation="error" isDismissible={true} marginBottom="1rem">
                {error}
              </Alert>
            )}

            {/* Estado de carga */}
            {loading ? (
              <Flex justifyContent="center" alignItems="center" padding="3rem">
                <Loader size="large" />
                <Text marginLeft="1rem">Cargando reportes...</Text>
              </Flex>
            ) : (
              <Flex gap="2rem" alignItems="flex-start">
                {/* Panel de filtros */}
                <View width="250px">
                  <Heading level={4}>Filtros</Heading>
                  
                  <SelectField
                    label="Categoría"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Todos">Todas</option>
                    <option value="bache">🚗 Baches</option>
                    <option value="alumbrado">💡 Alumbrado</option>
                    <option value="agua">💧 Agua</option>
                    <option value="contaminacion">☁️ Contaminación</option>
                    <option value="basura">🗑️ Basura</option>
                    <option value="otro">📍 Otro</option>
                  </SelectField>

                  <SelectField
                    label="Estado"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    marginTop="1rem"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Resuelto">Resuelto</option>
                  </SelectField>

                  <Divider marginTop="1rem" marginBottom="1rem" />
                  
                  <Text fontSize="small" color="gray">
                    Mostrando {filteredReports.length} de {reports.length} reportes
                  </Text>

                  <Button
                    variation="link"
                    onClick={loadReports}
                    marginTop="1rem"
                    size="small"
                  >
                    🔄 Recargar
                  </Button>
                </View>

                {/* Lista de reportes */}
                <ScrollView width="100%" height="70vh">
                  {filteredReports.length === 0 ? (
                    <View textAlign="center" padding="3rem">
                      <Text fontSize="3rem">📭</Text>
                      <Heading level={4}>No hay reportes</Heading>
                      <Text color="gray">
                        {reports.length === 0
                          ? "Aún no se han creado reportes. ¡Sé el primero!"
                          : "No se encontraron reportes con los filtros seleccionados."}
                      </Text>
                    </View>
                  ) : (
                    <Flex wrap="wrap" gap="1rem">
                      {filteredReports.map((r) => (
                        <Card
                          className="card"
                          key={r.id}
                          variation="outlined"
                          width="300px"
                          onClick={() => {
                            setSelectedReport(r);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {r.imageUrl ? (
                            <Image
                              src={r.imageUrl}
                              alt={r.title || "Reporte"}
                              height="180px"
                              width="100%"
                              objectFit="cover"
                            />
                          ) : (
                            <View
                              height="180px"
                              backgroundColor="var(--amplify-colors-background-secondary)"
                            >
                              <Flex
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Text fontSize="2rem">📷</Text>
                              </Flex>
                            </View>
                          )}
                          
                          <View padding="1rem">
                            <Flex
                              justifyContent="space-between"
                              alignItems="center"
                              marginBottom="0.5rem"
                            >
                              <Text fontWeight="bold">
                                {getCategoryEmoji(r.category)} {r.category}
                              </Text>
                              <Badge variation={getStatusVariation(r.status)}>
                                {r.status || "Pendiente"}
                              </Badge>
                            </Flex>
                            
                            <Heading level={5}>
                              {r.title || "Sin título"}
                            </Heading>
                            
                            <Text fontSize="small">
                              {r.description && r.description.length > 90
                                ? `${r.description.slice(0, 90)}...`
                                : r.description || "Sin descripción"}
                            </Text>
                            
                            <Divider marginTop="0.5rem" marginBottom="0.5rem" />
                            
                            <Text fontSize="small" color="gray">
                              📍 {r.location || "Ubicación no especificada"}
                            </Text>
                            
                            <Flex justifyContent="space-between" marginTop="0.5rem">
                              <Text fontSize="small" color="gray">
                                📅 {r.date || new Date(r.createdAt || "").toLocaleDateString()}
                              </Text>
                             
                            </Flex>
                          </View>
                        </Card>
                      ))}
                    </Flex>
                  )}
                </ScrollView>
              </Flex>
            )}
          </View>
        )}
      </main>

      <Footer />
    </>
  );
}