"use client";
import { useEffect, useRef, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { signOut } from "aws-amplify/auth";
import {
  View,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Badge,
  Divider,
  Loader,
  Alert,
  SelectField,
} from "@aws-amplify/ui-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

const client = generateClient<Schema>();

// Declarar la propiedad L en el objeto window
declare global {
  interface Window {
    L: any;
  }
}

type Report = Schema["Report"]["type"];

export default function MapaReportesCiudadanos() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Estados
  const [L, setL] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const handleLogout = async () => {
      await signOut(); 
    };

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    setMounted(true);

    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        script.onload = () => setL(window.L);
        document.body.appendChild(script);
      } else {
        setL(window.L);
      }
    };

    loadLeaflet();
  }, []);

  // 📥 Cargar reportes desde Amplify
  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const { data: reportsData, errors } = await client.models.Report.list({
        limit: 200,
      });

      if (errors) {
        console.error("Errores al cargar reportes:", errors);
        throw new Error("Error al cargar los reportes");
      }

      // Filtrar solo reportes con coordenadas
      const reportsWithCoords = reportsData.filter(
        (r) => r.latitude != null && r.longitude != null
      );

      console.log(
        `📍 Reportes con coordenadas: ${reportsWithCoords.length} de ${reportsData.length}`
      );

      setReports(reportsWithCoords);
    } catch (err: any) {
      console.error("❌ Error cargando reportes:", err);
      setError(err.message || "Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  }

  // 🔄 Suscripción a cambios en tiempo real
  useEffect(() => {
    const subscription = client.models.Report.observeQuery().subscribe({
      next: ({ items }) => {
        const reportsWithCoords = items.filter(
          (r) => r.latitude != null && r.longitude != null
        );
        console.log("🔄 Reportes actualizados:", reportsWithCoords.length);
        setReports(reportsWithCoords);
      },
      error: (error) => {
        console.error("❌ Error en suscripción:", error);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🗺️ Inicializar y actualizar mapa
  useEffect(() => {
    if (!mounted || !L || !mapRef.current || reports.length === 0) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Crear mapa si no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([24.027, -104.653], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Funciones auxiliares
    const getMarkerColor = (status: string | null) => {
      switch (status?.toLowerCase()) {
        case "pendiente":
          return "#f59e0b";
        case "en progreso":
        case "en proceso":
          return "#3b82f6";
        case "resuelto":
          return "#10b981";
        default:
          return "#6b7280";
      }
    };

    const getCategoryEmoji = (category: string | null) => {
      const emojiMap: Record<string, string> = {
        bache: "🚗",
        alumbrado: "💡",
        agua: "💧",
        contaminacion: "☁️",
        basura: "🗑️",
        otro: "📍",
      };
      return emojiMap[category?.toLowerCase() || "otro"] || "📍";
    };

    // Filtrar reportes según filtros activos
    const filteredReports = reports.filter((r) => {
      const matchCategory =
        filterCategory === "Todos" ||
        r.category?.toLowerCase() === filterCategory.toLowerCase();
      const matchStatus =
        filterStatus === "Todos" ||
        r.status?.toLowerCase() === filterStatus.toLowerCase();
      return matchCategory && matchStatus;
    });

    // Agregar marcadores
    filteredReports.forEach((report) => {
      if (report.latitude == null || report.longitude == null) return;

      const color = getMarkerColor(report.status ?? null);
      const emoji = getCategoryEmoji(report.category ?? null);

      const markerHtml = `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          font-size: 20px;
        ">
          ${emoji}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        iconSize: [40, 40],
        className: "custom-marker",
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon: customIcon,
      })
        .bindPopup(
          `<div style="font-family: sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${
              report.title || "Sin título"
            }</h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Ubicación:</strong> ${
              report.location || "No especificada"
            }</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Estado:</strong> <span style="color: ${color}; font-weight: bold;">${
            report.status || "Pendiente"
          }</span></p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Categoría:</strong> ${
              report.category || "Otro"
            }</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Fecha:</strong> ${
              report.date ||
              new Date(report.createdAt || "").toLocaleDateString()
            }</p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">Click para ver detalles</p>
          </div>`
        )
        .addTo(map);

      marker.on("click", () => setSelectedReport(report));
      markersRef.current.push(marker);
    });

    // Ajustar vista del mapa a los marcadores
    if (filteredReports.length > 0) {
      const validCoords = filteredReports
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => [r.latitude!, r.longitude!]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      // No destruimos el mapa, solo limpiamos marcadores
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [L, mounted, reports, filterCategory, filterStatus]);

  // Limpiar mapa al desmontar
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 📊 Calcular estadísticas
  const stats = {
    total: reports.length,
    pendiente: reports.filter(
      (r) => r.status?.toLowerCase() === "pendiente"
    ).length,
    enProceso: reports.filter((r) =>
      ["en proceso", "en progreso"].includes(r.status?.toLowerCase() || "")
    ).length,
    resuelto: reports.filter((r) => r.status?.toLowerCase() === "resuelto")
      .length,
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentPage=""
        handleLogout={handleLogout}
      />
      <View padding="2rem" className="map-container">
        <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem" wrap="wrap">
          <div>
            <Heading level={2}>Mapa de Reportes Ciudadanos - Durango</Heading>
            <Text>
              Visualiza los problemas urbanos reportados por la comunidad.
            </Text>
          </div>
          <Button
            variation="primary"
            onClick={() => (window.location.href = "/create")}
          >
            ➕ Crear Reporte
          </Button>
        </Flex>

        {/* Mensajes de error */}
        {error && (
          <Alert variation="error" isDismissible={true} marginBottom="1rem">
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Flex gap="1rem" marginBottom="1rem" wrap="wrap">
          <SelectField
            label="Categoría"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            width="200px"
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            width="200px"
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Resuelto">Resuelto</option>
          </SelectField>

          <Button
            variation="link"
            onClick={loadReports}
            marginTop="1.5rem"
          >
            🔄 Recargar
          </Button>
        </Flex>

        {/* Estadísticas */}
        <Flex wrap="wrap" gap="1rem" marginBottom="1rem">
          <Card variation="outlined" width="200px">
            <Heading level={5}>{stats.total}</Heading>
            <Text color="gray">Total de reportes</Text>
          </Card>
          <Card variation="outlined" width="200px">
            <Heading level={5} color="orange">
              {stats.pendiente}
            </Heading>
            <Text color="gray">Pendientes</Text>
          </Card>
          <Card variation="outlined" width="200px">
            <Heading level={5} color="blue">
              {stats.enProceso}
            </Heading>
            <Text color="gray">En proceso</Text>
          </Card>
          <Card variation="outlined" width="200px">
            <Heading level={5} color="green">
              {stats.resuelto}
            </Heading>
            <Text color="gray">Resueltos</Text>
          </Card>
        </Flex>

        {/* Mapa */}
        {loading ? (
          <Flex
            justifyContent="center"
            alignItems="center"
            padding="3rem"
            border="1px solid #ccc"
            borderRadius="medium"
            height="500px"
            marginBottom="2rem"
          >
            <div style={{ textAlign: "center" }}>
              <Loader size="large" />
              <Text marginTop="1rem">Cargando reportes del mapa...</Text>
            </div>
          </Flex>
        ) : reports.length === 0 ? (
          <View
            border="1px solid #ccc"
            borderRadius="medium"
            height="500px"
            marginBottom="2rem"
            backgroundColor="var(--amplify-colors-background-secondary)"
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              textAlign="center"
            >
              <div>
                <Text fontSize="3rem">🗺️</Text>
                <Heading level={4}>No hay reportes con ubicación</Heading>
                <Text color="gray">
                  Los reportes con coordenadas GPS aparecerán aquí
                </Text>
                <Button
                  variation="primary"
                  marginTop="1rem"
                  onClick={() => (window.location.href = "/create")}
                >
                  Crear primer reporte
                </Button>
              </div>
            </Flex>
          </View>
        ) : !mounted ? (
          <Loader size="large" variation="linear" />
        ) : (
          <View
            ref={mapRef}
            border="1px solid #ccc"
            borderRadius="medium"
            height="500px"
            marginBottom="2rem"
          />
        )}

        {/* Leyenda del mapa */}
        {reports.length > 0 && (
          <Card variation="outlined" padding="1rem" marginBottom="2rem">
            <Heading level={5}>Leyenda</Heading>
            <Flex gap="2rem" marginTop="0.5rem" wrap="wrap">
              <Flex alignItems="center" gap="0.5rem">
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                  }}
                />
                <Text fontSize="small">Pendiente</Text>
              </Flex>
              <Flex alignItems="center" gap="0.5rem">
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                />
                <Text fontSize="small">En proceso</Text>
              </Flex>
              <Flex alignItems="center" gap="0.5rem">
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                <Text fontSize="small">Resuelto</Text>
              </Flex>
            </Flex>
          </Card>
        )}

        {/* Reporte seleccionado */}
        {selectedReport && (
          <Card variation="outlined" padding="1.5rem" borderColor="blue">
            <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
              <Heading level={4}>{selectedReport.title || "Sin título"}</Heading>
              <Button
                onClick={() => setSelectedReport(null)}
                variation="link"
                size="small"
              >
                ✕ Cerrar
              </Button>
            </Flex>
            <Divider marginTop="0.5rem" marginBottom="0.5rem" />

            <Flex direction="column" gap="0.5rem">
              <Text>
                <strong>Categoría:</strong> {selectedReport.category || "Otro"}
              </Text>
              <Text>
                <strong>Ubicación:</strong>{" "}
                {selectedReport.location || "No especificada"}
              </Text>
              <Text>
                <strong>Coordenadas:</strong> {selectedReport.latitude},{" "}
                {selectedReport.longitude}
              </Text>
              <Text>
                <strong>Autor:</strong> {selectedReport.author || "Anónimo"}
              </Text>
              <Text>
                <strong>Fecha:</strong>{" "}
                {selectedReport.date ||
                  new Date(selectedReport.createdAt || "").toLocaleDateString()}
              </Text>
              {selectedReport.description && (
                <Text>
                  <strong>Descripción:</strong> {selectedReport.description}
                </Text>
              )}

              <Flex gap="0.5rem" marginTop="0.5rem" alignItems="center">
                <Badge
                  variation={
                    selectedReport.status?.toLowerCase() === "pendiente"
                      ? "error"
                      : selectedReport.status?.toLowerCase() === "resuelto"
                      ? "success"
                      : "info"
                  }
                >
                  {selectedReport.status || "Pendiente"}
                </Badge>
              </Flex>
            </Flex>
          </Card>
        )}
      </View>
      <Footer />
    </>
  );
}