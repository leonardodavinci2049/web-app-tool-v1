import "server-only";

import { randomUUID } from "node:crypto";
import axios from "axios";
import { envs } from "@/config/envs";
import { createLogger } from "@/core/logger";
import { executeShopeeGraphQL } from "./shopee-graphql";
import type { ShortLinkResult } from "./types/shopee-affiliate.types";
import { GenerateShortLinkSchema } from "./validation/shopee-affiliate.schema";

const logger = createLogger("ApiShopeeAffiliateService");

// Mutation GraphQL isolada como constante — fácil de manter e testar
// A API Shopee não expõe um input type nomeado; as variáveis são escalares
const GENERATE_SHORT_LINK_MUTATION = `
  mutation GenerateShortLink($originUrl: String!, $subIds: [String!]) {
    generateShortLink(input: { originUrl: $originUrl, subIds: $subIds }) {
      shortLink
    }
  }
`;

/**
 * Mapeia erros internos (Axios, rede) para mensagens seguras ao usuário.
 * Garante que detalhes internos (URLs de API, stack traces) não vazem para o cliente.
 */
function toSafeErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Tempo esgotado ao conectar à API Shopee. Tente novamente.";
    }
    if (error.response?.status === 429) {
      return "Limite de requisições atingido. Aguarde alguns instantes.";
    }
    if (error.response?.status && error.response.status >= 500) {
      return "Serviço da Shopee temporariamente indisponível.";
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "Erro de autenticação com a API Shopee.";
    }
    // Erro de rede genérico — não expor detalhes internos
    return "Não foi possível conectar à API Shopee.";
  }
  if (error instanceof Error) {
    // Repassar apenas erros de negócio (ZodError, erros GraphQL já formatados)
    return error.message;
  }
  return "Erro desconhecido ao gerar o link.";
}

/**
 * Gera um link de afiliado curto da Shopee a partir de uma URL de produto.
 *
 * @param originUrl - URL do produto na Shopee (deve ser de um domínio oficial)
 * @returns URL curta do link de afiliado
 * @throws Error com mensagem amigável em caso de falha
 */
export async function generateShortLink(originUrl: string): Promise<string> {
  const requestId = randomUUID();

  // 1. Validar input com schema Zod
  const validated = GenerateShortLinkSchema.parse({ originUrl });

  // 2. Preparar variáveis da mutation
  // SHOPEE_AFFILIATESUBIDS suporta múltiplos IDs separados por vírgula
  const subIds = envs.SHOPEE_AFFILIATESUBIDS.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const variables = {
    originUrl: validated.originUrl,
    subIds,
  };

  try {
    // 3. Executar mutation via cliente dedicado
    const data = await executeShopeeGraphQL<{
      generateShortLink: ShortLinkResult;
    }>(GENERATE_SHORT_LINK_MUTATION, variables);

    if (!data.generateShortLink?.shortLink) {
      throw new Error("Não foi possível gerar o link de afiliado");
    }

    return data.generateShortLink.shortLink;
  } catch (error) {
    logger.error("Falha ao gerar short link Shopee", { requestId, error });
    throw new Error(toSafeErrorMessage(error));
  }
}
