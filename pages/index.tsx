"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
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
  TextAreaField,
  Icon,
} from "@aws-amplify/ui-react";
// Iconos personalizados con SVG
const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "red" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
import Header from "../components/header";
import Footer from "../components/footer";

const client = generateClient<Schema>();

type Report = Schema["Report"]["type"];
type Comment = Schema["Comment"]["type"];
type Like = Schema["Like"]["type"];

interface ReportWithUrl extends Report {
  imageUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  userHasLiked?: boolean;
  commentsList?: Comment[];
}

export default function ReportesCiudadanos() {
  // Estados de datos
  const [reports, setReports] = useState<ReportWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Estados de filtros
  const [category, setCategory] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [selectedReport, setSelectedReport] = useState<ReportWithUrl | null>(null);

  // Estados de comentarios
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Estados de UI
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = async () => {
    await signOut();
  };

  // 🔐 Obtener usuario actual
  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    }
  }

  // 🔄 Cargar reportes al montar el componente
  useEffect(() => {
    if (currentUserId) {
      loadReports();
    }
  }, [currentUserId]);

  // 📥 Función para cargar reportes con likes y comentarios
  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const { data: reportsData, errors } = await client.models.Report.list({
        limit: 100,
      });

      if (errors) {
        console.error("Errores al cargar reportes:", errors);
        throw new Error("Error al cargar los reportes");
      }

      console.log("📦 Reportes cargados:", reportsData.length);

      // Obtener URLs de imágenes y contar likes/comentarios
      const reportsWithUrls = await Promise.all(
        reportsData.map(async (report) => {
          let imageUrl = "";

          if (report.s3Key) {
            try {
              const urlResult = await getUrl({
                path: report.s3Key,
                options: { expiresIn: 3600 },
              });
              imageUrl = urlResult.url.toString();
            } catch (error) {
              console.error(`Error obteniendo URL para ${report.s3Key}:`, error);
            }
          }

          // Obtener likes
          const { data: likes } = await client.models.Like.list({
            filter: { reportId: { eq: report.id } },
          });

          // Verificar si el usuario actual dio like
          const userHasLiked = likes?.some((like) => like.userId === currentUserId) || false;

          // Obtener comentarios
          const { data: comments } = await client.models.Comment.list({
            filter: { reportId: { eq: report.id } },
          });

          return {
            ...report,
            imageUrl,
            likesCount: likes?.length || 0,
            commentsCount: comments?.length || 0,
            userHasLiked,
            commentsList: comments || [],
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

  // ❤️ Dar o quitar like
  async function toggleLike(reportId: string) {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      if (report.userHasLiked) {
        // Quitar like
        const { data: likes } = await client.models.Like.list({
          filter: {
            reportId: { eq: reportId },
            userId: { eq: currentUserId },
          },
        });

        if (likes && likes.length > 0) {
          await client.models.Like.delete({ id: likes[0].id });
        }
      } else {
        // Dar like
        await client.models.Like.create({
          reportId,
          userId: currentUserId,
        });
      }

      // Actualizar estado local
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                userHasLiked: !r.userHasLiked,
                likesCount: r.userHasLiked
                  ? (r.likesCount || 0) - 1
                  : (r.likesCount || 0) + 1,
              }
            : r
        )
      );

      // Actualizar también selectedReport si está abierto
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                userHasLiked: !prev.userHasLiked,
                likesCount: prev.userHasLiked
                  ? (prev.likesCount || 0) - 1
                  : (prev.likesCount || 0) + 1,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error al dar/quitar like:", error);
      setError("Error al actualizar el like");
    }
  }

  // 💬 Agregar comentario
  async function addComment() {
    if (!selectedReport || !newComment.trim()) return;

    try {
      setSubmittingComment(true);

      const user = await getCurrentUser();
      const username = user.signInDetails?.loginId || user.username || "Usuario";

      await client.models.Comment.create({
        reportId: selectedReport.id,
        content: newComment.trim(),
        author: username,
      });

      setNewComment("");

      // Recargar comentarios del reporte actual
      await loadCommentsForReport(selectedReport.id);
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      setError("Error al agregar el comentario");
    } finally {
      setSubmittingComment(false);
    }
  }

  // 📥 Cargar comentarios de un reporte específico
  async function loadCommentsForReport(reportId: string) {
    try {
      setLoadingComments(true);

      const { data: comments } = await client.models.Comment.list({
        filter: { reportId: { eq: reportId } },
      });

      // Ordenar comentarios por fecha (más recientes primero)
      const sortedComments = (comments || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      // Actualizar el reporte seleccionado
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              commentsList: sortedComments,
              commentsCount: sortedComments.length,
            }
          : null
      );

      // Actualizar también en la lista general
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                commentsList: sortedComments,
                commentsCount: sortedComments.length,
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    } finally {
      setLoadingComments(false);
    }
  }

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
            <Button onClick={() => setSelectedReport(null)} variation="link">
              ← Volver a los reportes
            </Button>

            <Card
              variation="outlined"
              marginTop="1rem"
              padding="1.5rem"
              className="card"
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                wrap="wrap"
              >
                <Heading level={3}>{selectedReport.title}</Heading>
                <Badge variation={getStatusVariation(selectedReport.status)}>
                  {selectedReport.status || "Pendiente"}
                </Badge>
              </Flex>

              <Flex
                alignItems="center"
                gap="1rem"
                marginTop="0.5rem"
                wrap="wrap"
              >
                <Text>👤 {selectedReport.author || "Anónimo"}</Text>
                <Text color="gray">
                  📅{" "}
                  {selectedReport.date ||
                    new Date(
                      selectedReport.createdAt || ""
                    ).toLocaleDateString()}
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
                  📍 Ubicación:{" "}
                  <strong>
                    {selectedReport.location || "No especificada"}
                  </strong>
                </Text>
              </Flex>

              {(selectedReport.latitude || selectedReport.longitude) && (
                <Text marginTop="0.5rem" fontSize="small" color="gray">
                  🗺️ Coordenadas: {selectedReport.latitude},{" "}
                  {selectedReport.longitude}
                </Text>
              )}

              <Divider marginTop="1rem" />

              <Heading level={5} marginTop="1rem">
                Descripción
              </Heading>
              <Text>{selectedReport.description || "Sin descripción"}</Text>

              <Divider marginTop="1rem" />

              {/* Sección de Likes y Comentarios */}
              <Flex
                gap="1rem"
                marginTop="1rem"
                marginBottom="1rem"
                alignItems="center"
              >
                <Button
                  size="small"
                  variation={selectedReport.userHasLiked ? "primary" : "link"}
                  onClick={() => toggleLike(selectedReport.id)}
                >
                  <HeartIcon filled={selectedReport.userHasLiked} />{" "}
                  {selectedReport.likesCount || 0}
                </Button>

                <Flex alignItems="center" gap="0.5rem">
                  <CommentIcon />
                  <Text>{selectedReport.commentsCount || 0} comentarios</Text>
                </Flex>
              </Flex>

              <Divider />

              {/* Sección de comentarios */}
              <Heading level={5} marginTop="1rem">
                Comentarios
              </Heading>

              {/* Formulario para nuevo comentario */}
              <Card variation="outlined" marginTop="1rem" padding="1rem">
                <TextAreaField
                  label=""
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button
                  variation="primary"
                  marginTop="0.5rem"
                  onClick={addComment}
                  isDisabled={!newComment.trim() || submittingComment}
                  isLoading={submittingComment}
                  size="small"
                >
                  Comentar
                </Button>
              </Card>

              {/* Lista de comentarios */}
              {loadingComments ? (
                <Flex justifyContent="center" padding="2rem">
                  <Loader />
                </Flex>
              ) : (
                <View marginTop="1rem">
                  {selectedReport.commentsList &&
                  selectedReport.commentsList.length > 0 ? (
                    selectedReport.commentsList.map((comment) => (
                      <Card
                        key={comment.id}
                        variation="outlined"
                        marginBottom="0.5rem"
                        padding="1rem"
                      >
                        <Flex justifyContent="space-between">
                          <Text fontWeight="bold">
                            {comment.author || "Anónimo"}
                          </Text>
                          <Text fontSize="small" color="gray">
                            {new Date(
                              comment.createdAt || ""
                            ).toLocaleDateString()}
                          </Text>
                        </Flex>
                        <Text marginTop="0.5rem">{comment.content}</Text>
                      </Card>
                    ))
                  ) : (
                    <Text color="gray" textAlign="center" padding="1rem">
                      No hay comentarios aún. ¡Sé el primero en comentar!
                    </Text>
                  )}
                </View>
              )}
            </Card>
          </View>
        ) : (
          <View padding="2rem">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginBottom="1rem"
            >
              <div>
                <Heading level={2}>Reportes Ciudadanos</Heading>
                <Text>
                  Conoce los problemas urbanos que la comunidad ha reportado.
                  Juntos mejoramos nuestras ciudades.
                </Text>
              </div>
              <Button
                variation="primary"
                onClick={() => (window.location.href = "/reportar")}
              >
                ➕ Crear Reporte
              </Button>
            </Flex>

            {error && (
              <Alert variation="error" isDismissible={true} marginBottom="1rem">
                {error}
              </Alert>
            )}

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
                    Mostrando {filteredReports.length} de {reports.length}{" "}
                    reportes
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
                          style={{ cursor: "pointer" }}
                        >
                          {r.imageUrl ? (
                            <Image
                              src={r.imageUrl}
                              alt={r.title || "Reporte"}
                              height="180px"
                              width="100%"
                              objectFit="cover"
                              onClick={() => {
                                setSelectedReport(r);
                                loadCommentsForReport(r.id);
                              }}
                            />
                          ) : (
                            <View
                              height="180px"
                              backgroundColor="var(--amplify-colors-background-secondary)"
                              onClick={() => {
                                setSelectedReport(r);
                                loadCommentsForReport(r.id);
                              }}
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

                            <Heading 
                              level={5}
                              onClick={() => {
                                setSelectedReport(r);
                                loadCommentsForReport(r.id);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {r.title || "Sin título"}
                            </Heading>

                            <Text 
                              fontSize="small"
                              onClick={() => {
                                setSelectedReport(r);
                                loadCommentsForReport(r.id);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {r.description && r.description.length > 90
                                ? `${r.description.slice(0, 90)}...`
                                : r.description || "Sin descripción"}
                            </Text>

                            <Divider marginTop="0.5rem" marginBottom="0.5rem" />

                            <Text 
                              fontSize="small" 
                              color="gray"
                              onClick={() => {
                                setSelectedReport(r);
                                loadCommentsForReport(r.id);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              📍 {r.location || "Ubicación no especificada"}
                            </Text>

                            <Flex
                              justifyContent="space-between"
                              marginTop="0.5rem"
                              alignItems="center"
                            >
                              <Text 
                                fontSize="small" 
                                color="gray"
                                onClick={() => {
                                  setSelectedReport(r);
                                  loadCommentsForReport(r.id);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                📅{" "}
                                {r.date ||
                                  new Date(
                                    r.createdAt || ""
                                  ).toLocaleDateString()}
                              </Text>

                              <Flex gap="0.5rem" alignItems="center">
                                {/* Botón de Like - Clickeable sin abrir detalle */}
                                <Flex 
                                  alignItems="center" 
                                  gap="0.25rem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(r.id);
                                  }}
                                  style={{ cursor: "pointer" }}
                                  padding="0.25rem"
                                >
                                  {r.userHasLiked ? (
                                    <HeartIcon filled={true} />
                                  ) : (
                                    <HeartIcon filled={false} />
                                  )}
                                  <Text fontSize="small">
                                    {r.likesCount || 0}
                                  </Text>
                                </Flex>

                                {/* Contador de comentarios */}
                                <Flex 
                                  alignItems="center" 
                                  gap="0.25rem"
                                  onClick={() => {
                                    setSelectedReport(r);
                                    loadCommentsForReport(r.id);
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  <CommentIcon />
                                  <Text fontSize="small">
                                    {r.commentsCount || 0}
                                  </Text>
                                </Flex>
                              </Flex>
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