-- ============================================
-- LoopDesk Database Migration: Neon -> Supabase
-- Generated: 2026-01-09
-- Purpose: Create all tables from Prisma schema
-- ============================================

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('EXECUTIVE', 'BOARD_MEMBER', 'FOUNDER', 'INVESTOR', 'ADVISOR', 'OTHER');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('CEO', 'DEPUTY_CEO', 'CFO', 'CTO', 'COO', 'CHAIRMAN', 'VICE_CHAIRMAN', 'BOARD_MEMBER', 'BOARD_DEPUTY', 'AUDITOR', 'DEPUTY_AUDITOR', 'SIGNATORY', 'PROCURATOR', 'FOUNDER', 'OWNER', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('ANGEL', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C_PLUS', 'GROWTH', 'BUYOUT', 'SECONDARY', 'OTHER');

-- ============================================
-- USER TABLE (kept for data migration, will link to auth.users later)
-- ============================================
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON "User" FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (true);

-- ============================================
-- NEXTAUTH TABLES (kept for compatibility during migration)
-- ============================================
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- ============================================
-- FEED & CACHE TABLES
-- ============================================
CREATE TABLE "FeedCache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "etag" TEXT,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedCache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeedCache_url_key" ON "FeedCache"("url");

CREATE TABLE "GlobalFeedCache" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "items" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalFeedCache_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- ARTICLE TABLE
-- ============================================
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "author" TEXT,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceColor" TEXT,
    "sourceType" TEXT NOT NULL,
    "freshRssId" INTEGER,
    "feedId" TEXT,
    "titleHash" TEXT,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "mediaThumbnail" TEXT,
    "mediaDuration" TEXT,
    "mediaEmbed" TEXT,
    "mediaPlatform" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
CREATE UNIQUE INDEX "Article_freshRssId_key" ON "Article"("freshRssId");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX "Article_sourceId_idx" ON "Article"("sourceId");
CREATE INDEX "Article_titleHash_idx" ON "Article"("titleHash");
CREATE INDEX "Article_isBookmarked_idx" ON "Article"("isBookmarked");
CREATE INDEX "Article_userId_idx" ON "Article"("userId");
CREATE INDEX "Article_freshRssId_idx" ON "Article"("freshRssId");
CREATE INDEX "Article_mediaType_idx" ON "Article"("mediaType");

-- ============================================
-- FEED TABLE
-- ============================================
CREATE TABLE "Feed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "color" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "options" TEXT,
    "foloId" TEXT,
    "foloListId" TEXT,
    "syncSource" TEXT DEFAULT 'manual',
    "syncedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Feed_foloListId_idx" ON "Feed"("foloListId");
CREATE INDEX "Feed_syncSource_idx" ON "Feed"("syncSource");
CREATE UNIQUE INDEX "Feed_userId_url_key" ON "Feed"("userId", "url");

CREATE TABLE "FoloListConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "listUrl" TEXT NOT NULL,
    "listName" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "syncInterval" INTEGER NOT NULL DEFAULT 3600,
    "lastSyncAt" TIMESTAMP(3),
    "feedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoloListConfig_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FoloListConfig_userId_idx" ON "FoloListConfig"("userId");
CREATE INDEX "FoloListConfig_listId_idx" ON "FoloListConfig"("listId");
CREATE UNIQUE INDEX "FoloListConfig_userId_listId_key" ON "FoloListConfig"("userId", "listId");

-- ============================================
-- KEYWORD TABLES
-- ============================================
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifyPush" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Keyword_userId_term_key" ON "Keyword"("userId", "term");

CREATE TABLE "KeywordMatch" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "matchedIn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordMatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "KeywordMatch_keywordId_idx" ON "KeywordMatch"("keywordId");
CREATE UNIQUE INDEX "KeywordMatch_articleId_keywordId_key" ON "KeywordMatch"("articleId", "keywordId");

-- ============================================
-- SETTINGS TABLE (with RLS)
-- ============================================
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- Enable RLS on Settings
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON "Settings" FOR SELECT USING (true);
CREATE POLICY "Users can update own settings" ON "Settings" FOR UPDATE USING (true);
CREATE POLICY "Users can insert own settings" ON "Settings" FOR INSERT WITH CHECK (true);

-- ============================================
-- COMPANY FAVORITES & SEARCH HISTORY (with RLS)
-- ============================================
CREATE TABLE "CompanyFavorite" (
    "id" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyFavorite_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CompanyFavorite_userId_idx" ON "CompanyFavorite"("userId");
CREATE UNIQUE INDEX "CompanyFavorite_userId_orgNumber_key" ON "CompanyFavorite"("userId", "orgNumber");

ALTER TABLE "CompanyFavorite" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON "CompanyFavorite" FOR ALL USING (true);

CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

ALTER TABLE "SearchHistory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own search history" ON "SearchHistory" FOR ALL USING (true);

-- ============================================
-- WATCHED COMPANY TABLE
-- ============================================
CREATE TABLE "WatchedCompany" (
    "id" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hasLogo" BOOLEAN NOT NULL DEFAULT false,
    "impactNiche" TEXT,
    "city" TEXT,
    "ceo" TEXT,
    "startYear" TEXT,
    "fundraising" TEXT,
    "totalFunding" TEXT,
    "latestFundingRound" TEXT,
    "latestFundingDate" TEXT,
    "latestValuation" TEXT,
    "turnover2024" TEXT,
    "profit2024" TEXT,
    "turnover2023" TEXT,
    "profit2023" TEXT,
    "growth2023to2024" TEXT,
    "largestOwners" TEXT,
    "totalFundingNum" BIGINT,
    "latestValuationNum" BIGINT,
    "turnover2024Num" BIGINT,
    "profit2024Num" BIGINT,
    "growthNum" DOUBLE PRECISION,
    "legalName" TEXT,
    "companyType" TEXT,
    "status" TEXT,
    "registrationDate" TEXT,
    "chairman" TEXT,
    "employees" INTEGER,
    "address" TEXT,
    "postalCode" TEXT,
    "municipality" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "sniCode" TEXT,
    "sniDescription" TEXT,
    "paymentRemarks" BOOLEAN,
    "fSkatt" BOOLEAN,
    "momsRegistered" BOOLEAN,
    "parentCompany" TEXT,
    "subsidiaryCount" INTEGER,
    "shareCapital" BIGINT,
    "lastEnriched" TIMESTAMP(3),
    "enrichmentError" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "lastScraped" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchedCompany_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WatchedCompany_orgNumber_key" ON "WatchedCompany"("orgNumber");
CREATE INDEX "WatchedCompany_name_idx" ON "WatchedCompany"("name");
CREATE INDEX "WatchedCompany_orgNumber_idx" ON "WatchedCompany"("orgNumber");
CREATE INDEX "WatchedCompany_impactNiche_idx" ON "WatchedCompany"("impactNiche");
CREATE INDEX "WatchedCompany_city_idx" ON "WatchedCompany"("city");
CREATE INDEX "WatchedCompany_status_idx" ON "WatchedCompany"("status");
CREATE INDEX "WatchedCompany_municipality_idx" ON "WatchedCompany"("municipality");

ALTER TABLE "WatchedCompany" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON "WatchedCompany" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can modify" ON "WatchedCompany" FOR ALL TO authenticated USING (true);

-- ============================================
-- ANNOUNCEMENT TABLES
-- ============================================
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "reporter" TEXT,
    "type" TEXT,
    "subject" TEXT NOT NULL,
    "pubDate" TEXT,
    "publishedAt" TIMESTAMP(3),
    "detailText" TEXT,
    "fullText" TEXT,
    "url" TEXT,
    "orgNumber" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Announcement_orgNumber_idx" ON "Announcement"("orgNumber");
CREATE INDEX "Announcement_subject_idx" ON "Announcement"("subject");
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");
CREATE INDEX "Announcement_type_idx" ON "Announcement"("type");
CREATE INDEX "Announcement_scrapedAt_idx" ON "Announcement"("scrapedAt");

CREATE TABLE "ProtocolPurchase" (
    "id" SERIAL NOT NULL,
    "orgNumber" VARCHAR(12) NOT NULL,
    "companyName" VARCHAR(255),
    "protocolDate" DATE NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfPath" TEXT,
    "pdfUrl" TEXT,
    "extractedText" TEXT,
    "eventType" VARCHAR(50),
    "aiSummary" TEXT,
    "aiDetails" JSONB,
    "bv_data_fetched" BOOLEAN NOT NULL DEFAULT false,
    "bv_categories_fetched" TEXT,
    "bv_fetch_date" TIMESTAMP(3),
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolPurchase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProtocolPurchase_orgNumber_idx" ON "ProtocolPurchase"("orgNumber");
CREATE INDEX "ProtocolPurchase_protocolDate_idx" ON "ProtocolPurchase"("protocolDate");
CREATE INDEX "ProtocolPurchase_eventType_idx" ON "ProtocolPurchase"("eventType");
CREATE INDEX "ProtocolPurchase_notified_idx" ON "ProtocolPurchase"("notified");
CREATE UNIQUE INDEX "ProtocolPurchase_orgNumber_protocolDate_key" ON "ProtocolPurchase"("orgNumber", "protocolDate");

CREATE TABLE "AnnouncementSearchQueue" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AnnouncementSearchQueue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnnouncementSearchQueue_status_idx" ON "AnnouncementSearchQueue"("status");
CREATE INDEX "AnnouncementSearchQueue_createdAt_idx" ON "AnnouncementSearchQueue"("createdAt");

CREATE TABLE "AnnouncementScrapeStats" (
    "id" TEXT NOT NULL DEFAULT 'stats',
    "totalSearches" INTEGER NOT NULL DEFAULT 0,
    "totalAnnouncements" INTEGER NOT NULL DEFAULT 0,
    "lastSearchAt" TIMESTAMP(3),
    "captchaSolves" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "concurrentSearches" INTEGER NOT NULL DEFAULT 5,
    "delayMs" INTEGER NOT NULL DEFAULT 3000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnouncementScrapeStats_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- SYNC STATE
-- ============================================
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL DEFAULT 'freshrss',
    "lastItemId" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSynced" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- COMPANY ARTICLE MATCH
-- ============================================
CREATE TABLE "CompanyArticleMatch" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyArticleMatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CompanyArticleMatch_companyId_idx" ON "CompanyArticleMatch"("companyId");
CREATE INDEX "CompanyArticleMatch_articleId_idx" ON "CompanyArticleMatch"("articleId");
CREATE UNIQUE INDEX "CompanyArticleMatch_articleId_companyId_key" ON "CompanyArticleMatch"("articleId", "companyId");

-- ============================================
-- INVESTOR TABLES
-- ============================================
CREATE TABLE "FamilyOffice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgNumber" TEXT,
    "family" TEXT,
    "impactNiche" TEXT,
    "portfolioCompanies" TEXT,
    "description" TEXT,
    "familyStory" TEXT,
    "founded" INTEGER,
    "keyPeople" TEXT,
    "coInvestors" TEXT,
    "region" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hasLogo" BOOLEAN DEFAULT false,
    "assets" BIGINT,
    "revenue" BIGINT,
    "profit" BIGINT,
    "employees" INTEGER,
    "growthPercent" DOUBLE PRECISION,
    "lastFinancialYear" INTEGER,
    "financialsUpdated" TIMESTAMP(3),
    "companyStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyOffice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FamilyOffice_name_key" ON "FamilyOffice"("name");
CREATE INDEX "FamilyOffice_name_idx" ON "FamilyOffice"("name");
CREATE INDEX "FamilyOffice_family_idx" ON "FamilyOffice"("family");
CREATE INDEX "FamilyOffice_impactNiche_idx" ON "FamilyOffice"("impactNiche");
CREATE INDEX "FamilyOffice_region_idx" ON "FamilyOffice"("region");
CREATE INDEX "FamilyOffice_orgNumber_idx" ON "FamilyOffice"("orgNumber");

CREATE TABLE "VCCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgNumber" TEXT,
    "type" TEXT,
    "impactNiche" TEXT,
    "portfolioCompanies" TEXT,
    "description" TEXT,
    "descriptionOriginal" TEXT,
    "history" TEXT,
    "portfolioExamples" TEXT,
    "notableDeals" TEXT,
    "website" TEXT,
    "office" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "readMoreUrl" TEXT,
    "sources" TEXT,
    "hasLogo" BOOLEAN DEFAULT false,
    "aum" BIGINT,
    "assets" BIGINT,
    "revenue" BIGINT,
    "profit" BIGINT,
    "employees" INTEGER,
    "growthPercent" DOUBLE PRECISION,
    "lastFinancialYear" INTEGER,
    "financialsUpdated" TIMESTAMP(3),
    "companyStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VCCompany_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VCCompany_name_key" ON "VCCompany"("name");
CREATE INDEX "VCCompany_name_idx" ON "VCCompany"("name");
CREATE INDEX "VCCompany_impactNiche_idx" ON "VCCompany"("impactNiche");
CREATE INDEX "VCCompany_type_idx" ON "VCCompany"("type");
CREATE INDEX "VCCompany_orgNumber_idx" ON "VCCompany"("orgNumber");

-- ============================================
-- WIDGET SCHEDULE
-- ============================================
CREATE TABLE "WidgetSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "widgetType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "lastError" TEXT,
    "lastStats" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WidgetSchedule_widgetType_idx" ON "WidgetSchedule"("widgetType");
CREATE INDEX "WidgetSchedule_isActive_idx" ON "WidgetSchedule"("isActive");

-- ============================================
-- PERSON TABLES
-- ============================================
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthYear" INTEGER,
    "allabolagId" TEXT,
    "linkedinSlug" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "imageUrl" TEXT,
    "location" TEXT,
    "personType" "PersonType" NOT NULL DEFAULT 'EXECUTIVE',
    "tags" TEXT[],
    "totalCompanies" INTEGER NOT NULL DEFAULT 0,
    "activeCompanies" INTEGER NOT NULL DEFAULT 0,
    "totalBoardSeats" INTEGER NOT NULL DEFAULT 0,
    "totalInvestments" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'allabolag',
    "lastEnriched" TIMESTAMP(3),
    "enrichmentError" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Person_allabolagId_key" ON "Person"("allabolagId");
CREATE UNIQUE INDEX "Person_linkedinSlug_key" ON "Person"("linkedinSlug");
CREATE INDEX "Person_name_idx" ON "Person"("name");
CREATE INDEX "Person_lastName_idx" ON "Person"("lastName");
CREATE INDEX "Person_personType_idx" ON "Person"("personType");
CREATE INDEX "Person_location_idx" ON "Person"("location");

CREATE TABLE "PersonRole" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "watchedCompanyId" TEXT,
    "roleType" "RoleType" NOT NULL,
    "roleTitle" TEXT,
    "roleGroup" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'allabolag',
    "sourceId" TEXT,
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonRole_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PersonRole_orgNumber_idx" ON "PersonRole"("orgNumber");
CREATE INDEX "PersonRole_roleType_idx" ON "PersonRole"("roleType");
CREATE INDEX "PersonRole_isActive_idx" ON "PersonRole"("isActive");
CREATE INDEX "PersonRole_watchedCompanyId_idx" ON "PersonRole"("watchedCompanyId");
CREATE UNIQUE INDEX "PersonRole_personId_orgNumber_roleType_key" ON "PersonRole"("personId", "orgNumber", "roleType");

CREATE TABLE "PersonFounder" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "watchedCompanyId" TEXT,
    "foundedYear" INTEGER,
    "isCoFounder" BOOLEAN NOT NULL DEFAULT false,
    "founderOrder" INTEGER,
    "exitYear" INTEGER,
    "exitType" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonFounder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PersonFounder_orgNumber_idx" ON "PersonFounder"("orgNumber");
CREATE INDEX "PersonFounder_foundedYear_idx" ON "PersonFounder"("foundedYear");
CREATE UNIQUE INDEX "PersonFounder_personId_orgNumber_key" ON "PersonFounder"("personId", "orgNumber");

CREATE TABLE "PersonInvestment" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "orgNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "watchedCompanyId" TEXT,
    "investmentType" "InvestmentType",
    "roundName" TEXT,
    "investmentDate" TIMESTAMP(3),
    "amount" BIGINT,
    "ownershipPercent" DOUBLE PRECISION,
    "votingPercent" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "exitDate" TIMESTAMP(3),
    "exitType" TEXT,
    "exitMultiple" DOUBLE PRECISION,
    "investmentVehicle" TEXT,
    "vehicleOrgNumber" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonInvestment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PersonInvestment_orgNumber_idx" ON "PersonInvestment"("orgNumber");
CREATE INDEX "PersonInvestment_investmentType_idx" ON "PersonInvestment"("investmentType");
CREATE INDEX "PersonInvestment_investmentDate_idx" ON "PersonInvestment"("investmentDate");
CREATE UNIQUE INDEX "PersonInvestment_personId_orgNumber_key" ON "PersonInvestment"("personId", "orgNumber");

-- ============================================
-- COMPANY SEARCH LOG
-- ============================================
CREATE TABLE "CompanySearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanySearchLog_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- FOREIGN KEYS
-- ============================================
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Feed" ADD CONSTRAINT "Feed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FoloListConfig" ADD CONSTRAINT "FoloListConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KeywordMatch" ADD CONSTRAINT "KeywordMatch_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KeywordMatch" ADD CONSTRAINT "KeywordMatch_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyFavorite" ADD CONSTRAINT "CompanyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyArticleMatch" ADD CONSTRAINT "CompanyArticleMatch_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyArticleMatch" ADD CONSTRAINT "CompanyArticleMatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "WatchedCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonRole" ADD CONSTRAINT "PersonRole_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonFounder" ADD CONSTRAINT "PersonFounder_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonInvestment" ADD CONSTRAINT "PersonInvestment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
