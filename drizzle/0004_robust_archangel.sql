ALTER TABLE `articles` DROP FOREIGN KEY `articles_author_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;