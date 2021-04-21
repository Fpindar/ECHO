-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "creatorEmail" VARCHAR(255) NOT NULL,
    "creatorName" VARCHAR(255) NOT NULL,
    "text" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);
