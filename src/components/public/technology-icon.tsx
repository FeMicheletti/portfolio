import type { IconType } from "react-icons";
import { FaAws, FaJava } from "react-icons/fa";
import { SiDocker, SiFirebase, SiGit, SiGithub, SiJavascript, SiLaravel, SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNodedotjs, SiPhp, SiPostgresql, SiPrisma, SiReact, SiSpringboot, SiTailwindcss, SiTypescript, SiVuedotjs } from "react-icons/si";

const icons: Record<string, IconType> = {
	aws: FaAws,
	docker: SiDocker,
	firebase: SiFirebase,
	git: SiGit,
	github: SiGithub,
	java: FaJava,
	javascript: SiJavascript,
	laravel: SiLaravel,
	mongodb: SiMongodb,
	mysql: SiMysql,
	nestjs: SiNestjs,
	nextjs: SiNextdotjs,
	nextdotjs: SiNextdotjs,
	nodejs: SiNodedotjs,
	nodedotjs: SiNodedotjs,
	php: SiPhp,
	postgresql: SiPostgresql,
	prisma: SiPrisma,
	react: SiReact,
	springboot: SiSpringboot,
	tailwindcss: SiTailwindcss,
	typescript: SiTypescript,
	vuejs: SiVuedotjs,
	vuedotjs: SiVuedotjs,
};

function normalizeIconKey(iconKey: string) {
	return iconKey
		.toLowerCase()
		.replace(/^si|^fa/, "")
		.replace(/[^a-z0-9]/g, "");
}

export function TechnologyIcon({ iconKey, className }: { iconKey: string | null; className?: string }) {
	const Icon = iconKey ? icons[normalizeIconKey(iconKey)] : null;
	return Icon ? <Icon aria-hidden="true" className={className} /> : <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />;
}
