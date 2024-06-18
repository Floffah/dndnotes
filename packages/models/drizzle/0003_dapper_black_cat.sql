ALTER TABLE `user_oauth_providers` MODIFY COLUMN `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `user_oauth_providers` MODIFY COLUMN `oauth_provider` enum('discord') NOT NULL;--> statement-breakpoint
ALTER TABLE `user_oauth_providers` MODIFY COLUMN `provider_user_id` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` MODIFY COLUMN `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` MODIFY COLUMN `token` varchar(256) NOT NULL;--> statement-breakpoint
CREATE INDEX `provider_user_id_idx` ON `user_oauth_providers` (`provider_user_id`);