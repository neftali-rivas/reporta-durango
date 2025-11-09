"use client";
import { View, Flex, Text, Link, Divider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function Footer() {
  return (
    <View
      as="footer"
      style={{ borderTop: "1px solid var(--amplify-colors-neutral-30)" }}
      backgroundColor="var(--amplify-colors-background-secondary)"
      marginTop="3rem"
      padding="2rem 1rem"
    >
      <View
        maxWidth="80rem"
        margin="0 auto"
      >
        <Flex
          direction={{ base: "column", medium: "row" }}
          justifyContent="space-between"
          wrap="wrap"
          gap="2rem"
        >
          {/* Columna 1 */}
          <Flex direction="column" maxWidth="20rem" gap="0.5rem">
            <Text
              as="h3"
              fontWeight="bold"
              color="var(--amplify-colors-font-primary)"
            >
              ReportaDurango
            </Text>
            <Text
              fontSize="0.875rem"
              color="var(--amplify-colors-font-tertiary)"
            >
              Plataforma ciudadana para reportar problemas urbanos y mejorar
              nuestras comunidades.
            </Text>
          </Flex>

          {/* Columna 2 */}
          <Flex direction="column" gap="0.5rem">
            <Text
              as="h4"
              fontWeight="600"
              color="var(--amplify-colors-font-primary)"
            >
              Enlaces
            </Text>
            <Flex as="ul" direction="column" gap="0.5rem" padding="0" margin="0">
              <Link
                href="/"
                fontSize="0.875rem"
                color="var(--amplify-colors-font-tertiary)"
                style={{ textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-tertiary)")
                }
              >
                Reportes
              </Link>
              <Link
                href="/mapa"
                fontSize="0.875rem"
                color="var(--amplify-colors-font-tertiary)"
                style={{ textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-tertiary)")
                }
              >
                Mapa
              </Link>
              <Link
                href="#"
                fontSize="0.875rem"
                color="var(--amplify-colors-font-tertiary)"
                style={{ textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--amplify-colors-font-tertiary)")
                }
              >
                Sobre Nosotros
              </Link>
            </Flex>
          </Flex>

          {/* Columna 3 */}
          <Flex direction="column" gap="0.5rem">
            <Text
              as="h4"
              fontWeight="600"
              color="var(--amplify-colors-font-primary)"
            >
              Contacto
            </Text>
            <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
              reportes@reportadurango.com
            </Text>
            <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
              +52 (618) 618-6186
            </Text>
          </Flex>
        </Flex>

        {/* Línea divisoria */}
        <Divider marginTop="2rem" />

        {/* Créditos finales */}
        <View textAlign="center" marginTop="2rem">
          <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
            &copy; 2025 ReportaDurango. Todos los derechos reservados.
          </Text>
        </View>
      </View>
    </View>
  );
}
