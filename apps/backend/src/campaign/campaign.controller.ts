import {BadRequestException, Controller, Get, NotFoundException, Param} from "@nestjs/common";
import {CampaignAPIModel, CampaignError, UserSession} from "@dndnotes/models";

import { ObjectId } from "mongodb";
import {CampaignModel} from "@/lib/db/models/CampaignModel";
import {Session} from "@/lib/decorators/session.decorator";

@Controller("/campaign")
export class CampaignController {
    @Get()
    async get(@Param("id") id: string, @Session() session: UserSession) {
        if (!ObjectId.isValid(id)) {
            throw new NotFoundException(CampaignError.NOT_FOUND);
        }

        const campaign = await CampaignModel.findById(new ObjectId(id))
            .populate("createdBy")
            .exec();

        if(!campaign) {
            throw new NotFoundException(CampaignError.NOT_FOUND);
        }

        return new CampaignAPIModel(campaign, {
            user: session?.user,
        });
    }
}