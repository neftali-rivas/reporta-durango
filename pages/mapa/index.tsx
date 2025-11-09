"use client";
import { useEffect, useRef, useState } from "react";
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
} from "@aws-amplify/ui-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
// Declarar la propiedad L en el objeto window
declare global {
  interface Window {
    L: any;
  }
}

// Tipo de datos
interface Report {
  id: string;
  title: string;
  category:
    | "bache"
    | "alumbrado"
    | "agua"
    | "contaminacion"
    | "basura"
    | "otro";
  status: "pendiente" | "en-proceso" | "resuelto";
  location: string;
  latitude: number;
  longitude: number;
}

// Datos de ejemplo
const reportsWithCoordinates: Report[] = [
  {
    id: "1",
    title: "Bache profundo en Avenida Principal",
    category: "bache",
    status: "pendiente",
    location: "Avenida Principal, Centro",
    latitude: 24.0277,
    longitude: -104.6532,
  },
  {
    id: "2",
    title: "Lámpara dañada en Parque Municipal",
    category: "alumbrado",
    status: "en-proceso",
    location: "Parque Municipal, Sector Norte",
    latitude: 24.035,
    longitude: -104.64,
  },
  {
    id: "3",
    title: "Fuga de agua en Calle Secundaria",
    category: "agua",
    status: "resuelto",
    location: "Calle Secundaria, esquina con 5ª Avenida",
    latitude: 24.022,
    longitude: -104.665,
  },
  {
    id: "4",
    title: "Contaminación en río local",
    category: "contaminacion",
    status: "pendiente",
    location: "Río del Valle, Puente Viejo",
    latitude: 24.015,
    longitude: -104.63,
  },
  {
    id: "5",
    title: "Basura acumulada en área verde",
    category: "basura",
    status: "en-proceso",
    location: "Parque Central",
    latitude: 24.0305,
    longitude: -104.66,
  },
  {
    id: "6",
    title: "Tapa de alcantarilla suelta",
    category: "otro",
    status: "pendiente",
    location: "Calle 8, frente a Mercado",
    latitude: 24.018,
    longitude: -104.655,
  },
];

export default function MapaReportesCiudadanos() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [L, setL] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => {
    console.log("Cerrando sesión...");
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

  // Inicializar mapa
  useEffect(() => {
    if (!mounted || !L || !mapRef.current) return;

    const map = L.map(mapRef.current).setView([24.027, -104.653], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const getMarkerColor = (status: string) => {
      switch (status) {
        case "pendiente":
          return "#f59e0b";
        case "en-proceso":
          return "#3b82f6";
        case "resuelto":
          return "#10b981";
        default:
          return "#6b7280";
      }
    };

    const getCategoryEmoji = (category: string) => {
      const emojiMap: Record<string, string> = {
        bache: "🚗",
        alumbrado: "💡",
        agua: "💧",
        contaminacion: "☁️",
        basura: "🗑️",
        otro: "📍",
      };
      return emojiMap[category] || "📍";
    };

    reportsWithCoordinates.forEach((report) => {
      const color = getMarkerColor(report.status);
      const emoji = getCategoryEmoji(report.category);

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
          `<div style="font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${report.title}</h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Ubicación:</strong> ${report.location}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Estado:</strong> <span style="color: ${color}; font-weight: bold;">${report.status}</span></p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Categoría:</strong> ${report.category}</p>
          </div>`,
        )
        .addTo(map);

      marker.on("click", () => setSelectedReport(report));
    });

    if (reportsWithCoordinates.length > 0) {
      const bounds = L.latLngBounds(
        reportsWithCoordinates.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
    };
  }, [L, mounted]);

  const stats = {
    total: reportsWithCoordinates.length,
    pendiente: reportsWithCoordinates.filter(
      (r) => r.status === "pendiente"
    ).length,
    enProceso: reportsWithCoordinates.filter(
      (r) => r.status === "en-proceso"
    ).length,
    resuelto: reportsWithCoordinates.filter(
      (r) => r.status === "resuelto"
    ).length,
  };

  return (
    <>
    <Header
            isLoggedIn={isLoggedIn}
            currentPage=""
            handleLogout={handleLogout}
          />
      <View padding="2rem" className="map-container">
        <Heading level={2}>Mapa de Reportes Ciudadanos - Durango</Heading>
        <Text marginBottom="1rem">
          Visualiza los problemas urbanos reportados por la comunidad.
        </Text>

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
        {!mounted ? (
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

        {/* Reporte seleccionado */}
        {selectedReport && (
          <Card variation="outlined" padding="1.5rem" borderColor="blue">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4}>{selectedReport.title}</Heading>
              <Button
                onClick={() => setSelectedReport(null)}
                variation="link"
                size="small"
              >
                ✕ Cerrar
              </Button>
            </Flex>
            <Divider marginTop="0.5rem" />
            <Text marginTop="0.5rem">
              <strong>Categoría:</strong> {selectedReport.category}
            </Text>
            <Text>
              <strong>Ubicación:</strong> {selectedReport.location}
            </Text>
            <Badge
              marginTop="0.5rem"
              variation={
                selectedReport.status === "pendiente"
                  ? "error"
                  : selectedReport.status === "resuelto"
                  ? "success"
                  : "info"
              }
            >
              {selectedReport.status}
            </Badge>
          </Card>
        )}
      </View>
      <Footer />

    </>
  );
}
