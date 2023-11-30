import { DocumentType } from "@/db/enums/DocumentType";
import { Campaign } from "@/db/models/Campaign";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface Document extends IBaseModel {
    name: string;
    type: DocumentType;
    creator: User;
    campaign: Campaign;
    notionId: string;
    recordMap: {
        type: string;
        value: string;
    }[];
}
