# Migration `20200608092241-admin-auth`

This migration has been generated by rahul at 6/8/2020, 9:22:41 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."admin" (
"active" boolean   DEFAULT true,"created" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"id" SERIAL,"password" text  NOT NULL ,"updated" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,"username" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "admin.username" ON "public"."admin"("username")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200524150157-added-cha-ind-to-orders..20200608092241-admin-auth
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 model bids {
   active    Boolean? @default(true)
@@ -142,5 +142,14 @@
   taker_orders orders[]               @relation("taker_orders")
   tokens       tokens[]
   approved     erc20tokensaddresses[]
   erc20tokens  erc20tokens[]
-}
+}
+
+model admin {
+  active   Boolean? @default(true)
+  username String   @unique
+  password String
+  created  DateTime @default(now())
+  id       Int      @default(autoincrement()) @id
+  updated  DateTime @default(now())
+}
```


