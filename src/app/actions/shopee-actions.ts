"use server";

import { generateShortLink } from "@/services/shopee-operation";

export interface GenerateAffiliateLinkResult {
  success: boolean;
  shortLink?: string;
  error?: string;
}

export async function generateAffiliateLink(
  formData: FormData,
): Promise<GenerateAffiliateLinkResult> {
  const originUrl = formData.get("originUrl") as string;

  if (!originUrl) {
    return {
      success: false,
      error: "Por favor, insira uma URL",
    };
  }

  try {
    const shortLink = await generateShortLink(originUrl);
    return {
      success: true,
      shortLink,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
