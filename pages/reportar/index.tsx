"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  View,
  Text,
  Button,
  Flex,
  TextField,
  TextAreaField,
  Image,
  Card,
} from "@aws-amplify/ui-react"
import "@aws-amplify/ui-react/styles.css"
import Header from "../../components/header";
import Footer from "../../components/footer";

type CategoryType =
  | "bache"
  | "alumbrado"
  | "agua"
  | "contaminacion"
  | "basura"
  | "otro"

export default function CreateReportPage() {
  const handleLogout = () => {
    console.log("Cerrando sesión...");
  };
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<CategoryType>("bache")
  const [location, setLocation] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const categories = [
    { id: "bache" as const, label: "Bache", emoji: "🚗" },
    { id: "alumbrado" as const, label: "Alumbrado", emoji: "💡" },
    { id: "agua" as const, label: "Fuga de Agua", emoji: "💧" },
    { id: "contaminacion" as const, label: "Contaminación", emoji: "☁️" },
    { id: "basura" as const, label: "Basura", emoji: "🗑️" },
    { id: "otro" as const, label: "Otro", emoji: "📍" },
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert("¡Reporte enviado exitosamente!")
      setTitle("")
      setDescription("")
      setLocation("")
      setImage(null)
    }, 1500)
  }

  return (
    <>
    <Header
        isLoggedIn={isLoggedIn}
        currentPage=""
        handleLogout={handleLogout}
      />
    <View as="main" padding="2rem 1rem" maxWidth="40rem" margin="0 auto">
      {/* Header */}
      <View marginBottom="2rem">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Text
            as="span"
            color="var(--amplify-colors-brand-primary-60)"
            fontSize="0.9rem"
          >
            ← Volver a Reportes
          </Text>
        </Link>
        <Text as="h1" fontSize="2rem" fontWeight="bold" marginTop="0.5rem">
          Crear Nuevo Reporte
        </Text>
        <Text color="var(--amplify-colors-font-tertiary)">
          Ayuda a tu comunidad reportando problemas urbanos
        </Text>
      </View>

      {/* Form Card */}
      <Card variation="outlined" padding="2rem">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1.5rem">
            {/* Title */}
            <TextField
              label="Título del Reporte"
              placeholder="Ej: Bache grande en Avenida Principal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
            />

            {/* Category */}
            <View>
              <Text as="label" fontWeight="600" marginBottom="0.5rem">
                Categoría
              </Text>
              <Flex wrap="wrap" gap="0.75rem" marginTop="0.5rem">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variation={
                      category === cat.id ? "primary" : "link"
                    }
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.emoji} {cat.label}
                  </Button>
                ))}
              </Flex>
            </View>

            {/* Description */}
            <TextAreaField
              label="Descripción"
              placeholder="Proporciona detalles sobre el problema. ¿Cuál es el riesgo? ¿Desde cuándo existe?"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isRequired
            />
            <Text fontSize="0.75rem" color="var(--amplify-colors-font-tertiary)">
              {description.length} / 500 caracteres
            </Text>

            {/* Location */}
            <TextField
              label="Ubicación"
              placeholder="Calle, número y referencia (ej: Avenida Principal 123)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              isRequired
            />

            <TextField
              label="Coordenada Latitud"
              placeholder="Latitud (ej: 19.4326)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              isRequired
            />

            <TextField
              label="Coordenada Longitud"
              placeholder="Longitud (ej:-99.1332)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              isRequired
            />

            {/* Image Upload */}
            <View>
              <Text as="label" fontWeight="600" marginBottom="0.5rem">
                Foto del Problema
              </Text>
              <View
                border="2px dashed var(--amplify-colors-neutral-40)"
                borderRadius="0.75rem"
                padding="2rem"
                textAlign="center"
                position="relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                {image ? (
                  <View>
                    <Image
                      src={image}
                      alt="Vista previa"
                      maxHeight="200px"
                      margin="0 auto"
                      borderRadius="0.5rem"
                    />
                    <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
                      Haz clic para cambiar la imagen
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text fontSize="2rem">📸</Text>
                    <Text fontWeight="600">Sube una foto</Text>
                    <Text fontSize="0.875rem" color="var(--amplify-colors-font-tertiary)">
                      Arrastra y suelta o haz clic para seleccionar
                    </Text>
                    <Text fontSize="0.75rem" color="var(--amplify-colors-font-tertiary)">
                      PNG, JPG, GIF hasta 10MB
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Info Box */}
            <View
              backgroundColor="var(--amplify-colors-background-secondary)"
              border="1px solid var(--amplify-colors-neutral-40)"
              borderRadius="0.5rem"
              padding="1rem"
            >
              <Text fontSize="0.875rem">
                <strong>Importante:</strong> Tu reporte será revisado y
                publicado. Los datos falsos pueden resultar en sanciones.
              </Text>
            </View>

            {/* Submit Buttons */}
            <Flex gap="1rem" justifyContent="flex-end">
              <Button
                variation="primary"
                type="submit"
                isDisabled={
                  isSubmitting || !title || !description || !location
                }
              >
                {isSubmitting ? "Enviando..." : "Publicar Reporte"}
              </Button>
              <Button
                variation="link"
                onClick={() => {
                  setTitle("")
                  setDescription("")
                  setLocation("")
                  setImage(null)
                }}
              >
                Limpiar
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </View>
          <Footer />

    </>
  )
}
