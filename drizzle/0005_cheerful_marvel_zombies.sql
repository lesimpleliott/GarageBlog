ALTER TABLE `articles` ADD `status` enum('draft','published') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` ADD `published_at` datetime;--> statement-breakpoint
-- Ajouté à la main : les articles écrits avant cette migration restent publics, publiés à leur date de création
UPDATE `articles` SET `status` = "published", `published_at`= `created_at`;