import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_hours_store" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"time" varchar NOT NULL,
  	"closed" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phones_legal" varchar DEFAULT '(307) 920-0149' NOT NULL,
  	"phones_shop" varchar DEFAULT '(832) 461-2525' NOT NULL,
  	"emails_footer" varchar DEFAULT 'info@rollun.com' NOT NULL,
  	"emails_contact" varchar DEFAULT 'llc@rollun.com' NOT NULL,
  	"social_github" varchar DEFAULT 'https://github.com/rollun-lc' NOT NULL,
  	"social_linkedin" varchar DEFAULT 'https://www.linkedin.com/company/rollun-lc/' NOT NULL,
  	"registered_address_company" varchar DEFAULT 'Rollun LC' NOT NULL,
  	"registered_address_street" varchar DEFAULT '30 N Gould St STE 4370' NOT NULL,
  	"registered_address_city" varchar DEFAULT 'Sheridan' NOT NULL,
  	"registered_address_state" varchar DEFAULT 'WY' NOT NULL,
  	"registered_address_zip" varchar DEFAULT '82801' NOT NULL,
  	"shop_address_street" varchar DEFAULT '5327 Aldine Mail Route Rd' NOT NULL,
  	"shop_address_city" varchar DEFAULT 'Houston' NOT NULL,
  	"shop_address_state" varchar DEFAULT 'TX' NOT NULL,
  	"shop_address_zip" varchar DEFAULT '77039' NOT NULL,
  	"hours_home_cta_desktop" varchar DEFAULT '11:00 to 21:00 UTC' NOT NULL,
  	"hours_home_cta_mobile" varchar DEFAULT '09:00 to 21:00 UTC+2' NOT NULL,
  	"hours_about_cta_desktop" varchar DEFAULT '09:00 to 21:00 UTC +2' NOT NULL,
  	"hours_about_cta_mobile" varchar DEFAULT '09:00 to 21:00 UTC+2' NOT NULL,
  	"hours_contact" varchar DEFAULT '09:00 to 21:00 UTC+2' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_settings_hours_store" ADD CONSTRAINT "site_settings_hours_store_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_hours_store_order_idx" ON "site_settings_hours_store" USING btree ("_order");
  CREATE INDEX "site_settings_hours_store_parent_id_idx" ON "site_settings_hours_store" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_hours_store" CASCADE;
  DROP TABLE "site_settings" CASCADE;`)
}
