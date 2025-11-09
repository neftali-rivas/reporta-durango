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
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Header from "../../components/header";
import Footer from "../../components/footer";
// ---------- Componentes internos ----------
type StatusType = "pendiente" | "en-proceso" | "resuelto";
type CategoryType =
  | "bache"
  | "alumbrado"
  | "agua"
  | "contaminacion"
  | "basura"
  | "otro";

function StatusBadge({ status }: { status: StatusType }) {
  const configs: Record<
    StatusType,
    { label: string; background: string; color: string }
  > = {
    pendiente: {
      label: "Pendiente",
      background: "#fde68a",
      color: "#92400e",
    },
    "en-proceso": {
      label: "En Proceso",
      background: "#bfdbfe",
      color: "#1e3a8a",
    },
    resuelto: {
      label: "Resuelto",
      background: "#bbf7d0",
      color: "#065f46",
    },
  };

  const cfg = configs[status];

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

// ---------- Datos simulados ----------
const mockReports = [
  {
    id: "1",
    title: "Bache profundo en Avenida Principal",
    category: "bache",
    status: "pendiente",
    location: "Avenida Principal, Centro",
    description:
      "Se encuentra un bache de aproximadamente 1 metro de profundidad que representa un peligro para conductores.",
    image: "/pothole-street.jpg",
    date: "2025-10-28",
    views: 245,
  },
  {
    id: "2",
    title: "Lámpara dañada en Parque Municipal",
    category: "alumbrado",
    status: "en-proceso",
    location: "Parque Municipal, Sector Norte",
    description:
      "La luminaria no prende durante la noche, dejando oscura una zona de alto tránsito.",
    image: "/broken-street-light.jpg",
    date: "2025-10-27",
    views: 152,
  },
  {
    id: "3",
    title: "Tapa de alcantarilla suelta",
    category: "otro",
    status: "pendiente",
    location: "Calle 8, frente a Mercado",
    description:
      "La tapa del alcantarilla está suelta y representa un peligro para peatones.",
    image: "/manhole-cover-loose.jpg",
    date: "2025-10-23",
    views: 76,
  },
];

// ---------- Página principal ----------
export default function ProfilePage() {
  const handleLogout = () => {
    console.log("Cerrando sesión...");
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [myReports, setMyReports] = useState(mockReports);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      setUserEmail(JSON.parse(user).email || "usuario@ejemplo.com");
    } else {
    }
  }, []);

  const handleMarkComplete = (reportId: string) => {
    setMyReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: "resuelto" } : r
      )
    );
    alert("Reporte marcado como completado");
  };

  const handleDelete = (reportId: string) => {
    if (showDeleteConfirm === reportId) {
      setMyReports((prev) => prev.filter((r) => r.id !== reportId));
      setShowDeleteConfirm(null);
      alert("Reporte eliminado");
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
      {/* Encabezado del perfil */}
      <Card
        variation="outlined"
        marginBottom="2rem"
        padding="2rem"
        borderRadius="1rem"
      >
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

          <Button
            variation="destructive"
          >
            Cerrar sesión
          </Button>
        </Flex>

        <Divider marginTop="1.5rem" marginBottom="1.5rem" />

        <Flex gap="2rem">
          <Flex direction="column">
            <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
              Total de reportes
            </Text>
            <Text fontWeight="bold" fontSize="1.5rem">
              {myReports.length}
            </Text>
          </Flex>
          <Flex direction="column">
            <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
              Completados
            </Text>
            <Text color="green" fontWeight="bold" fontSize="1.5rem">
              {myReports.filter((r) => r.status === "resuelto").length}
            </Text>
          </Flex>
        </Flex>
      </Card>

      {/* Lista de reportes */}
      <Heading level={3} marginBottom="1rem">
        Mis Reportes
      </Heading>

      {myReports.length > 0 ? (
        <Flex direction="column" gap="1rem">
          {myReports.map((report) => (
            <Card
              key={report.id}
              variation="outlined"
              padding="1.5rem"
              borderRadius="1rem"
            >
              <Flex direction={{ base: "column", medium: "row" }} gap="1rem">
                <Image
                  src={report.image}
                  alt={report.title}
                  width="200px"
                  height="120px"
                  borderRadius="0.75rem"
                  objectFit="cover"
                />
                <Flex direction="column" flex="1">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600">{report.title}</Text>
                    <StatusBadge status={report.status as StatusType} />
                  </Flex>
                  <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
                    {report.description}
                  </Text>
                  <Flex gap="1rem" marginTop="0.5rem">
                    <Text fontSize="0.875rem">📍 {report.location}</Text>
                    <CategoryIcon category={report.category as CategoryType} />
                  </Flex>
                </Flex>

                {/* Botones */}
                <Flex direction="column" gap="0.5rem">
                  <Button
                    variation="primary"
                    onClick={() => alert("Editar (en desarrollo)")}
                  >
                    Editar
                  </Button>
                  <Button
                    variation="link"
                    onClick={() => handleMarkComplete(report.id)}
                    isDisabled={report.status === "resuelto"}
                  >
                    {report.status === "resuelto"
                      ? "✓ Completado"
                      : "Marcar completado"}
                  </Button>
                  <Button
                    variation={
                      showDeleteConfirm === report.id ? "destructive" : "link"
                    }
                    onClick={() => handleDelete(report.id)}
                  >
                    {showDeleteConfirm === report.id
                      ? "Confirmar eliminación"
                      : "Eliminar"}
                  </Button>
                  {showDeleteConfirm === report.id && (
                    <Button
                      variation="link"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
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
          <AmplifyLink href="/reportar">Crear nuevo reporte</AmplifyLink>
        </Card>
      )}
    </View>
          <Footer />
    
    </>
  );
}
