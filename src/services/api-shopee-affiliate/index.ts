import "server-only";

// Função pública do serviço
export { generateShortLink } from "./api-shopee-affiliate.service";

// Tipos de resposta da API
export type {
  ShopeeGraphQLResponse,
  ShortLinkResult,
} from "./types/shopee-affiliate.types";

// Schema e tipo inferido (fonte única de verdade para GenerateShortLinkInput)
export {
  type GenerateShortLinkInput,
  GenerateShortLinkSchema,
} from "./validation/shopee-affiliate.schema";

// generateShopeeAuthHeader é um detalhe de implementação interno — não exportar
