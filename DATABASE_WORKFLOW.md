# Database Migration & Environment Strategy Plan (DATABASE_WORKFLOW)

This document establishes a safe, incremental workflow for migrating the DKFFJ Next.js project from direct schema pushes (`db push`) to structured database migrations (`prisma migrate`).

---

## 1. Current State Assessment & Target
*   **Database Target:** Production Supabase project `tgszzjbvpcznndrfkkov` on AWS (ap-southeast-2).
*   **Current Schema State:** Contains production tables, enums, triggers, and the newly added `referred_by_member_id` column, self-referencing relationship, and index.
*   **Current Migration History:** **None.** The database lacks the `_prisma_migrations` tracking table, meaning any standard migration command would attempt to recreate all tables from scratch, causing irreversible data loss.

---

## 2. Prisma Baseline Strategy for Production
Baselining is the process of creating a migration representing the current schema as it exists today, and marking it as "already applied" so Prisma knows not to execute the creation scripts.

### Generating the Initial Baseline SQL (Prisma Migrate Diff):
Instead of running interactive command utilities against live environments, the baseline SQL file is generated declaratively from an empty state to the current `schema.prisma` datamodel:

1.  **Initialize the migration directory structure:**
    Create a folder named `0_init` inside `prisma/migrations`:
    `prisma/migrations/0_init`

2.  **Generate baseline SQL script:**
    Run the following read-only command using the `migrate diff` tool:
    ```bash
    npx prisma migrate diff \
      --from-empty \
      --to-schema-datamodel prisma/schema.prisma \
      --script > prisma/migrations/0_init/migration.sql
    ```
    *This generates all table, enum, index, and relationship creation SQL commands exactly as represented in `schema.prisma`.*

3.  **Manual review:**
    Inspect the generated `prisma/migrations/0_init/migration.sql` file to ensure it aligns with the expected baseline.

4.  **Mark the baseline as applied on production:**
    After verifying the SQL, run the following command against the production database using `DIRECT_URL` credentials:
    ```bash
    npx prisma migrate resolve --applied 0_init
    ```
    *This registers the baseline migration in the `_prisma_migrations` table without running the creation SQL scripts, preventing table drops.*

---

## 3. Pre-Baseline Database Object Inventory
The current Prisma schema alone is **NOT** sufficient to reconstruct the complete DKFFJ database behavior on a brand-new empty database. While Prisma manages relational table structures, several custom PostgreSQL and Supabase-native elements exist in the live database that require manual preservation.

### Object Coverage Matrix:

| Category | Represented in `schema.prisma`? | Represented in SQL files? | Expected in Prisma-generated baseline? | Requires manual baseline preservation? |
| :--- | :--- | :--- | :--- | :--- |
| **Tables** | **Yes** (All main public tables are represented) | **Yes** (In `schema.sql`) | **Yes** | **No** (Prisma handles table structure generation) |
| **Enums** | **Yes** (Defined as `enum` blocks) | **Yes** (In `schema.sql`) | **Yes** | **No** |
| **Indexes** | **Yes** (Represented as `@@index` annotations) | **Yes** (In `schema.sql`) | **Yes** | **No** |
| **Foreign Keys** | **Yes** (Represented as `@relation` properties) | **Yes** (In `schema.sql` tables) | **Yes** | **No** |
| **PostgreSQL Functions** | **No** (PL/pgSQL functions are not representable) | **Yes** (`create_auth_user.sql`, `schema.sql`) | **No** | **Yes** (Must be manually executed: `create_auth_user`, `handle_new_user`, `generate_next_number`) |
| **Triggers** | **No** (Prisma cannot represent custom triggers) | **Yes** (`schema.sql`) | **No** | **Yes** (Must be manually executed: `on_auth_user_created`) |
| **RLS Policies** | **No** (RLS commands are Supabase-native) | **No** (Not documented in repository SQL files) | **No** | **Yes** (Must be documented or configured in Supabase dashboard) |
| **Extensions** | **No** (Prisma does not manage extensions) | **No** (Not documented in repository SQL files) | **No** | **Yes** (Requires manual execution: `CREATE EXTENSION IF NOT EXISTS pgcrypto`) |
| **Sequences** | **No** (Sequences are managed via table counters) | **Yes** (As public tables) | **Yes** (as public tables) | **No** (uses table-based sequence logic) |
| **Grants / Privileges** | **No** (Prisma does not manage SQL grants) | **No** (Not documented in repository SQL files) | **No** | **Yes** (Supabase default roles are required) |

