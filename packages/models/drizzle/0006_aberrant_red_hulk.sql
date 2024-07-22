ALTER TABLE `campaign_members` ADD `public_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_schedules` ADD `public_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_sessions` ADD `public_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `public_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `public_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_invites` ADD CONSTRAINT `campaign_invites_code_unique` UNIQUE(`code`);--> statement-breakpoint
ALTER TABLE `campaign_invites` ADD CONSTRAINT `code_idx` UNIQUE(`code`);--> statement-breakpoint
ALTER TABLE `campaign_members` ADD CONSTRAINT `campaign_members_public_id_unique` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaign_members` ADD CONSTRAINT `public_id_idx` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaign_schedules` ADD CONSTRAINT `campaign_schedules_public_id_unique` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaign_schedules` ADD CONSTRAINT `public_id_idx` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaign_sessions` ADD CONSTRAINT `campaign_sessions_public_id_unique` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaign_sessions` ADD CONSTRAINT `public_id_idx` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_public_id_unique` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `public_id_idx` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_public_id_unique` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_name_unique` UNIQUE(`name`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `public_id_idx` UNIQUE(`public_id`);--> statement-breakpoint
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_token_unique` UNIQUE(`token`);