import {Module} from "@nestjs/common";
import {CampaignController} from "@/campaign/campaign.controller";

@Module({
    controllers: [CampaignController],
    imports: []
})
export class CampaignModule {}