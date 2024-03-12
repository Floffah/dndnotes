import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { CampaignMember } from "@/db/models/CampaignMember";
import { CampaignMemberAPIModel } from "@/db/models/CampaignMember/consumers";
import { Character, CharacterSheet } from "@/db/models/Character/index";
import { Document } from "@/db/models/Document";
import { DocumentAPIModel } from "@/db/models/Document/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class CharacterAPIModel extends BaseAPIModel implements Character {
    name: string;
    campaign: Campaign;
    createdBy: CampaignMember;
    describer?: Document;
    content?: CharacterSheet;

    constructor(character: Character, ctx: ConsumerContext) {
        super(character, ctx);

        this.name = character.name;
        this.campaign = isPopulated(character.campaign)
            ? new CampaignAPIModel(character.campaign, ctx)
            : null!;
        this.createdBy = isPopulated(character.createdBy)
            ? new CampaignMemberAPIModel(character.createdBy, ctx)
            : null!;
        this.describer =
            character.describer && isPopulated(character.describer)
                ? new DocumentAPIModel(character.describer, ctx)
                : null!;
        this.content = character.content;
    }
}
