"use client";

import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { View, Heading, Flex, Text, Card, Loader } from "@aws-amplify/ui-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Header from "../../components/header";
import Footer from "../../components/footer";
const client = generateClient<Schema>();
type Report = Schema["Report"]["type"];

export default function EstadisticasReportes() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🎯 Cargar datos desde DynamoDB
  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data, errors } = await client.models.Report.list({ limit: 500 });
        if (errors) throw new Error("Error al obtener reportes");
        setReports(data);
      } catch (err: any) {
        console.error("❌ Error:", err);
        setError(err.message || "Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  // 🧮 Calcular estadísticas
  const totalReportes = reports.length;

  // Agrupar por estado
  const estados = ["Pendiente", "En progreso", "Resuelto"];
  const porEstado = estados.map((estado) => ({
    name: estado,
    value: reports.filter((r) => r.status === estado).length,
  }));

  // Agrupar por categoría
  const categorias = ["bache", "alumbrado", "agua", "contaminacion", "basura", "otro"];
  const porCategoria = categorias.map((cat) => ({
    name: cat,
    value: reports.filter((r) => r.category === cat).length,
  }));

  const COLORS = ["#E74C3C", "#F39C12", "#27AE60", "#3498DB", "#9B59B6", "#95A5A6"];

  return (
    <>
    <Header isLoggedIn={true} currentPage="estadisticas" handleLogout={() => {}} />
    <View padding="2rem">
      <Heading level={2} marginBottom="1rem">
        📊 Estadísticas de Reportes Ciudadanos
      </Heading>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" padding="3rem">
          <Loader size="large" />
          <Text marginLeft="1rem">Cargando estadísticas...</Text>
        </Flex>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : totalReportes === 0 ? (
        <Card variation="outlined" padding="2rem">
          <Text>No hay reportes registrados aún.</Text>
        </Card>
      ) : (
        <Flex wrap="wrap" gap="2rem">
          {/* Total general */}
          <Card variation="outlined" width="250px" textAlign="center">
            <Heading level={4}>Total de reportes</Heading>
            <Text fontSize="2.5rem" fontWeight="bold" color="var(--amplify-colors-brand-primary)">
              {totalReportes}
            </Text>
          </Card>

          {/* Gráfico de estado */}
          <Card variation="outlined" flex="1" minWidth="400px" padding="1rem">
            <Heading level={4} textAlign="center" marginBottom="0.5rem">
              Reportes por Estado
            </Heading>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={porEstado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3498DB" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de categorías */}
          <Card variation="outlined" flex="1" minWidth="400px" padding="1rem">
            <Heading level={4} textAlign="center" marginBottom="0.5rem">
              Reportes por Categoría
            </Heading>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={porCategoria}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {porCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Flex>
      )}
    </View>
    <Footer />
    </>
  );
}
