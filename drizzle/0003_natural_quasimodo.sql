ALTER TABLE `articles` ADD `author_id` varchar(36) NOT NULL;--> statement-breakpoint
UPDATE `articles` SET `author_id` = (SELECT `id` FROM `user` ORDER BY `created_at` LIMIT 1);--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;