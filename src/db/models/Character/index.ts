import { Campaign } from "@/db/models/Campaign";
import { Document } from "@/db/models/Document";
import { IBaseModel } from "@/db/models/baseModel";

export interface Character extends IBaseModel {
    name: string;
    campaign: Campaign;
    describer?: Document;
}
