import { TechnologyIcon } from "@/components/public/technology-icon";

type SliderTechnology = {
    id: string;
    name: string;
    color: string | null;
    iconKey: string | null;
};

export function TechnologySlider({ technologies, label }: { technologies: SliderTechnology[]; label: string }) {
    if (!technologies.length) return null;

    const repeatedTechnologies = [...technologies, ...technologies];

    return (
        <section aria-label={label} className="relative overflow-hidden border-y border-white/5 bg-zinc-950/80 py-5">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-zinc-950 to-transparent sm:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-zinc-950 to-transparent sm:w-40" />

            <div className="stack-marquee flex w-max items-center">
                {repeatedTechnologies.map((technology, index) => (
                    <div
                        key={`${technology.id}-${index}`}
                        aria-hidden={index >= technologies.length}
                        className="mx-2 flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/4 px-5 py-2.5 text-sm font-medium text-zinc-300"
                    >
                        <span className="flex size-5 items-center justify-center" style={{ color: technology.color || "#a78bfa" }}>
                            <TechnologyIcon iconKey={technology.iconKey} className="size-4" />
                        </span>
                        {technology.name}
                    </div>
                ))}
            </div>
        </section>
    );
}
