import "server-only";

import { randomUUID } from "node:crypto";
import axios from "axios";
import { envs } from "@/config/envs";
import { createLogger } from "@/core/logger";
import { executeShopeeGraphQL } from "./shopee-graphql";
import type {
  ProductOfferConnectionV2,
  ShopeeOfferConnectionV2,
  ShortLinkResult,
} from "./types/shopee-affiliate.types";
import {
  GenerateShortLinkSchema,
  type ProductOfferV2Input,
  ProductOfferV2Schema,
  type ShopeeOfferV2Input,
  ShopeeOfferV2Schema,
} from "./validation/shopee-affiliate.schema";

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

const PRODUCT_OFFER_V2_QUERY = `
  query ProductOfferV2($shopId: Int64, $itemId: Int64, $productCatId: Int32, $listType: Int, $matchId: Int64, $keyword: String, $sortType: Int, $page: Int, $isAMSOffer: Boolean, $isKeySeller: Boolean, $limit: Int) {
    productOfferV2(shopId: $shopId, itemId: $itemId, productCatId: $productCatId, listType: $listType, matchId: $matchId, keyword: $keyword, sortType: $sortType, page: $page, isAMSOffer: $isAMSOffer, isKeySeller: $isKeySeller, limit: $limit) {
      nodes {
        itemId
        commissionRate
        sellerCommissionRate
        shopeeCommissionRate
        commission
        sales
        priceMax
        priceMin
        productCats
        ratingStar
        priceDiscountRate
        imageUrl
        productName
        shopId
        shopName
        shopType
        productLink
        offerLink
        periodStartTime
        periodEndTime
      }
      pageInfo {
        page
        limit
        hasNextPage
      }
    }
  }
`;

const SHOPEE_OFFER_V2_QUERY = `
  query ShopeeOfferV2($keyword: String, $sortType: Int, $page: Int, $limit: Int) {
    shopeeOfferV2(keyword: $keyword, sortType: $sortType, page: $page, limit: $limit) {
      nodes {
        commissionRate
        imageUrl
        offerLink
        originalLink
        offerName
        offerType
        categoryId
        collectionId
        periodStartTime
        periodEndTime
      }
      pageInfo {
        page
        limit
        hasNextPage
      }
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

/**
 * Obtém a lista de ofertas de produtos da Shopee.
 *
 * @param params - Parâmetros de filtragem e paginação
 * @returns Lista de ofertas de produtos com informações de paginação
 * @throws Error com mensagem amigável em caso de falha
 */
export async function getProductOfferList(
  params: ProductOfferV2Input,
): Promise<ProductOfferConnectionV2> {
  const requestId = randomUUID();

  // 1. Validar input com schema Zod
  const validated = ProductOfferV2Schema.parse(params);

  // 2. Preparar variáveis da query
  const variables = {
    ...validated,
  };

  try {
    // 3. Executar query via cliente dedicado
    const data = await executeShopeeGraphQL<{
      productOfferV2: ProductOfferConnectionV2;
    }>(PRODUCT_OFFER_V2_QUERY, variables);

    if (!data.productOfferV2) {
      throw new Error("Não foi possível obter a lista de ofertas de produtos");
    }

    return data.productOfferV2;
  } catch (error) {
    logger.error("Falha ao obter lista de ofertas de produtos Shopee", {
      requestId,
      error,
    });
    throw new Error(toSafeErrorMessage(error));
  }
}

/**
 * Obtém a lista de ofertas promocionais da Shopee.
 *
 * @param params - Parâmetros de busca e paginação
 * @returns Lista de ofertas promocionais com informações de paginação
 * @throws Error com mensagem amigável em caso de falha
 */
export async function getShopeeOfferList(
  params: ShopeeOfferV2Input,
): Promise<ShopeeOfferConnectionV2> {
  const requestId = randomUUID();

  // 1. Validar input com schema Zod (valores padrão aplicados pelo schema)
  const validated = ShopeeOfferV2Schema.parse(params);

  // 2. Preparar variáveis da query
  const variables = {
    ...validated,
  };

  try {
    // 3. Executar query via cliente dedicado
    const data = await executeShopeeGraphQL<{
      shopeeOfferV2: ShopeeOfferConnectionV2;
    }>(SHOPEE_OFFER_V2_QUERY, variables);

    if (!data.shopeeOfferV2) {
      throw new Error("Não foi possível obter a lista de ofertas da Shopee");
    }

    return data.shopeeOfferV2;
  } catch (error) {
    logger.error("Falha ao obter lista de ofertas Shopee", {
      requestId,
      error,
    });
    throw new Error(toSafeErrorMessage(error));
  }
}
