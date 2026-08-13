"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const trendConfig = {
  views: { label: "Visualizações", color: "#8b5cf6" },
  visitors: { label: "Visitantes", color: "#38bdf8" },
} satisfies ChartConfig;

const distributionConfig = {
  value: { label: "Visualizações", color: "#8b5cf6" },
} satisfies ChartConfig;

export function TrafficTrendChart({
  data,
}: {
  data: Array<{ date: string; views: number; visitors: number }>;
}) {
  return (
    <ChartContainer config={trendConfig} className="h-72 w-full aspect-auto">
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-views)"
              stopOpacity={0.35}
            />
            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent className="border-white/10 bg-zinc-950 text-zinc-200" />
          }
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="var(--color-views)"
          fill="url(#views-fill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="var(--color-visitors)"
          fill="transparent"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function DistributionChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ChartContainer
      config={distributionConfig}
      className="h-64 w-full aspect-auto"
    >
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.07)" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={92}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              className="border-white/10 bg-zinc-950 text-zinc-200"
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
