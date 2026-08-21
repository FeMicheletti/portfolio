import test from "node:test";
import assert from "node:assert/strict";

import { safeDownloadFileName } from "../src/lib/media.ts";
import { projectFormSchema } from "../src/lib/projects/project-form.ts";
import {
    cn,
    optionalPublicExternalUrl,
    publicExternalUrl,
} from "../src/lib/utils.ts";

const project = {
    slug: "portfolio",
    status: "PUBLISHED",
    featured: true,
    sortOrder: 0,
    repositoryUrl: "",
    demoUrl: "",
    startedAt: "2026-01-01",
    finishedAt: "",
    titlePt: "Portfólio",
    summaryPt: "Um projeto completo para apresentar trabalhos.",
    problemPt: "",
    solutionPt: "",
    responsibilitiesPt: "",
    technicalChoicesPt: "",
    resultsPt: "",
    titleEn: "Portfolio",
    summaryEn: "A complete project used to present professional work.",
    problemEn: "",
    solutionEn: "",
    responsibilitiesEn: "",
    technicalChoicesEn: "",
    resultsEn: "",
    technologyIds: [],
    projectMedia: [],
};

//
// Project form
//

test("validates a complete bilingual project", () => {
    const result = projectFormSchema.safeParse(project);

    assert.equal(result.success, true);
});

test("validates a project with repository and demo URLs", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        repositoryUrl: "https://github.com/example/project",
        demoUrl: "https://example.com",
        finishedAt: "2026-08-01",
    });

    assert.equal(result.success, true);
});

test("accepts http external URLs", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        repositoryUrl: "http://example.com",
    });

    assert.equal(result.success, true);
});

test("rejects an unsafe project slug", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        slug: "Invalid Slug",
    });

    assert.equal(result.success, false);
});

test("rejects a slug shorter than two characters", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        slug: "a",
    });

    assert.equal(result.success, false);
});

test("rejects a negative sort order", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        sortOrder: -1,
    });

    assert.equal(result.success, false);
});

test("coerces sort order to a number", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        sortOrder: "10",
    });

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(result.data.sortOrder, 10);
    }
});

test("rejects an invalid started date", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        startedAt: "21/08/2026",
    });

    assert.equal(result.success, false);
});

test("rejects an invalid finished date", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        finishedAt: "tomorrow",
    });

    assert.equal(result.success, false);
});

test("rejects a project finished before it started", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        startedAt: "2026-08-21",
        finishedAt: "2026-08-20",
    });

    assert.equal(result.success, false);

    if (!result.success) {
        assert.ok(
            result.error.issues.some(
                (issue) =>
                    issue.path[0] === "finishedAt" &&
                    issue.message === "A conclusão não pode ser anterior ao início.",
            ),
        );
    }
});

test("accepts a project finished on the same date it started", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        startedAt: "2026-08-21",
        finishedAt: "2026-08-21",
    });

    assert.equal(result.success, true);
});

test("rejects duplicated project media", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia: [
            {
                mediaId: "1",
                role: "COVER",
                altPt: "",
                altEn: "",
            },
            {
                mediaId: "1",
                role: "GALLERY",
                altPt: "",
                altEn: "",
            },
        ],
    });

    assert.equal(result.success, false);

    if (!result.success) {
        assert.ok(
            result.error.issues.some(
                (issue) =>
                    issue.path[0] === "projectMedia" &&
                    issue.message ===
                        "Uma mesma imagem não pode ser vinculada mais de uma vez.",
            ),
        );
    }
});

test("rejects more than one project cover", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia: [
            {
                mediaId: "1",
                role: "COVER",
                altPt: "Primeira capa",
                altEn: "First cover",
            },
            {
                mediaId: "2",
                role: "COVER",
                altPt: "Segunda capa",
                altEn: "Second cover",
            },
        ],
    });

    assert.equal(result.success, false);

    if (!result.success) {
        assert.ok(
            result.error.issues.some(
                (issue) =>
                    issue.path[0] === "projectMedia" &&
                    issue.message === "Selecione apenas uma imagem de capa.",
            ),
        );
    }
});

test("accepts one cover and one gallery image", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia: [
            {
                mediaId: "1",
                role: "COVER",
                altPt: "Capa",
                altEn: "Cover",
            },
            {
                mediaId: "2",
                role: "GALLERY",
                altPt: "Galeria",
                altEn: "Gallery",
            },
        ],
    });

    assert.equal(result.success, true);
});

test("rejects project media without an id", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia: [
            {
                mediaId: "",
                role: "GALLERY",
                altPt: "",
                altEn: "",
            },
        ],
    });

    assert.equal(result.success, false);
});

test("rejects an invalid project media role", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia: [
            {
                mediaId: "1",
                role: "INVALID",
                altPt: "",
                altEn: "",
            },
        ],
    });

    assert.equal(result.success, false);
});

test("rejects more than 30 project images", () => {
    const projectMedia = Array.from({ length: 31 }, (_, index) => ({
        mediaId: String(index + 1),
        role: "GALLERY",
        altPt: "",
        altEn: "",
    }));

    const result = projectFormSchema.safeParse({
        ...project,
        projectMedia,
    });

    assert.equal(result.success, false);
});

