import Link from "next/link";
import { Activity, Download, Eye, MousePointerClick, Users } from "lucide-react";
import { DistributionChart, TrafficTrendChart } from "@/components/admin/metrics-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsPeriods, getAnalyticsDashboard, type AnalyticsPeriod } from "@/lib/analytics/dashboard";
import { cn } from "@/lib/utils";

function parsePeriod(value?: string): AnalyticsPeriod {
    const parsed = Number(value);
    return analyticsPeriods.includes(parsed as AnalyticsPeriod) ? (parsed as AnalyticsPeriod) : 30;
}

export default async function MetricsPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
    const { periodo } = await searchParams;
    const period = parsePeriod(periodo);
    const analytics = await getAnalyticsDashboard(period);
    const metrics = [
        {
            label: "Visualizações",
            value: analytics.pageViews,
            detail: `nos últimos ${period} dias`,
            icon: Eye,
        },
        {
            label: "Visitantes",
            value: analytics.visitors,
            detail: `${analytics.sessions} sessões`,
            icon: Users,
        },
        {
            label: "Downloads",
            value: analytics.resumeDownloads,
            detail: "do currículo",
            icon: Download,
        },
        {
            label: "Engajamento",
            value: `${analytics.engagementRate}%`,
            detail: `${analytics.clicks} interações`,
            icon: MousePointerClick,
        },
    ];

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
                        <Activity className="size-4" />
                        Analytics do portfólio
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Desempenho e interações</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                        Dados anônimos de navegação, origem, dispositivos e interesse nos projetos. Nenhum endereço IP é armazenado.
                    </p>
                </div>
                <div className="flex w-fit rounded-xl border border-white/10 bg-zinc-900 p-1">
                    {analyticsPeriods.map((option) => (
                        <Link
                            key={option}
                            href={`/admin/metricas?periodo=${option}`}
                            className={cn(
                                "rounded-lg px-3 py-2 text-xs font-medium transition",
                                period === option ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-white",
                            )}
                        >
                            {option} dias
                        </Link>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, detail, icon: Icon }) => (
                    <Card key={label} className="border-violet-500/10 bg-zinc-900/70 ring-0">
                        <CardHeader className="flex-row items-center justify-between gap-4">
                            <CardDescription className="text-zinc-400">{label}</CardDescription>
                            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                                <Icon className="size-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-white">{value}</p>
                            <p className="mt-1 text-xs text-zinc-500">{detail}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Evolução do tráfego</CardTitle>
                        <CardDescription className="text-zinc-500">Visualizações e visitantes únicos por dia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TrafficTrendChart data={analytics.daily} />
                    </CardContent>
                </Card>
                <Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Dispositivos</CardTitle>
                        <CardDescription className="text-zinc-500">Distribuição das visualizações.</CardDescription>
                    </CardHeader>
                    <CardContent>{analytics.devices.length ? <DistributionChart data={analytics.devices} /> : <EmptyState />}</CardContent>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Origens do tráfego</CardTitle>
                        <CardDescription className="text-zinc-500">Referências e campanhas UTM.</CardDescription>
                    </CardHeader>
                    <CardContent>{analytics.sources.length ? <DistributionChart data={analytics.sources} /> : <EmptyState />}</CardContent>
                </Card>
                <Card className="border-violet-500/10 bg-zinc-900/70 ring-0">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Interesse por projeto</CardTitle>
                        <CardDescription className="text-zinc-500">Exposições, demos e acessos ao código.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics.projects.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs text-zinc-500">
                                        <tr className="border-b border-white/5">
                                            <th className="pb-3 font-medium">Projeto</th>
                                            <th className="pb-3 text-right font-medium">Views</th>
                                            <th className="pb-3 text-right font-medium">Demo</th>
                                            <th className="pb-3 text-right font-medium">Código</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.projects.map((project) => (
                                            <tr key={project.name} className="border-b border-white/5 last:border-0">
                                                <td className="max-w-48 truncate py-3 text-zinc-200">{project.name}</td>
                                                <td className="py-3 text-right text-zinc-400">{project.views}</td>
                                                <td className="py-3 text-right text-zinc-400">{project.demos}</td>
                                                <td className="py-3 text-right text-zinc-400">{project.repositories}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-violet-500/15 px-6 text-center text-sm text-zinc-600">
            Os dados aparecerão após as primeiras visitas.
        </div>
    );
}
