"use client";

import { DadoMensal } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ConsumoChartProps {
  agua?: DadoMensal[];
  energia?: DadoMensal[];
  gas?: DadoMensal[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

export function ConsumoChart({ agua, energia, gas }: ConsumoChartProps) {
  // Combina os dados por mês
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const chartData = meses.map((mes) => {
    const aguaItem = agua?.find((d) => d.mes === mes);
    const energiaItem = energia?.find((d) => d.mes === mes);
    const gasItem = gas?.find((d) => d.mes === mes);

    return {
      mes,
      agua: aguaItem?.valor ?? null,
      energia: energiaItem?.valor ?? null,
      gas: gasItem?.valor ?? null,
    };
  }).filter((d) => d.agua !== null || d.energia !== null || d.gas !== null);

  if (chartData.length === 0) {
    return null;
  }

  const hasAgua = agua && agua.length > 0;
  const hasEnergia = energia && energia.length > 0;
  const hasGas = gas && gas.length > 0;

  return (
    <div className="w-full mt-4" style={{ height: "256px", minHeight: "256px" }}>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value) || 0), ""]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
          {hasAgua && (
            <Line
              type="monotone"
              dataKey="agua"
              name="Água"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
          {hasEnergia && (
            <Line
              type="monotone"
              dataKey="energia"
              name="Energia"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
          {hasGas && (
            <Line
              type="monotone"
              dataKey="gas"
              name="Gás"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
