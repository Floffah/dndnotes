import { JSONContent } from "@tiptap/core";

import { DocumentFormat } from "@/db/enums/DocumentFormat";
import { Campaign } from "@/db/models/Campaign";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/types/baseModel";

export interface Document extends IBaseModel {
    name: string;
    format: DocumentFormat;
    creator: User;
    campaign: Campaign;
    notionId?: string; // if format is NOTION
    richText?: JSONContent; // if format is RICH_TEXT
}
