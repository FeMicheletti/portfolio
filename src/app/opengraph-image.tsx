import { ImageResponse } from "next/og";

export const alt = "Felipe Micheletti — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "72px 82px",
                background: "radial-gradient(circle at 85% 10%, #4c1d95 0%, #18181b 38%, #09090b 78%)",
                color: "white",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    fontSize: 28,
                    color: "#c4b5fd",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        background: "#8b5cf6",
                        boxShadow: "0 0 40px #7c3aed",
                    }}
                />
                portfolio.ts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-3px" }}>Felipe Micheletti</div>
                <div style={{ fontSize: 36, color: "#d4d4d8" }}>Full-Stack Developer</div>
                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        marginTop: 16,
                        fontSize: 24,
                        color: "#a1a1aa",
                    }}
                >
                    <span>Web</span>
                    <span>•</span>
                    <span>APIs</span>
                    <span>•</span>
                    <span>Mobile</span>
                    <span>•</span>
                    <span>Cloud</span>
                </div>
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#71717a" }}>felipemicheletti.com</div>
        </div>,
        size,
    );
}
