"use client";
import React, { useState } from "react";
import {
  View,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Badge,
  Divider,
} from "@aws-amplify/ui-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function AccionVerdeCiudadana() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    // Implementar signOut si aplica
  };

  // 🌍 Datos simulados del panel ambiental
  const environmentalData = [
    { icon: "🌫️", title: "Calidad del Aire", value: "Moderada (AQI: 78)", trend: "↗️ Mejorando", color: "warning" as const },
    { icon: "🔊", title: "Ruido Ambiental", value: "65 dB (Zona urbana)", trend: "↘️ Disminuyendo", color: "info" as const },
    { icon: "🗑️", title: "Gestión de Basura", value: "85% de recolección semanal", trend: "↗️ En mejora", color: "success" as const },
  ];

  // 🌱 Proyectos y retos ciudadanos
  const ecoProjects = [
    {
      icon: "🌳",
      title: "Reforestando Juntos",
      description: "Campaña de reforestación en parques locales. Se han plantado 1,200 árboles este mes.",
      status: "Activo",
    },
    {
      icon: "🚮",
      title: "Limpieza Comunitaria",
      description: "Vecinos se organizan cada sábado para limpiar calles y recolectar plásticos reciclables.",
      status: "En curso",
    },
    {
      icon: "🚴‍♀️",
      title: "Reto: Semana sin Auto",
      description: "Únete al reto de usar bicicleta o transporte público durante una semana completa.",
      status: "Reto del mes",
    },
  ];

  // 🤝 Colaboraciones y aliados
  const allies = [
    {
      logo: "🌿",
      name: "EcoVida A.C.",
      description: "ONG dedicada a la educación ambiental y reciclaje urbano.",
      type: "Organización civil",
    },
    {
      logo: "🏛️",
      name: "Municipio Verde",
      description: "Colaboración con el ayuntamiento para mejorar la gestión de residuos.",
      type: "Convenio municipal",
    },
    {
      logo: "🎓",
      name: "Universidad Sustentable",
      description: "Alianza con estudiantes para monitorear calidad del aire con sensores IoT.",
      type: "Institución educativa",
    },
    {
      logo: "🏢",
      name: "EcoTech Solutions",
      description: "Empresa que dona sensores de aire y software para el monitoreo ambiental.",
      type: "Empresa aliada",
    },
  ];

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentPage="accion-verde"
        handleLogout={handleLogout}
      />

      <main>
        <View padding="2rem" maxWidth="1200px" margin="0 auto">
          {/* Hero Section */}
          <Card
            variation="elevated"
            padding="2rem"
            marginBottom="2rem"
            backgroundColor="var(--amplify-colors-green-10)"
          >
            <Flex direction="column" alignItems="center" textAlign="center">
              <Text fontSize="4rem" marginBottom="1rem">
                🌿
              </Text>
              <Heading level={1}>Acción Verde Ciudadana</Heading>
              <Text fontSize="large" marginTop="1rem" maxWidth="800px">
                Participa en proyectos ecológicos, conoce el estado ambiental de
                tu zona y descubre aliados que construyen un futuro más
                sustentable.
              </Text>
            </Flex>
          </Card>

          {/* Navegación de Tabs */}
          <Card variation="outlined" marginBottom="2rem">
            <Flex gap="0" wrap="wrap">
              <Button
                variation={activeTab === "dashboard" ? "primary" : "link"}
                onClick={() => setActiveTab("dashboard")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                🌍 Panel Ambiental
              </Button>
              <Button
                variation={activeTab === "proyectos" ? "primary" : "link"}
                onClick={() => setActiveTab("proyectos")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                🌱 Proyectos y Retos
              </Button>
              <Button
                variation={activeTab === "aliados" ? "primary" : "link"}
                onClick={() => setActiveTab("aliados")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                🤝 Colaboraciones y Aliados
              </Button>
            </Flex>
          </Card>

          {/* Panel Ambiental */}
          {activeTab === "dashboard" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🌍 Estado Ambiental Actual
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Datos recopilados de sensores locales y APIs públicas.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {environmentalData.map((item, index) => (
                  <Card
                    key={index}
                    variation="outlined"
                    padding="1.5rem"
                    backgroundColor="var(--amplify-colors-green-5)"
                  >
                    <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
                      <Flex alignItems="center" gap="1rem">
                        <Text fontSize="2.5rem">{item.icon}</Text>
                        <View>
                          <Heading level={4}>{item.title}</Heading>
                          <Text marginTop="0.5rem">{item.value}</Text>
                        </View>
                      </Flex>
                      <Badge variation={item.color}>{item.trend}</Badge>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </View>
          )}

          {/* Proyectos y Retos */}
          {activeTab === "proyectos" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🌱 Proyectos y Retos Ciudadanos
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Iniciativas ecológicas activas y desafíos mensuales para cuidar
                el planeta.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {ecoProjects.map((project, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start">
                      <Text fontSize="2.5rem">{project.icon}</Text>
                      <View flex="1">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Heading level={4}>{project.title}</Heading>
                          <Badge variation="success">{project.status}</Badge>
                        </Flex>
                        <Text marginTop="0.5rem">{project.description}</Text>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>

              {/* CTA para unirse */}
              <Card
                variation="elevated"
                marginTop="2rem"
                padding="2rem"
                textAlign="center"
                backgroundColor="var(--amplify-colors-green-10)"
              >
                <Heading level={3}>💪 Únete a la acción verde</Heading>
                <Text marginTop="1rem" marginBottom="2rem">
                  Participa en actividades y retos para mejorar tu entorno.
                </Text>
              </Card>
            </View>
          )}

          {/* Colaboraciones y Aliados */}
          {activeTab === "aliados" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🤝 Colaboraciones y Aliados
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Conoce las organizaciones, instituciones y empresas que apoyan
                la causa ambiental.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {allies.map((ally, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start">
                      <Text fontSize="2.5rem">{ally.logo}</Text>
                      <View flex="1">
                        <Heading level={4}>{ally.name}</Heading>
                        <Badge variation="info" marginTop="0.5rem">
                          {ally.type}
                        </Badge>
                        <Text marginTop="0.5rem">{ally.description}</Text>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>

              <Divider marginTop="2rem" marginBottom="2rem" />

              <Card variation="elevated" textAlign="center" padding="2rem" backgroundColor="var(--amplify-colors-teal-10)">
                <Heading level={3}>🌎 ¿Tu organización quiere sumarse?</Heading>
                <Text marginTop="1rem" marginBottom="2rem">
                  Fomenta el cambio colaborando con proyectos ambientales locales.
                </Text>
              </Card>
            </View>
          )}
        </View>
      </main>

      <Footer />
    </>
  );
}
