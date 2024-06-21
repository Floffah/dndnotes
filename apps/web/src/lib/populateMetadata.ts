import { Metadata } from "next";
import type { Icon } from "next/dist/lib/metadata/types/metadata-types";

interface PopulateMetadataOptions {
    title?: string;
    description?: string;
    image?: string;
    icons?: Icon[];
}

export function populateMetadata(
    { title, description, image }: PopulateMetadataOptions,
    override: Omit<Metadata, "icons"> = {},
): Metadata {
    return {
        metadataBase: new URL("https://dndnotes.app"),
        title,
        description,
        openGraph: {
            title,
            description,
            ...override.openGraph,
        },
        twitter: {
            title,
            description,
            ...override.twitter,
        },
        icons: [
            {
                url: "/logos/dndnotes16.png",
                rel: "icon",
                type: "image/png",
                sizes: "16x16",
            },
            {
                url: "/logos/dndnotes32.png",
                rel: "icon",
                type: "image/png",
                sizes: "32x32",
            },
            {
                url: "/logos/dndnotes64.png",
                rel: "icon",
                type: "image/png",
                sizes: "64x64",
            },
            {
                url: "/logos/dndnotes.png",
                rel: "icon",
                type: "image/png",
                sizes: "1024x1024",
            },
        ],
        ...override,
    };
}
