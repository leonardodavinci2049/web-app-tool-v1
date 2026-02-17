import "dotenv/config";

import { z } from "zod";

const envsSchema = z.object({
  APP_API_URL: z.string().min(1),
  APP_JWT_SECRET: z.string().min(1),
  APP_PORT: z.coerce.number().positive(),
  API_KEY: z.string().min(1),
  DB_MYSQL_HOST: z.string().min(1),
  DB_MYSQL_PORT: z.coerce.number().positive(),
  DB_MYSQL_USER: z.string().min(1),
  DB_MYSQL_PASSWORD: z.string().min(1),
  DB_MYSQL_DATABASE: z.string().min(1),
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
  APP_JWT_SECRET: envVars.APP_JWT_SECRET,
  APP_PORT: envVars.APP_PORT,
  API_KEY: envVars.API_KEY,
  DB_MYSQL_HOST: envVars.DB_MYSQL_HOST,
  DB_MYSQL_PORT: envVars.DB_MYSQL_PORT,
  APP_API_URL: envVars.APP_API_URL,
  DB_MYSQL_USER: envVars.DB_MYSQL_USER,
  DB_MYSQL_PASSWORD: envVars.DB_MYSQL_PASSWORD,
  DB_MYSQL_DATABASE: envVars.DB_MYSQL_DATABASE,
};
