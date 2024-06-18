ALTER TABLE `users` MODIFY COLUMN `name` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` datetime DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_active_at` datetime DEFAULT now();