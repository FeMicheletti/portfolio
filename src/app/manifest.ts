import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Felipe Micheletti | Portfolio",
    short_name: "FM Portfolio",
    description: "Portfolio de Felipe Micheletti, Full-Stack Developer.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#7c3aed",
  };
}
