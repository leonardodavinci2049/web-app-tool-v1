import "dotenv/config";

import { z } from "zod";

const envsSchema = z.object({
  PORT: z.coerce.number().positive(),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().positive(),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
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
  DATABASE_HOST: envVars.DATABASE_HOST,
  DATABASE_PORT: envVars.DATABASE_PORT,
  DATABASE_USER: envVars.DATABASE_USER,
  DATABASE_PASSWORD: envVars.DATABASE_PASSWORD,
  DATABASE_NAME: envVars.DATABASE_NAME,
};
