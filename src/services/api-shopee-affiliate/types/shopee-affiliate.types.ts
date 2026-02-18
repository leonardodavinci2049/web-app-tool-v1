// Tipos de resposta da API GraphQL da Shopee

export interface ShortLinkResult {
  shortLink: string;
}

// ProductOfferV2
export interface ProductOfferV2 {
  itemId: number;
  commissionRate: string;
  sellerCommissionRate: string;
  shopeeCommissionRate: string;
  commission: string;
  sales: number;
  priceMax: string;
  priceMin: string;
  productCats: number[];
  ratingStar: string;
  priceDiscountRate: number;
  imageUrl: string;
  productName: string;
  shopId: number;
  shopName: string;
  shopType: number[];
  productLink: string;
  offerLink: string;
  periodStartTime: number;
  periodEndTime: number;
}

export interface PageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ProductOfferConnectionV2 {
  nodes: ProductOfferV2[];
  pageInfo: PageInfo;
}

// ShopeeOfferV2
export type OfferType = 1 | 2; // CAMPAIGN_TYPE_COLLECTION = 1, CAMPAIGN_TYPE_CATEGORY = 2

export interface ShopeeOfferV2 {
  commissionRate: string;
  imageUrl: string;
  offerLink: string;
  originalLink: string;
  offerName: string;
  offerType: OfferType;
  categoryId: number | null;
  collectionId: number | null;
  periodStartTime: number;
  periodEndTime: number;
}

export interface ShopeeOfferConnectionV2 {
  nodes: ShopeeOfferV2[];
  pageInfo: PageInfo;
}

/**
 * Envelope genérico de resposta GraphQL da Shopee.
 * Genérico para suportar qualquer query ou mutation futura.
 */
export interface ShopeeGraphQLResponse<T = unknown> {
  data: T | null;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

// GenerateShortLinkInput é exportado pelo schema Zod (validation/shopee-affiliate.schema.ts)
// Não duplicar aqui — fonte única de verdade
