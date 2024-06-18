CREATE TABLE `user_oauth_providers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`oauth_provider` enum('discord'),
	`provider_user_id` varchar(256),
	CONSTRAINT `user_oauth_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	`email` varchar(320),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `name_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_oauth_providers` (`user_id`);