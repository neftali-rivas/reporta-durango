"use client";
import React, { useState } from "react";
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
} from "@aws-amplify/ui-react";
import Header from "../components/header";
import Footer from "../components/footer";

interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "Pendiente" | "En Proceso" | "Resuelto";
  location: string;
  image: string;
  author: string;
  date: string;
}

export default function ReportesCiudadanos() {
  const [category, setCategory] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Simulación de sesión iniciada
  const isLoggedIn = true;

  const handleLogout = () => {
    console.log("Cerrando sesión...");
  };

  // Datos de ejemplo
  const reports: Report[] = [
    {
      id: 1,
      title: "Bache profundo en Avenida Principal",
      description:
        "Se encuentra un bache de aproximadamente 1 metro de profundidad que representa un peligro para conductores. He visto varios accidentes en esta zona. El bache crece cada día con las lluvias.",
      category: "Bache",
      status: "Pendiente",
      location: "Avenida Principal 456, Centro",
      image:
        "https://images.unsplash.com/photo-1618058733369-31e379945d95?auto=format&fit=crop&w=1200&q=80",
      author: "Carlos García",
      date: "2025-10-28",
    },
    {
      id: 2,
      title: "Lámpara dañada en Parque Municipal",
      description:
        "La luminaria no prende durante la noche, dejando oscura una zona de alto tránsito. Esto representa un riesgo para peatones y conductores.",
      category: "Alumbrado",
      status: "En Proceso",
      location: "Parque Municipal, Sector Norte",
      image:
        "https://images.unsplash.com/photo-1604871000636-43eecf59d06c?auto=format&fit=crop&w=1200&q=80",
      author: "Ana Pérez",
      date: "2025-10-20",
    },
    {
      id: 3,
      title: "Basura acumulada en la esquina del mercado",
      description:
        "Se ha acumulado basura por más de una semana, generando mal olor y presencia de animales. Se requiere recolección urgente.",
      category: "Basura",
      status: "Resuelto",
      location: "Calle Juárez y Morelos, Centro",
      image:
        "https://images.unsplash.com/photo-1565374395542-0ce18882c857?auto=format&fit=crop&w=1200&q=80",
      author: "Luis Fernández",
      date: "2025-09-15",
    },
  ];

  const filteredReports = reports.filter((r) => {
    const matchCategory = category === "Todos" || r.category === category;
    const matchStatus = status === "Todos" || r.status === status;
    return matchCategory && matchStatus;
  });

  return (
    <>
      {/* 🧭 Header */}
      <Header
        isLoggedIn={isLoggedIn}
        currentPage=""
        handleLogout={handleLogout}
      />

      <main>
        {/* Vista detalle o lista */}
        {selectedReport ? (
          <View padding="2rem">
            <Button onClick={() => setSelectedReport(null)} variation="link">
              ← Volver a los reportes
            </Button>

            <Card variation="outlined" marginTop="1rem" padding="1.5rem" className="card">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={3}>{selectedReport.title}</Heading>
                <Badge
                  variation={
                    selectedReport.status === "Pendiente"
                      ? "error"
                      : selectedReport.status === "Resuelto"
                      ? "success"
                      : "info"
                  }
                >
                  {selectedReport.status}
                </Badge>
              </Flex>

              <Flex alignItems="center" gap="1rem" marginTop="0.5rem">
                <Text>👤 {selectedReport.author}</Text>
                <Text color="gray">{selectedReport.date}</Text>
              </Flex>

              <Image
                src={selectedReport.image}
                alt={selectedReport.title}
                marginTop="1rem"
                borderRadius="medium"
                height="400px"
                objectFit="cover"
              />

              <Flex gap="2rem" marginTop="1rem">
                <Text>
                  🚗 Categoría: <strong>{selectedReport.category}</strong>
                </Text>
                <Text>
                  📍 Ubicación: <strong>{selectedReport.location}</strong>
                </Text>
              </Flex>

              <Divider marginTop="1rem" />
              <Heading level={5} marginTop="1rem">
                Descripción
              </Heading>
              <Text>{selectedReport.description}</Text>
            </Card>
          </View>
        ) : (
          <View padding="2rem">
            <Heading level={2}>Reportes Ciudadanos</Heading>
            <Text marginBottom="1rem">
              Conoce los problemas urbanos que la comunidad ha reportado. Juntos mejoramos nuestras ciudades.
            </Text>

            <Flex gap="2rem" alignItems="flex-start">
              {/* Panel de filtros */}
              <View width="250px">
                <Heading level={4}>Categorías</Heading>
                <SelectField
                  label="Selecciona categoría"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Bache">Baches</option>
                  <option value="Alumbrado">Alumbrado</option>
                  <option value="Agua">Agua</option>
                  <option value="Contaminación">Contaminación</option>
                  <option value="Basura">Basura</option>
                </SelectField>

                <Heading level={4} marginTop="1rem">
                  Estado
                </Heading>
                <SelectField
                  label="Selecciona estado"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Resuelto">Resuelto</option>
                </SelectField>
              </View>

              {/* Lista de reportes */}
              <ScrollView width="100%" height="70vh">
                <Flex wrap="wrap" gap="1rem">
                  {filteredReports.map((r) => (
                    <Card
                      className="card"
                      key={r.id}
                      variation="outlined"
                      width="300px"
                      onClick={() => setSelectedReport(r)}
                    >
                      <Image
                        src={r.image}
                        alt={r.title}
                        height="180px"
                        objectFit="cover"
                      />
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        marginTop="0.5rem"
                      >
                        <Text fontWeight="bold">{r.category}</Text>
                        <Badge
                          variation={
                            r.status === "Pendiente"
                              ? "error"
                              : r.status === "Resuelto"
                              ? "success"
                              : "info"
                          }
                        >
                          {r.status}
                        </Badge>
                      </Flex>
                      <Heading level={5}>{r.title}</Heading>
                      <Text>{r.description.slice(0, 90)}...</Text>
                      <Divider marginTop="0.5rem" />
                      <Text fontSize="small" color="gray">
                        📍 {r.location}
                      </Text>
                    </Card>
                  ))}
                </Flex>
              </ScrollView>
            </Flex>
          </View>
        )}
      </main>

      {/* 🧭 Footer */}
      <Footer />
    </>
  );
}
