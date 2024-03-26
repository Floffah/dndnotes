import { JSONContent } from "@tiptap/core";

import { CampaignAPIModel } from "@/consumers/CampaignAPIModel";
import { UserAPIModel } from "@/consumers/UserAPIModel";
import { DocumentFormat } from "@/enums/DocumentFormat";
import { isPopulated } from "@/lib/isPopulated";
import { Campaign } from "@/models/Campaign";
import { Document } from "@/models/Document";
import { User } from "@/models/User";
import { BaseAPIModel } from "@/types/baseModel";
import { ConsumerContext } from "@/types/consumerContext";

export class DocumentAPIModel extends BaseAPIModel implements Document {
    name: string;
    format: DocumentFormat;
    creator: User;
    campaign: Campaign;
    notionId?: string; // if format is NOTION
    richText?: JSONContent; // if format is RICH_TEXT

    constructor(document: Document, ctx: ConsumerContext) {
        super(document, ctx);

        this.name = document.name;
        this.format = document.format;
        this.creator = isPopulated(document.creator)
            ? new UserAPIModel(document.creator, ctx)
            : null!;
        this.campaign = isPopulated(document.campaign)
            ? new CampaignAPIModel(document.campaign, ctx)
            : null!;
        this.notionId = document.notionId;
        this.richText = document.richText;
    }
}
