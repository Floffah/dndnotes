import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { CampaignMemberAPIModel } from "@/consumers/CampaignMemberAPIModel";
import { DocumentAPIModel } from "@/consumers/DocumentAPIModel";
import { ViewableBy } from "@/enums";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { CampaignMember } from "@/models/CampaignMember";
import { Character, CharacterSheet } from "@/models/Character";
import { Document } from "@/models/Document";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

export class CharacterAPIModel extends BaseAPIModel implements Character {
    name: string;
    campaign: Campaign;
    createdBy: CampaignMember;
    viewableBy: ViewableBy;
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
        this.viewableBy = character.viewableBy;
        this.describer =
            character.describer && isPopulated(character.describer)
                ? new DocumentAPIModel(character.describer, ctx)
                : null!;
        this.content = character.content;
    }
}
