import "server-only";

type OneDriveFileResponse = {
	id: string;
	name: string;
	size: number;
	file?: {
		mimeType?: string;
	};
};

function oneDriveConfig() {
	const apiUrl = process.env.ONEDRIVE_API_URL?.replace(/\/$/, "");
	const apiToken = process.env.ONEDRIVE_API_TOKEN;

	if (!apiUrl || !apiToken) throw new Error("A integração com o OneDrive ainda não foi configurada.");

	return { apiUrl, apiToken };
}

async function responseError(response: Response) {
	try {
		const body = (await response.json()) as { message?: string };
		return (body.message || `A API OneDrive respondeu com status ${response.status}.`);
	} catch {
		return `A API OneDrive respondeu com status ${response.status}.`;
	}
}

export async function uploadToOneDrive({ file, path }: { file: File; path: string; }) {
	const { apiUrl, apiToken } = oneDriveConfig();
	const formData = new FormData();

	formData.set("file", file, file.name);
	formData.set("path", path);

	const response = await fetch(`${apiUrl}/api/v1/files`, {
		method: "POST",
		headers: { "X-API-Key": apiToken },
		body: formData,
		cache: "no-store",
	});

	if (!response.ok) throw new Error(await responseError(response));

	const uploadedFile = (await response.json()) as OneDriveFileResponse;
	if (!uploadedFile.id || !uploadedFile.name || typeof uploadedFile.size !== "number") throw new Error("A API OneDrive retornou dados incompletos para o arquivo.");

	return uploadedFile;
}

export async function deleteFromOneDrive(path: string) {
	const { apiUrl, apiToken } = oneDriveConfig();
	const response = await fetch(`${apiUrl}/api/v1/files?path=${encodeURIComponent(path)}`, {
		method: "DELETE",
		headers: { "X-API-Key": apiToken },
		cache: "no-store"
	});

	if (!response.ok && response.status !== 404) throw new Error(await responseError(response));
}

export function oneDriveContentUrl(path: string) {
	const apiUrl = process.env.ONEDRIVE_API_URL?.replace(/\/$/, "");
	if (!apiUrl) return null;

	return `${apiUrl}/api/v1/files/content?path=${encodeURIComponent(path)}`;
}