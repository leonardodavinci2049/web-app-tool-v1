export interface GenerateShortLinkInput {
  originUrl: string;
  subIds?: string[];
}

export interface ShortLinkResult {
  shortLink: string;
}

export interface ShopeeGraphQLResponse {
  data: {
    generateShortLink: ShortLinkResult;
  } | null;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}
