import "dotenv/config";

import { z } from "zod";

const envsSchema = z.object({
  PORT: z.coerce.number().positive(),
  EXTERNAL_API_MAIN_URL: z.string().url(),
  API_KEY: z.string().min(1),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().positive(),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  APP_ID: z.coerce.number().positive(),
  SYSTEM_CLIENT_ID: z.coerce.number().positive(),
  STORE_ID: z.coerce.number().positive(),
  ORGANIZATION_ID: z.string().min(1),
  MEMBER_ID: z.string().min(1),
  USER_ID: z.string().min(1),
  PERSON_ID: z.coerce.number().positive(),
  TYPE_BUSINESS: z.coerce.number().positive(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_COMPANY_NAME: z.string().min(1),
  NEXT_PUBLIC_COMPANY_PHONE: z.string().min(1),
  NEXT_PUBLIC_COMPANY_EMAIL: z.string().email(),
  NEXT_PUBLIC_COMPANY_WHATSAPP: z.string().min(1),
  NEXT_PUBLIC_DEVELOPER_NAME: z.string().min(1),
  NEXT_PUBLIC_DEVELOPER_URL: z.string().url(),
});

const result = envsSchema.safeParse(process.env);

if (!result.success) {
  const formatted = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`❌ Invalid environment variables:\n${formatted}`);
}

const envVars = result.data;

export const envs = {
  PORT: envVars.PORT,
  EXTERNAL_API_MAIN_URL: envVars.EXTERNAL_API_MAIN_URL,
  API_KEY: envVars.API_KEY,
  DATABASE_HOST: envVars.DATABASE_HOST,
  DATABASE_PORT: envVars.DATABASE_PORT,
  DATABASE_USER: envVars.DATABASE_USER,
  DATABASE_PASSWORD: envVars.DATABASE_PASSWORD,
  DATABASE_NAME: envVars.DATABASE_NAME,
  APP_ID: envVars.APP_ID,
  SYSTEM_CLIENT_ID: envVars.SYSTEM_CLIENT_ID,
  STORE_ID: envVars.STORE_ID,
  ORGANIZATION_ID: envVars.ORGANIZATION_ID,
  MEMBER_ID: envVars.MEMBER_ID,
  USER_ID: envVars.USER_ID,
  PERSON_ID: envVars.PERSON_ID,
  TYPE_BUSINESS: envVars.TYPE_BUSINESS,
  NEXT_PUBLIC_APP_URL: envVars.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_COMPANY_NAME: envVars.NEXT_PUBLIC_COMPANY_NAME,
  NEXT_PUBLIC_COMPANY_PHONE: envVars.NEXT_PUBLIC_COMPANY_PHONE,
  NEXT_PUBLIC_COMPANY_EMAIL: envVars.NEXT_PUBLIC_COMPANY_EMAIL,
  NEXT_PUBLIC_COMPANY_WHATSAPP: envVars.NEXT_PUBLIC_COMPANY_WHATSAPP,
  NEXT_PUBLIC_DEVELOPER_NAME: envVars.NEXT_PUBLIC_DEVELOPER_NAME,
  NEXT_PUBLIC_DEVELOPER_URL: envVars.NEXT_PUBLIC_DEVELOPER_URL,
};
