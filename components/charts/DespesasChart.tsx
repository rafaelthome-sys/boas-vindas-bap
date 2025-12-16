"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DespesaCategoria {
  categoria: string;
  valor: number;
}

interface DespesasChartProps {
  despesas?: DespesaCategoria[];
}

const COLORS = ["#3B82F6", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#EC4899"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

export function DespesasChart({ despesas }: DespesasChartProps) {
  if (!despesas || despesas.length === 0) {
    return null;
  }

  // Ordena por valor decrescente
  const sortedData = [...despesas]
    .filter((d) => d.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  if (sortedData.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4" style={{ height: "280px", minHeight: "280px" }}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            tick={{ fontSize: 11, fill: "#374151" }}
            tickLine={false}
            axisLine={false}
            width={75}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value) || 0), "Valor"]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
          />
          <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
