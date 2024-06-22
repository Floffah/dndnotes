CREATE TABLE `campaign_invites` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`accepted_by` json NOT NULL DEFAULT ('[]'),
	`code` varchar(32) NOT NULL,
	CONSTRAINT `campaign_invites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`user_id` int NOT NULL,
	`campaign_member_type` enum('PLAYER','DM'),
	CONSTRAINT `campaign_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`campaign_id` int NOT NULL,
	`first_session_at` datetime NOT NULL,
	`repeat_interval` enum('WEEKLY','FORTNIGHTLY','MONTHLY'),
	`length` int NOT NULL,
	CONSTRAINT `campaign_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`campaign_id` int NOT NULL,
	`schedule_id` int,
	`campaign_session_type` enum('ONE_SHOT','MAIN'),
	`started_at` datetime NOT NULL,
	CONSTRAINT `campaign_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`created_by_user_id` int NOT NULL,
	`total_sessions` int NOT NULL DEFAULT 0,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_oauth_providers` MODIFY COLUMN `oauth_provider` enum('DISCORD') NOT NULL;--> statement-breakpoint
CREATE INDEX `created_by_user_id_idx` ON `campaigns` (`created_by_user_id`);