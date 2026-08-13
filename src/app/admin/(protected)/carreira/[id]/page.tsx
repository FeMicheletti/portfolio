import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExperienceForm, ExperienceFormHeading } from "@/components/admin/experience-form";
import { ExperienceFormValues } from "@/lib/experiences/experience-form";

function dateInputValue(date: Date | null) {
	return date?.toISOString().slice(0, 10) ?? "";
}

export default async function EditExperience({ params }: { params: Promise<{ id: string }>; }) {
	const { id } = await params;
	const [ experience ] = await Promise.all([
		prisma.experience.findUnique({
			where: { id },
			include: {
				translations: true
			},
		})
	]);

	if (!experience) notFound();

	const pt = experience.translations.find((translation) => translation.locale === "PT_BR");
	const en = experience.translations.find((translation) => translation.locale === "EN_US");

	const values: ExperienceFormValues = {
		company: experience?.company ?? "",
		location: experience?.location ?? "",
		companyUrl: experience?.companyUrl ?? "",
		startedAt: dateInputValue(experience?.startedAt) ?? "",
		finishedAt: dateInputValue(experience?.finishedAt) ?? "",
		current: experience?.current ?? false,
		visible: experience?.visible ?? true,
		sortOrder: experience?.sortOrder ?? 0,
		titlePt: pt?.title ?? "",
		summaryPt: pt?.summary ?? "",
		descriptionPt: pt?.description ?? "",
		titleEn: en?.title ?? "",
		summaryEn: en?.summary ?? "",
		descriptionEn: en?.description ?? "",
	};

	return (
		<div>
			<ExperienceFormHeading editing />
			<ExperienceForm id={id} values={values} />
		</div>
	);
}