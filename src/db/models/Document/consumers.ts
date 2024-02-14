import { JSONContent } from "@tiptap/core";

import { DocumentFormat } from "@/db/enums/DocumentFormat";
import { isPopulated } from "@/db/lib/isPopulated";
import { Campaign } from "@/db/models/Campaign";
import { CampaignAPIModel } from "@/db/models/Campaign/consumers";
import { Document } from "@/db/models/Document/index";
import { User } from "@/db/models/User";
import { UserAPIModel } from "@/db/models/User/consumers";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

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