### Key Custom Database Dependencies:
1.  **`public.handle_new_user()` and `on_auth_user_created` trigger:** Triggers profile insertion into public `users` when a user signs up via Supabase Auth. Without this, registrations will violate foreign key constraints.
2.  **`public.generate_next_number()`:** Concurrency-safe procedure to generate registration and membership numbers. Without this, approvals will fail.
3.  **`public.create_auth_user()`:** Custom function to bypass SMTP rate limiting by direct writing to auth schemas.
4.  **Storage Buckets:** Storage configuration (`photos`, `aadhaar`, `signatures`, `complaints`, `certificates`) must be configured separately in Supabase.

---

## 4. Environment & Variable Scoping Strategy

To ensure dev/preview features do not pollute production, the Supabase connections must be strictly separated across environments:

```
                  ┌──────────────┐
                  │ Supabase DB  │
                  └──────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   [Local Dev]      [Vercel Preview]   [Vercel Prod]
   Staging/Dev DB     Staging/Dev DB     Production DB
```

### 1. Local Environment (.env.local)
*   Targets the **Development Supabase** project.
*   `DATABASE_URL`: Transaction pooler (Port 6543)
*   `DIRECT_URL`: Session direct pooler (Port 5432)

### 2. Vercel Preview Deployments (Pull Requests / Non-Main branches)
*   Targets the **Development Supabase** database.
*   In Vercel Environment Settings, assign `DATABASE_URL` and `DIRECT_URL` scoped only to the **Preview** environment.

### 3. Vercel Production Deployment (Main branch)
*   Targets the **Production Supabase** database.
*   In Vercel, assign the production connection variables scoped only to the **Production** environment.

---

## 5. Recommended Future Schema Workflow
When updating database structures:
1.  **Code Change:** Modify `schema.prisma` locally.
2.  **Dev Migration:** Run `npx prisma migrate dev --name <migration_name>` (points to local/development DB). This generates the SQL file.
3.  **Review SQL:** Inspect the SQL migration file in `prisma/migrations` to verify no columns are dropped unexpectedly.
4.  **Staging Test:** Deploy the branch to Vercel Preview (which automatically syncs the preview database).
5.  **Production Backup:** Create a backup snapshot of production in Supabase.
6.  **Controlled Production Deploy:** Run the migration deploy command targeting production direct URL:
    ```bash
    npx prisma migrate deploy
    ```
7.  **Vercel Build/Push:** Trigger production build on Vercel.

---

## 6. Migration Execution Strategy Recommendation
We recommend **Option C (Manual controlled production command)** for the current stage of DKFFJ.

### Justification:
*   **No Established CI/CD Pipeline:** The project currently lacks automated runners (like GitHub actions) to manage migration steps safely.
*   **Staging Isolation:** The staging/development environment has not yet been proven under an automated migration workflow.
*   **Direct Push History:** Because direct pushes have been historically used, manual controlled deployment allows developers to verify baselines, review generated SQL scripts, and take manual snapshots before execution.

---

## 7. Audit: Shared Environment Security
> [!WARNING]
> **Current Vercel Preview Risk**
> If the environment variables `DATABASE_URL` and `DIRECT_URL` are currently configured in Vercel under "All Environments" (default behaviour in Vercel), **any non-main/Preview deployment (e.g. pull requests from other developers or branches) WILL connect to the production Supabase database.**
> This is a severe security risk that must be fixed by separating the variables into distinct environment scopes in Vercel.

---

## 8. Final Recommendation
**NOT SAFE TO BASELINE YET**

### Required Action Items before Baseline Execution:
1.  **Supabase Env Variables separation:** Change the environment variable scoping on Vercel. Restrict production credentials only to the `Production` environment and configure separate dev/staging database credentials for `Preview` and `Development`.
2.  **Document Custom Database Setup Script:** Create a clean `database_setup.sql` consolidating `schema.sql`, `create_auth_user.sql`, and the storage bucket creation commands. This script must be run *before* applying the Prisma migrations when configuring a brand new environment.
