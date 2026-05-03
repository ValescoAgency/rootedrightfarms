import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rooted Right Farms",
    short_name: "Rooted Right",
    description:
      "Premium indoor hydroponic cannabis cultivation in Ardmore, Oklahoma.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#1B3A28",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
