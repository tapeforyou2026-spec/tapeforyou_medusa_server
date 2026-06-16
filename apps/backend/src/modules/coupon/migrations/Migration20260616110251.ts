import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260616110251 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "coupon" ("id" text not null, "code" text not null, "type" text check ("type" in ('percentage', 'fixed')) not null, "value" integer not null, "min_order" integer not null default 0, "max_uses" integer null, "used_count" integer not null default 0, "expires_at" timestamptz null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "coupon_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coupon_deleted_at" ON "coupon" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "coupon" cascade;`);
  }

}
