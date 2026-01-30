-- CreateEnum
CREATE TYPE "Workflow" AS ENUM ('human', 'ai', 'human_ai', 'ai_human');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('female', 'male', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('secondary', 'bachelor', 'master', 'phd', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "EnglishLevel" AS ENUM ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native', 'prefer_not_to_say');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "timeMs" INTEGER,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreQuestionnaire" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "regionDE" TEXT,
    "education" "Education",
    "nativeLang" TEXT,
    "englishLevel" "EnglishLevel",
    "writingConfidence" INTEGER,
    "aiasLife" INTEGER,
    "aiasWork" INTEGER,
    "aiasFutureUse" INTEGER,
    "aiasHumanity" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "workflow" "Workflow" NOT NULL,
    "taskId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "text" TEXT,
    "timeMs" INTEGER,
    "wordCount" INTEGER,
    "charCount" INTEGER,
    "passed" BOOLEAN,
    "requirementResults" JSONB,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "workflow" "Workflow" NOT NULL,
    "taskId" TEXT NOT NULL,
    "liking" INTEGER,
    "trust" INTEGER,
    "satisfaction" INTEGER,
    "mentalDemand" INTEGER,
    "physicalDemand" INTEGER,
    "temporalDemand" INTEGER,
    "effort" INTEGER,
    "frustration" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "satisfaction" INTEGER,
    "clarity" INTEGER,
    "effort" INTEGER,
    "frustration" INTEGER,
    "bestWorkflow" "Workflow",
    "bestWorkflowReason" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChat" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT,
    "action" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreQuestionnaire_sessionId_key" ON "PreQuestionnaire"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_sessionId_index_key" ON "Round"("sessionId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "RoundFeedback_sessionId_roundIndex_key" ON "RoundFeedback"("sessionId", "roundIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_sessionId_key" ON "Feedback"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AiChat_roundId_key" ON "AiChat"("roundId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreQuestionnaire" ADD CONSTRAINT "PreQuestionnaire_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundFeedback" ADD CONSTRAINT "RoundFeedback_sessionId_roundIndex_fkey" FOREIGN KEY ("sessionId", "roundIndex") REFERENCES "Round"("sessionId", "index") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChat" ADD CONSTRAINT "AiChat_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "AiChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
