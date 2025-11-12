"use client";
import React, { useState } from "react";
import {
  View,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Divider,
  Badge,
} from "@aws-amplify/ui-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function GuiaEducativa() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("como-reportar");

  const handleLogout = async () => {
    // Implementar signOut
  };

  // 📚 Consejos de cómo reportar correctamente
  const reportingTips = [
    {
      icon: "📸",
      title: "Toma fotos claras y cercanas",
      description: "Asegúrate de que la foto muestre claramente el problema. Acércate lo suficiente pero mantén el contexto visible.",
      example: "✅ Foto enfocada del bache con referencia de calle",
    },
    {
      icon: "📍",
      title: "Proporciona ubicación exacta",
      description: "Usa la ubicación GPS o describe con precisión el lugar (calle, entre qué calles, número, referencias cercanas).",
      example: "✅ 'Calle Juárez #123, entre Hidalgo y Morelos, frente al parque'",
    },
    {
      icon: "📝",
      title: "Describe el problema con detalle",
      description: "Explica qué ocurre, desde cuándo, y cómo afecta a la comunidad. Sé específico pero conciso.",
      example: "✅ 'Bache de 50cm en carril derecho, lleva 2 semanas, provoca accidentes'",
    },
    {
      icon: "🏷️",
      title: "Selecciona la categoría correcta",
      description: "Elige la categoría que mejor describa el problema para que llegue al departamento adecuado.",
      example: "✅ Baches → Obras Públicas | Alumbrado → Servicios Públicos",
    },
    {
      icon: "⏰",
      title: "Reporta en tiempo oportuno",
      description: "Reporta problemas nuevos o recientes. Evita reportar lo que ya está en reparación.",
      example: "✅ Reportar cuando aparece el problema",
    },
    {
      icon: "🤝",
      title: "Sé respetuoso y objetivo",
      description: "Usa lenguaje apropiado. El objetivo es resolver problemas, no atacar a personas o instituciones.",
      example: "✅ 'Falta iluminación' en lugar de insultos",
    },
  ];

  // ❌ Qué NO reportar
  const dontReport = [
    {
      icon: "🏠",
      title: "Problemas privados o personales",
      description: "Conflictos vecinales, problemas dentro de tu propiedad, o asuntos que no afectan espacios públicos.",
      examples: ["Ruidos de vecinos", "Problemas en tu casa", "Disputas personales"],
    },
    {
      icon: "🚨",
      title: "Emergencias inmediatas",
      description: "Situaciones que requieren atención urgente de emergencias (incendios, crímenes, accidentes graves).",
      examples: ["Incendios activos", "Crímenes en progreso", "Accidentes con heridos"],
      action: "🚨 Llama al 911",
    },
    {
      icon: "🔁",
      title: "Reportes duplicados",
      description: "Problemas que ya han sido reportados recientemente por otros ciudadanos.",
      examples: ["Revisar reportes existentes antes de crear uno nuevo"],
    },
    {
      icon: "🏗️",
      title: "Obras en progreso",
      description: "Trabajos de reparación o construcción que ya están siendo atendidos por las autoridades.",
      examples: ["Calles en reparación", "Obras con señalización oficial"],
    },
    {
      icon: "🤔",
      title: "Reportes falsos o bromas",
      description: "Información falsa, exagerada o reportes sin fundamento solo desperdician recursos públicos.",
      examples: ["Nunca reportar problemas inexistentes"],
    },
    {
      icon: "📋",
      title: "Solicitudes fuera de alcance",
      description: "Peticiones que no son responsabilidad del gobierno local o que requieren trámites específicos.",
      examples: ["Solicitudes de permisos", "Trámites administrativos", "Servicios federales"],
    },
  ];

  // 🛡️ Consejos de seguridad
  const safetyTips = [
    {
      icon: "🔒",
      title: "Protege tu privacidad",
      description: "No compartas información personal sensible en los reportes (números telefónicos, direcciones de casa, datos bancarios).",
      level: "Crítico",
    },
    {
      icon: "👤",
      title: "Reporta de forma anónima si es necesario",
      description: "Si te sientes inseguro, puedes reportar sin proporcionar tu nombre. Tu seguridad es lo primero.",
      level: "Importante",
    },
    {
      icon: "🚫",
      title: "No te pongas en riesgo",
      description: "No te acerques a situaciones peligrosas solo para tomar fotos. Reporta desde una distancia segura.",
      level: "Crítico",
    },
    {
      icon: "🌙",
      title: "Ten cuidado en horarios nocturnos",
      description: "Si necesitas reportar algo de noche, hazlo desde lugares iluminados y seguros. Evita zonas solitarias.",
      level: "Importante",
    },
    {
      icon: "📱",
      title: "Cuida tus dispositivos",
      description: "Al tomar fotos en la calle, mantén atención a tu entorno para evitar robos de celular.",
      level: "Importante",
    },
    {
      icon: "⚠️",
      title: "No interfieras con la propiedad",
      description: "No muevas objetos, no entres a propiedades privadas ni alteres la escena del problema.",
      level: "Importante",
    },
  ];

  // 🎓 Principios de civismo
  const civismPrinciples = [
    {
      icon: "🤝",
      title: "Responsabilidad compartida",
      description: "Todos somos responsables de mantener nuestras ciudades en buen estado. Un reporte bien hecho ayuda a todos.",
    },
    {
      icon: "💬",
      title: "Comunicación constructiva",
      description: "Usa un lenguaje respetuoso y propositivo. Las autoridades son aliadas en la solución de problemas.",
    },
    {
      icon: "👁️",
      title: "Veracidad ante todo",
      description: "Reporta solo lo que has visto y verificado. La información falsa perjudica a la comunidad.",
    },
    {
      icon: "⚖️",
      title: "Justicia y equidad",
      description: "Reporta problemas que afectan a la comunidad, sin discriminación ni favoritismos.",
    },
    {
      icon: "🌱",
      title: "Sostenibilidad urbana",
      description: "Piensa en el impacto a largo plazo. Reporta también problemas ambientales que afectan la calidad de vida.",
    },
    {
      icon: "📊",
      title: "Seguimiento responsable",
      description: "Revisa el estado de tus reportes. Si hay cambios, actualiza o cierra reportes resueltos.",
    },
  ];

  const getLevelColor = (level: string) => {
    if (level === "Crítico") return "error";
    if (level === "Importante") return "warning";
    return "info";
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentPage="guia"
        handleLogout={handleLogout}
      />

      <main>
        <View padding="2rem" maxWidth="1200px" margin="0 auto">
          {/* Hero Section */}
          <Card variation="elevated" padding="2rem" marginBottom="2rem" backgroundColor="var(--amplify-colors-blue-10)">
            <Flex direction="column" alignItems="center" textAlign="center">
              <Text fontSize="4rem" marginBottom="1rem">📚</Text>
              <Heading level={1}>Guía del Ciudadano Responsable</Heading>
              <Text fontSize="large" marginTop="1rem" maxWidth="800px">
                Aprende a reportar problemas urbanos de forma efectiva y segura. 
                Tu participación ciudadana hace la diferencia en nuestra comunidad.
              </Text>
            </Flex>
          </Card>

          {/* Navegación de Tabs Manual */}
          <Card variation="outlined" marginBottom="2rem">
            <Flex gap="0" wrap="wrap">
              <Button
                variation={activeTab === "como-reportar" ? "primary" : "link"}
                onClick={() => setActiveTab("como-reportar")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                ✅ Cómo Reportar
              </Button>
              <Button
                variation={activeTab === "que-no-reportar" ? "primary" : "link"}
                onClick={() => setActiveTab("que-no-reportar")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                ❌ Qué NO Reportar
              </Button>
              <Button
                variation={activeTab === "seguridad" ? "primary" : "link"}
                onClick={() => setActiveTab("seguridad")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                🛡️ Seguridad
              </Button>
              <Button
                variation={activeTab === "civismo" ? "primary" : "link"}
                onClick={() => setActiveTab("civismo")}
                flex="1"
                style={{ borderRadius: 0 }}
              >
                🎓 Civismo
              </Button>
            </Flex>
          </Card>

          {/* Contenido según tab activo */}
          {activeTab === "como-reportar" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                📝 Guía para Reportar Correctamente
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Sigue estos consejos para crear reportes efectivos que ayuden a resolver problemas más rápido.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {reportingTips.map((tip, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start">
                      <Text fontSize="2.5rem">{tip.icon}</Text>
                      <View flex="1">
                        <Heading level={4}>{tip.title}</Heading>
                        <Text marginTop="0.5rem">{tip.description}</Text>
                        <Card variation="elevated" marginTop="1rem" padding="1rem" backgroundColor="var(--amplify-colors-green-10)">
                          <Text fontSize="small">
                            <strong>Ejemplo:</strong> {tip.example}
                          </Text>
                        </Card>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </View>
          )}

          {activeTab === "que-no-reportar" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🚫 Evita Estos Tipos de Reportes
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Estos problemas requieren otros canales o no son apropiados para el sistema de reportes ciudadanos.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {dontReport.map((item, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start">
                      <Text fontSize="2.5rem">{item.icon}</Text>
                      <View flex="1">
                        <Heading level={4}>{item.title}</Heading>
                        <Text marginTop="0.5rem">{item.description}</Text>
                        
                        {item.action && (
                          <Badge variation="error" marginTop="1rem" size="large">
                            {item.action}
                          </Badge>
                        )}

                        <Divider marginTop="1rem" marginBottom="1rem" />
                        
                        <Text fontSize="small" color="gray">
                          <strong>Ejemplos:</strong>
                        </Text>
                        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                          {item.examples.map((ex, i) => (
                            <li key={i}>
                              <Text fontSize="small">{ex}</Text>
                            </li>
                          ))}
                        </ul>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </View>
          )}

          {activeTab === "seguridad" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🛡️ Consejos de Seguridad Personal
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Tu seguridad es lo más importante. Sigue estas recomendaciones al crear reportes.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {safetyTips.map((tip, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start" wrap="wrap">
                      <Text fontSize="2.5rem">{tip.icon}</Text>
                      <View flex="1">
                        <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap="0.5rem">
                          <Heading level={4}>{tip.title}</Heading>
                          <Badge variation={getLevelColor(tip.level)}>
                            {tip.level}
                          </Badge>
                        </Flex>
                        <Text marginTop="0.5rem">{tip.description}</Text>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>

              {/* Números de Emergencia */}
              <Card variation="elevated" marginTop="2rem" padding="1.5rem" backgroundColor="var(--amplify-colors-red-10)">
                <Heading level={4}>🚨 Números de Emergencia</Heading>
                <Flex direction="column" gap="0.5rem" marginTop="1rem">
                  <Text><strong>Emergencias generales:</strong> 911</Text>
                  <Text><strong>Cruz Roja:</strong> 065</Text>
                  <Text><strong>Bomberos:</strong> 068</Text>
                  <Text><strong>Protección Civil:</strong> Consulta número local</Text>
                </Flex>
                <Text fontSize="small" marginTop="1rem" color="gray">
                  * Usa estos números solo para emergencias reales que requieran atención inmediata
                </Text>
              </Card>
            </View>
          )}

          {activeTab === "civismo" && (
            <View padding="1rem">
              <Heading level={2} marginBottom="1rem">
                🎓 Principios de Civismo y Participación
              </Heading>
              <Text marginBottom="2rem" color="gray">
                Ser un ciudadano responsable va más allá de reportar problemas. Estos principios nos guían.
              </Text>

              <Flex direction="column" gap="1.5rem">
                {civismPrinciples.map((principle, index) => (
                  <Card key={index} variation="outlined" padding="1.5rem">
                    <Flex gap="1rem" alignItems="flex-start">
                      <Text fontSize="2.5rem">{principle.icon}</Text>
                      <View flex="1">
                        <Heading level={4}>{principle.title}</Heading>
                        <Text marginTop="0.5rem">{principle.description}</Text>
                      </View>
                    </Flex>
                  </Card>
                ))}
              </Flex>

              {/* Quote inspiracional */}
              <Card variation="elevated" marginTop="2rem" padding="2rem" textAlign="center" backgroundColor="var(--amplify-colors-purple-10)">
                <Text fontSize="xx-large">💡</Text>
                <Text fontSize="large" fontStyle="italic" marginTop="1rem">
  &quot;Una ciudad es tan buena como la participación de sus ciudadanos. 
  Cada reporte es un acto de amor hacia nuestra comunidad.&quot;
</Text>
              </Card>
            </View>
          )}

          {/* Call to Action */}
          <Card variation="elevated" padding="2rem" marginTop="2rem" textAlign="center">
            <Heading level={3}>¿Listo para reportar de forma responsable?</Heading>
            <Text marginTop="1rem" marginBottom="2rem">
              Ahora que conoces las mejores prácticas, ayuda a mejorar tu comunidad
            </Text>
            <Flex justifyContent="center" gap="1rem" wrap="wrap">
              <Button
                variation="primary"
                size="large"
                onClick={() => window.location.href = "/reportar"}
              >
                ➕ Crear un Reporte
              </Button>
              <Button
                variation="link"
                size="large"
                onClick={() => window.location.href = "/"}
              >
                👁️ Ver Reportes Existentes
              </Button>
            </Flex>
          </Card>
        </View>
      </main>

      <Footer />
    </>
  );
}