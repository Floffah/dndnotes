import { z } from "zod";

import { ViewableBy } from "@/enums/ViewableBy";
import { Campaign } from "@/models/Campaign";
import { CampaignMember } from "@/models/CampaignMember";
import { Document } from "@/models/Document";
import { IBaseModel } from "@/types/baseModel";

export interface Character extends IBaseModel {
    name: string;
    campaign: Campaign;
    createdBy: CampaignMember;
    viewableBy: ViewableBy;
    describer?: Document;
    content?: CharacterSheet;
}

export enum CharacterSheetNodeType {
    DESCRIPTION = "DESCRIPTION",
    ATTRIBUTE_SET = "ATTRIBUTE_SET",
    INVENTORY = "INVENTORY",
    NOTE = "NOTE",
    RELATIONSHIP_SET = "RELATIONSHIP_SET",

    SPLIT_LAYOUT = "SPLIT_LAYOUT",
}

export const characterSheetBaseNode = z.object({
    type: z.nativeEnum(CharacterSheetNodeType),
});

export const characterDescriptionNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.DESCRIPTION),
    name: z.string().min(1).max(100),
    content: z.string(),
});
export type CharacterDescriptionNode = z.infer<typeof characterDescriptionNode>;

export enum CharacterAttributeType {
    ABILITY_SCORE = "ABILITY_SCORE",
    SKILL = "SKILL",
    SAVING_THROW = "SAVING_THROW",

    CUSTOM = "CUSTOM",
}

export enum CharacterAttributeSpecialSource {
    DND_5E = "DND_5E",
    NONE = "NONE",
}

export const characterAttribute = z.object({
    name: z.string().min(1).max(100),
    special: z.optional(
        z.object({
            source: z.nativeEnum(CharacterAttributeSpecialSource),
            key: z.string(),
        }),
    ),
    value: z.union([z.number(), z.string()]),
});
export type CharacterAttribute = z.infer<typeof characterAttribute>;

export const characterAttributeSetNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.ATTRIBUTE_SET),
    name: z.string().min(1).max(100),
    attributes: z.array(characterAttribute),
    attributesType: z.nativeEnum(CharacterAttributeType),
});
export type CharacterAttributeSetNode = z.infer<
    typeof characterAttributeSetNode
>;

export const characterItem = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    quantity: z.number(),
});
export type CharacterItem = z.infer<typeof characterItem>;

export const characterInventoryNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.INVENTORY),
    name: z.string().min(1).max(100),
    items: z.array(characterItem),
});
export type CharacterInventoryNode = z.infer<typeof characterInventoryNode>;

export const characterNoteNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.NOTE),
    name: z.string().min(1).max(100),
    content: z.string(),
});
export type CharacterNoteNode = z.infer<typeof characterNoteNode>;

export const characterRelationship = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    characterId: z.string(),
});
export type CharacterRelationship = z.infer<typeof characterRelationship>;

export const characterRelationshipSetNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.RELATIONSHIP_SET),
    name: z.string().min(1).max(100),
    relationships: z.array(characterRelationship),
});
export type CharacterRelationshipSetNode = z.infer<
    typeof characterRelationshipSetNode
>;

export const characterNode = z.union([
    characterDescriptionNode,
    characterAttributeSetNode,
    characterInventoryNode,
    characterNoteNode,
    characterRelationshipSetNode,
]);
export type CharacterNode = z.infer<typeof characterNode>;

export const splitLayoutNode = characterSheetBaseNode.extend({
    type: z.literal(CharacterSheetNodeType.SPLIT_LAYOUT),
    name: z.optional(z.string().min(1).max(100)),
    nodes: z.array(characterNode),
});
export type SplitLayoutNode = z.infer<typeof splitLayoutNode>;

export const characterSheetNode = z.union([characterNode, splitLayoutNode]);
export type CharacterSheetNode = z.infer<typeof characterSheetNode>;

export const characterSheet = z.object({
    nodes: z.array(characterSheetNode),
});
export type CharacterSheet = z.infer<typeof characterSheet>;
