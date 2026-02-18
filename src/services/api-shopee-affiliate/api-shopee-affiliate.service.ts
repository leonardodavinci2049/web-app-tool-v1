import "server-only";

import { randomUUID } from "node:crypto";
import axios from "axios";
import { envs } from "@/config/envs";
import { createLogger } from "@/core/logger";
import linkGenerationService from "@/services/db/link-generation/link-generation.service";
import { executeShopeeGraphQL } from "./shopee-graphql";
import type {
  GenerateShortLinkResponse,
  ProductOfferConnectionV2,
  ProductOfferV2,
  ShopeeOfferConnectionV2,
  ShortLinkResult,
} from "./types/shopee-affiliate.types";
import {
  extractProductNameId,
  isShortShopeeUrl,
  isValidShopeeProductUrl,
  resolveShortUrl,
} from "./utils/url-utils";
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
  query ProductOfferV2($itemId: Int64, $shopId: Int64, $keyword: String, $sortType: Int, $page: Int, $isAMSOffer: Boolean, $isKeySeller: Boolean, $limit: Int) {
    productOfferV2(itemId: $itemId, shopId: $shopId, keyword: $keyword, sortType: $sortType, page: $page, isAMSOffer: $isAMSOffer, isKeySeller: $isKeySeller, limit: $limit) {
      nodes {
        itemId
        commissionRate
        sellerCommissionRate
        shopeeCommissionRate
        commission
        sales
        priceMax
        priceMin
        productCatIds
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
 * @returns Resposta completa com link de afiliado, informações do produto e registro no banco
 * @throws Error com mensagem amigável em caso de falha
 */
export async function generateShortLink(
  originUrl: string,
): Promise<GenerateShortLinkResponse> {
  const _requestId = randomUUID();

  // 1. Validar input com schema Zod
  const validated = GenerateShortLinkSchema.parse({ originUrl });

  // 2. Validar URL de produto Shopee
  if (!isValidShopeeProductUrl(validated.originUrl)) {
    logger.warn(`URL inválida recebida: ${validated.originUrl}`);
    return {
      success: false,
      error: "URL inválida",
      message: "A URL fornecida não é uma URL válida de produto da Shopee",
    };
  }

  // 3. Resolver URL encurtada (se necessário) antes de gerar o link
  let resolvedUrl = validated.originUrl;
  if (isShortShopeeUrl(validated.originUrl)) {
    const fullUrl = await resolveShortUrl(validated.originUrl);
    if (fullUrl) {
      resolvedUrl = fullUrl;
    } else {
      logger.warn(
        `Não foi possível resolver a URL encurtada: ${validated.originUrl}`,
      );
    }
  }

  // 4. Gerar link de afiliado (usando a URL resolvida)
  let affiliateLink: string;
  try {
    affiliateLink = await generateAffiliateLinkInternal(resolvedUrl);
  } catch (error) {
    logger.error(
      "Erro ao gerar link de afiliado:",
      error instanceof Error ? error.message : error,
    );
    return {
      success: false,
      error: "Erro ao gerar link",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }

  // 5. Extrair ID do produto da URL resolvida
  const productInfo = extractProductNameId(resolvedUrl);
  if (!productInfo) {
    logger.warn(`Não foi possível extrair ID do produto: ${resolvedUrl}`);
    return {
      success: true,
      affiliateLink,
      message:
        "Link gerado, porém não foi possível extrair informações do produto",
    };
  }

  // 6. Carregar informações do produto usando a API da Shopee
  let productDetails: ProductOfferV2 | undefined;
  try {
    const productOfferParams: ProductOfferV2Input = {
      itemId: parseInt(productInfo.productId, 10),
      page: 1,
      limit: 1,
    };

    const productOfferResponse = await getProductOfferList(productOfferParams);

    if (productOfferResponse.nodes && productOfferResponse.nodes.length > 0) {
      productDetails = productOfferResponse.nodes[0];
    }
  } catch (error) {
    logger.warn("Erro ao buscar informações do produto:", error);
  }

  // 7. Gravar informações no banco de dados
  let databaseRecord: { recordId: string; message: string } | undefined;
  try {
    const linkGenerationDto = {
      PE_UUID: randomUUID(),
      PE_CLIENT_ID: 1,
      PE_APP_ID: 1,
      PE_LINK_DESTINATION: originUrl,
      PE_AFFILIATE_LINK: affiliateLink,
      PE_FLAG_CLICK: 1,
      PE_ITEM_ID: productDetails?.itemId
        ? productDetails.itemId
        : parseInt(productInfo.productId, 10),
      PE_PRODUCT_NAME:
        productDetails?.productName || productInfo.productName || "",
      PE_SHOP_NAME: productDetails?.shopName || "",
      PE_SHOP_ID: productDetails?.shopId || 0,
      PE_PRICE_MIN: parseFloat(productDetails?.priceMin || "0"),
      PE_PRICE_MAX: parseFloat(productDetails?.priceMax || "0"),
      PE_COMMISSION_RATE: parseFloat(productDetails?.commissionRate || "0"),
      PE_COMMISSION: parseFloat(productDetails?.commission || "0"),
      PE_SALES: productDetails?.sales || 0,
      PE_RATING_STAR: parseFloat(productDetails?.ratingStar || "0"),
      PE_IMAGE_URL: productDetails?.imageUrl || "",
      PE_PRODUCT_LINK: productDetails?.productLink || originUrl,
      PE_OFFER_LINK: productDetails?.offerLink || affiliateLink,
      PE_CURRENCY: "BRL",
      PE_DISCOUNT_PERCENT: productDetails?.priceDiscountRate || 0,
      PE_ORIGINAL_PRICE: parseFloat(productDetails?.priceMax || "0"),
      PE_CATEGORY: productDetails?.productCatIds?.[0]
        ? String(productDetails.productCatIds[0])
        : "",
      PE_CATEGORY_ID: productDetails?.productCatIds?.[0] || 0,
      PE_BRAND_NAME: "",
      PE_IS_OFFICIAL: 0,
      PE_FREE_SHIPPING: 0,
      PE_LOCATION: "Brasil",
    };

    const dbResult =
      await linkGenerationService.execLinkGenerationCreateQuery(
        linkGenerationDto,
      );

    if (
      dbResult.statusCode === 100200 &&
      dbResult.recordId &&
      dbResult.recordId !== ""
    ) {
      databaseRecord = {
        recordId: dbResult.recordId,
        message: dbResult.message,
      };
    }
  } catch (error) {
    logger.error("Erro ao gravar no banco de dados:", error);
  }

  // 8. Retornar resposta completa
  return {
    success: true,
    affiliateLink,
    productInfo: productDetails,
    databaseRecord,
  };
}

/**
 * Internal helper function to generate affiliate link using GraphQL.
 */
async function generateAffiliateLinkInternal(
  originUrl: string,
): Promise<string> {
  const subIds = envs.SHOPEE_AFFILIATESUBIDS.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const variables = {
    originUrl,
    subIds,
  };

  const data = await executeShopeeGraphQL<{
    generateShortLink: ShortLinkResult;
  }>(GENERATE_SHORT_LINK_MUTATION, variables);

  if (!data.generateShortLink?.shortLink) {
    throw new Error("Não foi possível gerar o link de afiliado");
  }

  return data.generateShortLink.shortLink;
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

  // 2. Preparar variáveis da query - Int64 deve ser passado como string
  const variables = {
    ...validated,
    itemId: validated.itemId?.toString(),
    shopId: validated.shopId?.toString(),
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
