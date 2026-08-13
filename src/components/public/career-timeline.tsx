import { ArrowUpRight, Building2, CalendarDays, MapPin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type CareerItem = {
	id: string;
	company: string;
	location: string | null;
	companyUrl: string | null;
	startedAt: Date;
	finishedAt: Date | null;
	current: boolean;
	translations: Array<{ title: string; summary: string; description: string }>;
};

function monthYear(date: Date, locale: "PT_BR" | "EN_US") {
	return new Intl.DateTimeFormat(locale === "PT_BR" ? "pt-BR" : "en-US", {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function CareerTimeline({ experiences, locale, currentLabel, openLabel }: { experiences: CareerItem[]; locale: "PT_BR" | "EN_US"; currentLabel: string; openLabel: string }) {
	return (
		<Accordion type="single" collapsible className="relative mt-10 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[1.15rem] before:w-px before:bg-linear-to-b before:from-violet-500/60 before:via-violet-500/20 before:to-transparent sm:before:left-[1.4rem]">
			{experiences.map((experience) => {
				const translation = experience.translations[0];
				if (!translation) return null;

				return (
					<AccordionItem key={experience.id} value={experience.id} className="relative border-0 pl-12 sm:pl-16">
						<span className="absolute top-6 left-2.5 z-10 size-3.5 rounded-full border-2 border-zinc-950 bg-violet-400 shadow-[0_0_0_5px_rgba(139,92,246,0.12)] sm:left-[1.05rem]" />
						<div className="overflow-hidden rounded-2xl border border-white/8 bg-zinc-950/55 transition-colors hover:border-violet-500/20">
							<AccordionTrigger className="px-5 py-5 text-left hover:no-underline sm:px-6">
								<div className="min-w-0 flex-1 pr-4">
									<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
										<h3 className="text-base font-semibold text-white sm:text-lg">{translation.title}</h3>
										<span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-violet-300">
											<CalendarDays className="size-3.5" />
											{monthYear(experience.startedAt, locale)} — {experience.current ? currentLabel : experience.finishedAt ? monthYear(experience.finishedAt, locale) : currentLabel}
										</span>
									</div>
									<p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
										<Building2 className="size-3.5 text-violet-300" />
										{experience.company}
									</p>
									<p className="mt-3 max-w-3xl text-sm leading-6 font-normal text-zinc-500">{translation.summary}</p>
									<span className="mt-3 inline-block text-xs font-medium text-violet-300">{openLabel}</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-5 pb-5 sm:px-6 sm:pb-6">
								<div className="border-t border-white/5 pt-5">
									<p className="whitespace-pre-line text-sm leading-7 text-zinc-300">{translation.description}</p>
									<div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
										{experience.location ? (
											<span className="flex items-center gap-1.5">
												<MapPin className="size-3.5 text-violet-300" />
												{experience.location}
											</span>
										) : null}
										{experience.companyUrl ? (
											<a href={experience.companyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-violet-300 transition hover:text-violet-200">
												{experience.company}
												<ArrowUpRight className="size-3.5" />
											</a>
										) : null}
									</div>
								</div>
							</AccordionContent>
						</div>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
