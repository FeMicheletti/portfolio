const Module = require("module");

const originalLoad = Module._load;

const mediaRecord = {
    id: "cmedia_unlinked_secret",
    drivePath: "portfolio/media/secret-admin-only.pdf",
    fileName: "secret-admin-only.pdf",
    mimeType: "application/pdf",
};

Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "@/lib/prisma") {
        return {
            prisma: {
                mediaAsset: {
                    findUnique: async ({ where }) => {
                        if (where?.id === mediaRecord.id) {
                            return {
                                drivePath: mediaRecord.drivePath,
                                fileName: mediaRecord.fileName,
                                mimeType: mediaRecord.mimeType,
                            };
                        }
                        return null;
                    },
                },
            },
        };
    }

    if (request === "@/lib/onedrive/client") {
        return {
            oneDriveContentUrl(path) {
                return `http://127.0.0.1:4010/api/v1/files/content?path=${encodeURIComponent(path)}`;
            },
        };
    }

    return originalLoad(request, parent, isMain);
};

async function main() {
    const http = require("node:http");

    const server = http.createServer((req, res) => {
        const url = new URL(req.url, "http://127.0.0.1:4010");
        if (url.pathname === "/api/v1/files/content" && url.searchParams.get("path") === mediaRecord.drivePath) {
            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Length": "18",
            });
            res.end("TOP-SECRET-RESUME\n");
            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("not found");
    });

    await new Promise((resolve) => server.listen(4010, "127.0.0.1", resolve));

    try {
        const route = require("./src/app/api/media/[id]/route.ts");
        const request = new Request(`http://127.0.0.1:3000/api/media/${mediaRecord.id}?download=1&filename=Probe.pdf`);
        const response = await route.GET(request, {
            params: Promise.resolve({ id: mediaRecord.id }),
        });

        const body = await response.text();
        console.log(
            JSON.stringify(
                {
                    status: response.status,
                    contentType: response.headers.get("content-type"),
                    disposition: response.headers.get("content-disposition"),
                    cacheControl: response.headers.get("cache-control"),
                    body,
                },
                null,
                2,
            ),
        );

        const missing = await route.GET(new Request("http://127.0.0.1:3000/api/media/does-not-exist"), {
            params: Promise.resolve({ id: "does-not-exist" }),
        });
        console.log(
            JSON.stringify(
                {
                    missingStatus: missing.status,
                    missingBody: await missing.text(),
                },
                null,
                2,
            ),
        );
    } finally {
        server.close();
        Module._load = originalLoad;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
