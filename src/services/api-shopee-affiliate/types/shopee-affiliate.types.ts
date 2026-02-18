// Tipos de resposta da API GraphQL da Shopee

export interface ShortLinkResult {
  shortLink: string;
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
