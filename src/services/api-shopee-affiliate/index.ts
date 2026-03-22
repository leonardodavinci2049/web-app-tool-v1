import "server-only";

// Funções públicas do serviço
export {
  generateShortLink,
  getItemFeedData,
  listItemFeeds,
} from "./api-shopee-affiliate.service";

// Tipos de resposta da API
export type {
  GenerateShortLinkResponse,
  ItemFeed,
  ItemFeedDataConnection,
  ItemFeedDataRow,
  ItemFeedListConnection,
  ItemFeedPageInfo,
  FeedMode,
  ProductOfferV2,
  ShopeeGraphQLResponse,
  ShortLinkResult,
} from "./types/shopee-affiliate.types";

// Schema e tipo inferido (fonte única de verdade para GenerateShortLinkInput)
export {
  type GenerateShortLinkInput,
  GenerateShortLinkSchema,
  type GetItemFeedDataInput,
  GetItemFeedDataSchema,
  type ListItemFeedsInput,
  ListItemFeedsSchema,
} from "./validation/shopee-affiliate.schema";

// generateShopeeAuthHeader é um detalhe de implementação interno — não exportar
