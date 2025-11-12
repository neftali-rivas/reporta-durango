"use client";
import React, { useState } from "react";
import { View, Flex, Text, Button, Card, Divider, Link as AmplifyLink } from "@aws-amplify/ui-react";

interface HeaderProps {
  isLoggedIn: boolean;
  currentPage: string;
  handleLogout: () => void;
}

export default function Header({ isLoggedIn, currentPage, handleLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--amplify-colors-background-secondary)",
        borderBottom: "1px solid var(--amplify-colors-border-secondary)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Contenedor principal */}
      <Flex
        maxWidth="90rem"
        margin="0 auto"
        padding="0.5rem 1rem"
        justifyContent="space-between"
        alignItems="center"
        height="4rem"
      >
        {/* Logo */}
        <AmplifyLink
          href={isLoggedIn ? "/" : "/"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <View
            width="2rem"
            height="2rem"
            style={{
              borderRadius: "0.5rem",
              backgroundColor: "var(--amplify-colors-brand-primary-80)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
          >
            RM
          </View>
          <Text fontWeight="bold" fontSize="1.25rem" color="brand.primary.100">
            ReportaDurango
          </Text>
        </AmplifyLink>

        {/* Navegación Desktop */}
        <Flex gap="2rem" alignItems="center" display={{ base: "none", medium: "flex" }}>
          {isLoggedIn ? (
            <>
              <AmplifyLink
                href="/"
                style={{
                  color:
                    currentPage === ""
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Reportes
              </AmplifyLink>

              <AmplifyLink
                href="/educa"
                style={{
                  color:
                    currentPage === "educa"
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Tomar acción
              </AmplifyLink>

              <AmplifyLink
                href="/accion"
                style={{
                  color:
                    currentPage === "accion"
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Acción verde
              </AmplifyLink>

              <AmplifyLink
                href="/mapa"
                style={{
                  color:
                    currentPage === "mapa"
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Mapa
              </AmplifyLink>

              <AmplifyLink
                href="/estadisticas"
                style={{
                  color:
                    currentPage === "estadisticas"
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Estadisticas
              </AmplifyLink>
              {/* Menú usuario */}
              <View style={{ position: "relative" }}>
                <Button
                  size="small"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  👤 Mi Perfil
                </Button>

                {userMenuOpen && (
                  <Card
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "2.5rem",
                      width: "12rem",
                      backgroundColor: "var(--amplify-colors-background-primary)",
                      border: "1px solid var(--amplify-colors-border-secondary)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      padding: "0.5rem",
                      zIndex: 200,
                    }}
                  >
                    <AmplifyLink
                      href="/perfil"
                      style={{
                        display: "block",
                        padding: "0.5rem",
                        color: "var(--amplify-colors-font-primary)",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                      }}
                    >
                      Ver Mis Reportes
                    </AmplifyLink>
                    <Divider marginBlock="0.25rem" />
                    <Button
                      onClick={handleLogout}
                      size="small"
                      variation="link"
                      colorTheme="error"
                      style={{ width: "100%", textAlign: "left" }}
                    >
                      Cerrar Sesión
                    </Button>
                  </Card>
                )}
              </View>

              <Button as="a" href="/calendario" variation="primary" size="small">
                📅 Eventos
              </Button>

              <Button as="a" href="/exito" variation="primary" size="small">
                💱 Impacto
              </Button>
            </>
          ) : (
            <>
              <AmplifyLink
                href="/"
                style={{
                  color:
                    currentPage === ""
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Reportes
              </AmplifyLink>
              <AmplifyLink
                href="/mapa"
                style={{
                  color:
                    currentPage === "mapa"
                      ? "var(--amplify-colors-brand-primary-100)"
                      : "var(--amplify-colors-font-tertiary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Mapa
              </AmplifyLink>
            </>
          )}
        </Flex>
      </Flex>

      
    </header>
  );
}
