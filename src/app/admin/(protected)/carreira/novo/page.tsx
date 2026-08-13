import { ExperienceForm, ExperienceFormHeading } from "@/components/admin/experience-form";

export default async function NewExperience() {
	return (
		<div>
			<ExperienceFormHeading editing={false} />
			<ExperienceForm
				values={{
					company: "",
					location: "",
					companyUrl: "",
					startedAt: "",
					finishedAt: "",
					current: false,
					visible: true,
					sortOrder: 0,
					titlePt: "",
					summaryPt: "",
					descriptionPt: "",
					titleEn: "",
					summaryEn: "",
					descriptionEn: ""
				}} />
		</div>
	);
}