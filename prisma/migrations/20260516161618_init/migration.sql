-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'caregiver');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "cover_style" AS ENUM ('classic_leather', 'vintage_gold', 'forest_green');

-- CreateEnum
CREATE TYPE "story_status" AS ENUM ('processing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "share_link_type" AS ENUM ('single_story', 'full_book');

-- CreateTable
CREATE TABLE "care_homes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "care_home_id" UUID NOT NULL,
    "role" "user_role" NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" UUID NOT NULL,
    "care_home_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "gender" NOT NULL,
    "date_of_birth" DATE,
    "room_number" TEXT,
    "profile_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_books" (
    "id" UUID NOT NULL,
    "resident_id" UUID NOT NULL,
    "book_title" TEXT NOT NULL,
    "cover_style" "cover_style" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "life_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" UUID NOT NULL,
    "life_book_id" UUID NOT NULL,
    "recorded_by" UUID NOT NULL,
    "audio_file_url" TEXT NOT NULL,
    "raw_transcript" TEXT NOT NULL,
    "literary_content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "story_status" NOT NULL DEFAULT 'processing',
    "duration_seconds" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" UUID NOT NULL,
    "type" "share_link_type" NOT NULL,
    "life_book_id" UUID,
    "story_id" UUID,
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_care_home_id_idx" ON "users"("care_home_id");

-- CreateIndex
CREATE INDEX "residents_care_home_id_idx" ON "residents"("care_home_id");

-- CreateIndex
CREATE UNIQUE INDEX "life_books_resident_id_key" ON "life_books"("resident_id");

-- CreateIndex
CREATE INDEX "stories_life_book_id_idx" ON "stories"("life_book_id");

-- CreateIndex
CREATE INDEX "stories_recorded_by_idx" ON "stories"("recorded_by");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_access_token_key" ON "share_links"("access_token");

-- CreateIndex
CREATE INDEX "share_links_life_book_id_idx" ON "share_links"("life_book_id");

-- CreateIndex
CREATE INDEX "share_links_story_id_idx" ON "share_links"("story_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_care_home_id_fkey" FOREIGN KEY ("care_home_id") REFERENCES "care_homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_care_home_id_fkey" FOREIGN KEY ("care_home_id") REFERENCES "care_homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_books" ADD CONSTRAINT "life_books_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_life_book_id_fkey" FOREIGN KEY ("life_book_id") REFERENCES "life_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_life_book_id_fkey" FOREIGN KEY ("life_book_id") REFERENCES "life_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
