import { Metadata } from "next";

interface PopulateMetadataOptions {
    title?: string;
    description?: string;
    image?: string;
}

export function populateMetadata(
    { title, description, image }: PopulateMetadataOptions,
    override: Metadata = {},
): Metadata {
    return {
        metadataBase: new URL("https://dndnotes.floffah.dev"),
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
        ...override,
    };
}
