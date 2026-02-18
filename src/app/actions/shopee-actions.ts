"use server";

import {
  type GenerateShortLinkResponse,
  GenerateShortLinkSchema,
  generateShortLink,
} from "@/services/api-shopee-affiliate";

export interface GenerateAffiliateLinkResult {
  success: boolean;
  shortLink?: string;
  productInfo?: GenerateShortLinkResponse["productInfo"];
  databaseRecord?: GenerateShortLinkResponse["databaseRecord"];
  error?: string;
}

/**
 * Server Action para geração de link de afiliado Shopee.
 *
 * Implementa validação dupla:
 * 1. Verificação de tipo básica (FormData pode conter null)
 * 2. Validação com Zod antes de chamar o serviço
 *
 * Erros já chegam sanitizados pelo serviço — não expõem detalhes internos.
 */
export async function generateAffiliateLink(
  formData: FormData,
): Promise<GenerateAffiliateLinkResult> {
  const originUrl = formData.get("originUrl");

  // Validação de tipo básica — FormData.get() pode retornar null ou File
  if (typeof originUrl !== "string" || !originUrl.trim()) {
    return { success: false, error: "Por favor, insira uma URL válida" };
  }

  // Validação com Zod antes de chamar o serviço (validação dupla)
  const parseResult = GenerateShortLinkSchema.safeParse({ originUrl });
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message;
    return { success: false, error: firstError ?? "URL inválida" };
  }

  try {
    const response = await generateShortLink(parseResult.data.originUrl);
    if (!response.success) {
      return { success: false, error: response.error || response.message };
    }
    return {
      success: true,
      shortLink: response.affiliateLink,
      productInfo: response.productInfo,
      databaseRecord: response.databaseRecord,
    };
  } catch (error) {
    // Erros já sanitizados pelo serviço — seguro retornar ao cliente
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
