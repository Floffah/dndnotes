ALTER TABLE `campaign_invites` DROP INDEX `code_idx`;--> statement-breakpoint
ALTER TABLE `campaign_members` DROP INDEX `public_id_idx`;--> statement-breakpoint
ALTER TABLE `campaign_schedules` DROP INDEX `public_id_idx`;--> statement-breakpoint
ALTER TABLE `campaign_sessions` DROP INDEX `public_id_idx`;--> statement-breakpoint
ALTER TABLE `campaigns` DROP INDEX `public_id_idx`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `public_id_idx`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `name_idx`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `email_idx`;--> statement-breakpoint
ALTER TABLE `user_sessions` DROP INDEX `token_idx`;