test("rejects more than 50 technologies", () => {
    const technologyIds = Array.from(
        { length: 51 },
        (_, index) => String(index + 1),
    );

    const result = projectFormSchema.safeParse({
        ...project,
        technologyIds,
    });

    assert.equal(result.success, false);
});

test("rejects empty technology ids", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        technologyIds: [""],
    });

    assert.equal(result.success, false);
});

test("rejects too short Portuguese title", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        titlePt: "A",
    });

    assert.equal(result.success, false);
});

test("rejects too short English title", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        titleEn: "A",
    });

    assert.equal(result.success, false);
});

test("rejects too short Portuguese summary", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        summaryPt: "curto",
    });

    assert.equal(result.success, false);
});

test("rejects too short English summary", () => {
    const result = projectFormSchema.safeParse({
        ...project,
        summaryEn: "short",
    });

    assert.equal(result.success, false);
});

//
// Media
//

test("keeps the configured resume filename", () => {
    assert.equal(
        safeDownloadFileName(
            "Felipe-Micheletti-CV.pdf",
            "resume.pdf",
        ),
        "Felipe-Micheletti-CV.pdf",
    );
});

test("removes header injection from media filenames", () => {
    assert.equal(
        safeDownloadFileName(
            "resume.pdf\r\nX-Test",
            "resume.pdf",
        ),
        "resume.pdfX-Test",
    );
});

test("uses fallback when requested filename is null", () => {
    assert.equal(
        safeDownloadFileName(null, "resume.pdf"),
        "resume.pdf",
    );
});

test("uses fallback when requested filename becomes empty", () => {
    assert.equal(
        safeDownloadFileName("\r\n   ", "resume.pdf"),
        "resume.pdf",
    );
});

test("trims whitespace from requested filename", () => {
    assert.equal(
        safeDownloadFileName(
            "   resume.pdf   ",
            "fallback.pdf",
        ),
        "resume.pdf",
    );
});

test("limits filename to 255 characters", () => {
    const filename = `${"a".repeat(300)}.pdf`;

    const result = safeDownloadFileName(
        filename,
        "fallback.pdf",
    );

    assert.equal(result.length, 255);
});

//
// URLs
//

test("publicExternalUrl accepts https", () => {
    const schema = publicExternalUrl();

    assert.equal(
        schema.safeParse("https://example.com").success,
        true,
    );
});

test("publicExternalUrl accepts http", () => {
    const schema = publicExternalUrl();

    assert.equal(
        schema.safeParse("http://example.com").success,
        true,
    );
});

test("publicExternalUrl rejects unsupported protocols", () => {
    const schema = publicExternalUrl();

    const result = schema.safeParse(
        "ftp://example.com",
    );

    assert.equal(result.success, false);
});

test("publicExternalUrl rejects malformed URLs", () => {
    const schema = publicExternalUrl();

    const result = schema.safeParse(
        "definitely-not-a-url",
    );

    assert.equal(result.success, false);
});

test("publicExternalUrl applies maximum length", () => {
    const schema = publicExternalUrl(
        "URL inválida",
        25,
    );

    assert.equal(
        schema.safeParse(
            "https://example.com/long-path",
        ).success,
        false,
    );
});

test("publicExternalUrl accepts URL below maximum length", () => {
    const schema = publicExternalUrl(
        "URL inválida",
        100,
    );

    assert.equal(
        schema.safeParse("https://example.com").success,
        true,
    );
});

test("publicExternalUrl trims URLs", () => {
    const schema = publicExternalUrl();

    const result = schema.safeParse(
        "   https://example.com   ",
    );

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(
            result.data,
            "https://example.com",
        );
    }
});

test("optionalPublicExternalUrl accepts an empty value", () => {
    const schema = optionalPublicExternalUrl();

    assert.equal(
        schema.safeParse("").success,
        true,
    );
});

test("optionalPublicExternalUrl accepts a valid URL", () => {
    const schema = optionalPublicExternalUrl();

    assert.equal(
        schema.safeParse("https://example.com").success,
        true,
    );
});

test("optionalPublicExternalUrl rejects invalid URLs", () => {
    const schema = optionalPublicExternalUrl();

    assert.equal(
        schema.safeParse("javascript:alert(1)").success,
        false,
    );
});

test("optionalPublicExternalUrl supports a maximum length", () => {
    const schema = optionalPublicExternalUrl(
        "URL inválida",
        20,
    );

    assert.equal(
        schema.safeParse(
            "https://example.com/too-long",
        ).success,
        false,
    );
});

//
// cn
//

test("cn merges class names", () => {
    assert.equal(
        cn("px-2", "py-2"),
        "px-2 py-2",
    );
});

test("cn removes falsy class names", () => {
    assert.equal(
        cn("px-2", false, null, undefined, "py-2"),
        "px-2 py-2",
    );
});

test("cn resolves conflicting Tailwind classes", () => {
    assert.equal(
        cn("px-2", "px-4"),
        "px-4",
    );
});