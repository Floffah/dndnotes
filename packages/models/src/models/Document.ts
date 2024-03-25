import { JSONContent } from "@tiptap/core";

import { DocumentFormat } from "@/enums/DocumentFormat";
import { Campaign } from "@/models/Campaign";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface Document extends IBaseModel {
    name: string;
    format: DocumentFormat;
    creator: User;
    campaign: Campaign;
    notionId?: string; // if format is NOTION
    richText?: JSONContent; // if format is RICH_TEXT
}
