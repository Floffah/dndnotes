CREATE TABLE `user_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`token` varchar(256),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_idx` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `email_idx` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_sessions` (`user_id`);