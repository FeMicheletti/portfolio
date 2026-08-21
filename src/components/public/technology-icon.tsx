import type { IconType } from "react-icons";
import { FaAws, FaCode, FaCodeBranch, FaDatabase, FaJava, FaPython } from "react-icons/fa";
import { SiAngular, SiAuth0, SiBootstrap, SiCss, SiDocker, SiEslint, SiFirebase, SiGit, SiGithub, SiGithubactions, SiGo, SiGooglecloud, SiHtml5, SiJavascript, SiJest, SiJunit5, SiLaravel, SiMocha, SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNodedotjs, SiPhp, SiPostgresql, SiPostman, SiPrisma, SiPytest, SiReact, SiSpringboot, SiSwagger, SiTailwindcss, SiTypescript, SiVuedotjs } from "react-icons/si";
import { TbApi, TbTestPipe, TbTopologyStar } from "react-icons/tb";

const icons: Record<string, IconType> = {
	// Cloud / DevOps
	aws: FaAws,
	googlecloud: SiGooglecloud,
	docker: SiDocker,
	githubactions: SiGithubactions,
	cicd: TbTopologyStar,

	// Linguagens
	openjdk: FaJava,
	javascript: SiJavascript,
	typescript: SiTypescript,
	python: FaPython,
	go: SiGo,
	php: SiPhp,
	html: SiHtml5,
	css: SiCss,

	// Frameworks 
	laravel: SiLaravel,
	nestjs: SiNestjs,
	nextjs: SiNextdotjs,
	nodejs: SiNodedotjs,
	react: SiReact,
	angular: SiAngular,
	springboot: SiSpringboot,
	vuejs: SiVuedotjs,

	// UI
	bootstrap: SiBootstrap,
	tailwindcss: SiTailwindcss,

	// Banco de Dados
	mongodb: SiMongodb,
	mysql: SiMysql,
	postgresql: SiPostgresql,
	firebase: SiFirebase,
	prisma: SiPrisma,
	sqlserver: FaDatabase,

	// APIs
	restful: TbApi,
	swagger: SiSwagger,
	oauth2: SiAuth0,

	// Testes
	jest: SiJest,
	mocha: SiMocha,
	junit: SiJunit5,
	pytest: SiPytest,
	phpunit: SiPhp,
	husky: FaCodeBranch,
	eslint: SiEslint,
	e2e: TbTestPipe,
	unittest: TbTestPipe,
	integration: TbTestPipe,

	// Ferramentas
	git: SiGit,
	github: SiGithub,
	postman: SiPostman,

	// Qualidade
	cleancode: FaCode,
	solid: FaCode,
	tdd: TbTestPipe,
};

function normalizeIconKey(iconKey: string) {
	return iconKey.toLowerCase().replace(/^si|^fa/, "").replace(/[^a-z0-9]/g, "");
}

export function TechnologyIcon({ iconKey, className }: { iconKey: string | null; className?: string }) {
	const Icon = iconKey ? icons[normalizeIconKey(iconKey)] : null;
	return Icon ? <Icon aria-hidden="true" className={className} /> : <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />;
}