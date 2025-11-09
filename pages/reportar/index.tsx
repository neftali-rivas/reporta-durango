"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { generateClient } from "aws-amplify/data"
import { uploadData } from "aws-amplify/storage"
import type { Schema } from "@/amplify/data/resource"
import {
  View,
  Text,
  Button,
  Flex,
  TextField,
  TextAreaField,
  Image,
  Card,
  Alert,
} from "@aws-amplify/ui-react"
import "@aws-amplify/ui-react/styles.css"
import Header from "../../components/header"
import Footer from "../../components/footer"

const client = generateClient<Schema>()

type CategoryType =
  | "bache"
  | "alumbrado"
  | "agua"
  | "contaminacion"
  | "basura"
  | "otro"

export default function CreateReportPage() {
  const handleLogout = () => {
    console.log("Cerrando sesión...")
  }

  // Estados del formulario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<CategoryType>("bache")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const categories = [
    { id: "bache" as const, label: "Bache", emoji: "🚗" },
    { id: "alumbrado" as const, label: "Alumbrado", emoji: "💡" },
    { id: "agua" as const, label: "Fuga de Agua", emoji: "💧" },
    { id: "contaminacion" as const, label: "Contaminación", emoji: "☁️" },
    { id: "basura" as const, label: "Basura", emoji: "🗑️" },
    { id: "otro" as const, label: "Otro", emoji: "📍" },
  ]

  // Obtener ubicación automática del navegador
  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setErrorMessage("")

    if (!navigator.geolocation) {
      setErrorMessage("Tu navegador no soporta geolocalización")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setIsLoadingLocation(false)
        setSuccessMessage("📍 Ubicación obtenida correctamente")
        setTimeout(() => setSuccessMessage(""), 3000)
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error)
        setErrorMessage("No se pudo obtener tu ubicación. Ingrésala manualmente.")
        setIsLoadingLocation(false)
      }
    )
  }

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Solo se permiten archivos de imagen")
        return
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("La imagen no debe superar 10MB")
        return
      }

      setImageFile(file)
      
      // Generar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setErrorMessage("")
    }
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      // Validaciones
      if (!title || !description || !location) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      if (!imageFile) {
        throw new Error("Por favor selecciona una imagen")
      }

      // Validar coordenadas si fueron proporcionadas
      const lat = latitude ? parseFloat(latitude) : undefined
      const lng = longitude ? parseFloat(longitude) : undefined

      if (latitude && (isNaN(lat!) || lat! < -90 || lat! > 90)) {
        throw new Error("Latitud inválida (debe estar entre -90 y 90)")
      }

      if (longitude && (isNaN(lng!) || lng! < -180 || lng! > 180)) {
        throw new Error("Longitud inválida (debe estar entre -180 y 180)")
      }

      // 1. SUBIR IMAGEN A S3
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split(".").pop()
      const s3Path = `photos/${timestamp}-${category}.${fileExtension}`

      console.log("📤 Subiendo imagen a S3...")
      const uploadResult = await uploadData({
        path: s3Path,
        data: imageFile,
        options: {
          contentType: imageFile.type,
        },
      }).result

      console.log("✅ Imagen subida:", uploadResult.path)

      // 2. CREAR REPORTE EN DYNAMODB
      console.log("💾 Guardando reporte en base de datos...")
      const newReport = await client.models.Report.create({
        title: title.trim(),
        description: description.trim(),
        category: category,
        status: "Pendiente",
        location: location.trim(),
        latitude: lat,
        longitude: lng,
        s3Key: uploadResult.path,
        mimeType: imageFile.type,
        fileSize: imageFile.size,
        author: "Usuario", // TODO: Usar email real cuando tengas auth
        date: new Date().toISOString().split("T")[0],
        views: 0,
      })

      console.log("✅ Reporte creado:", newReport)

      // Mostrar éxito
      setSuccessMessage("🎉 ¡Reporte enviado exitosamente!")
      
      // Limpiar formulario
      setTimeout(() => {
        setTitle("")
        setDescription("")
        setLocation("")
        setLatitude("")
        setLongitude("")
        setImageFile(null)
        setImagePreview(null)
        setCategory("bache")
        setSuccessMessage("")
        
        // Opcional: Redirigir a la lista de reportes
        // window.location.href = "/"
      }, 2000)

    } catch (error: any) {
      console.error("❌ Error al crear reporte:", error)
      setErrorMessage(error.message || "Error al enviar el reporte. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
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

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <Alert variation="success" marginBottom="1rem" isDismissible={true}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert variation="error" marginBottom="1rem" isDismissible={true}>
            {errorMessage}
          </Alert>
        )}

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
                maxLength={100}
              />

              {/* Category */}
              <View>
                <Text as="label" fontWeight="600" marginBottom="0.5rem">
                  Categoría *
                </Text>
                <Flex wrap="wrap" gap="0.75rem" marginTop="0.5rem">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variation={category === cat.id ? "primary" : "link"}
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.emoji} {cat.label}
                    </Button>
                  ))}
                </Flex>
              </View>

              {/* Description */}
              <View>
                <TextAreaField
                  label="Descripción"
                  placeholder="Proporciona detalles sobre el problema. ¿Cuál es el riesgo? ¿Desde cuándo existe?"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isRequired
                  maxLength={500}
                />
                <Text
                  fontSize="0.75rem"
                  color="var(--amplify-colors-font-tertiary)"
                >
                  {description.length} / 500 caracteres
                </Text>
              </View>

              {/* Location */}
              <TextField
                label="Ubicación"
                placeholder="Calle, número y referencia (ej: Avenida Principal 123)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                isRequired
              />

              {/* Coordinates Section */}
              <View>
                <Text as="label" fontWeight="600" marginBottom="0.5rem">
                  Coordenadas GPS (Opcional)
                </Text>
                <Button
                  type="button"
                  variation="primary"
                  size="small"
                  onClick={getCurrentLocation}
                  isLoading={isLoadingLocation}
                  marginBottom="1rem"
                >
                  {isLoadingLocation ? "Obteniendo..." : "📍 Usar mi ubicación"}
                </Button>

                <Flex gap="1rem">
                  <TextField
                    label="Latitud"
                    placeholder="Ej: 24.0277"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    type="number"
                    step="any"
                  />
                  <TextField
                    label="Longitud"
                    placeholder="Ej: -104.6532"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    type="number"
                    step="any"
                  />
                </Flex>
              </View>

              {/* Image Upload */}
              <View>
                <Text as="label" fontWeight="600" marginBottom="0.5rem">
                  Foto del Problema *
                </Text>
                <View
                  border="2px dashed var(--amplify-colors-neutral-40)"
                  borderRadius="0.75rem"
                  padding="2rem"
                  textAlign="center"
                  position="relative"
                  backgroundColor={
                    imagePreview
                      ? "transparent"
                      : "var(--amplify-colors-background-secondary)"
                  }
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
                  {imagePreview ? (
                    <View>
                      <Image
                        src={imagePreview}
                        alt="Vista previa"
                        maxHeight="300px"
                        margin="0 auto"
                        borderRadius="0.5rem"
                      />
                      <Text
                        fontSize="0.875rem"
                        color="var(--amplify-colors-font-tertiary)"
                        marginTop="0.5rem"
                      >
                        Haz clic para cambiar la imagen
                      </Text>
                      {imageFile && (
                        <Text fontSize="0.75rem" color="var(--amplify-colors-font-tertiary)">
                          {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View>
                      <Text fontSize="2rem">📸</Text>
                      <Text fontWeight="600">Sube una foto</Text>
                      <Text
                        fontSize="0.875rem"
                        color="var(--amplify-colors-font-tertiary)"
                      >
                        Arrastra y suelta o haz clic para seleccionar
                      </Text>
                      <Text
                        fontSize="0.75rem"
                        color="var(--amplify-colors-font-tertiary)"
                      >
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
                    isSubmitting ||
                    !title ||
                    !description ||
                    !location ||
                    !imageFile
                  }
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Publicar Reporte"}
                </Button>
                <Button
                  variation="link"
                  type="button"
                  onClick={() => {
                    setTitle("")
                    setDescription("")
                    setLocation("")
                    setLatitude("")
                    setLongitude("")
                    setImageFile(null)
                    setImagePreview(null)
                    setCategory("bache")
                  }}
                  isDisabled={isSubmitting}
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