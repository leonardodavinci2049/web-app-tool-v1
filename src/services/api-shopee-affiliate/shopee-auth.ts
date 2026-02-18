import "server-only";

import { createHash } from "node:crypto";
import { envs } from "@/config/envs";

export function generateShopeeAuthHeader(payload: string): string {
  const appId = envs.SHOPEE_CREDENTIAL;
  const secret = envs.SHOPEE_SECRETKEY;
  const timestamp = Math.floor(Date.now() / 1000);

  const signatureFactor = `${appId}${timestamp}${payload}${secret}`;
  const signature = createHash("sha256").update(signatureFactor).digest("hex");

  return `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;
}
