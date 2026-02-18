import { z } from "zod";

// Domínios oficiais da Shopee — lista explícita de domínios permitidos.
// Mais seguro que `includes("shopee")`, que aceita URLs maliciosas como
// `https://evil.com/shopee`.
const SHOPEE_DOMAINS = [
  "shopee.com.br",
  "shopee.com",
  "shope.ee", // domínio de short links da própria Shopee
  "s.shopee.com.br",
] as const;

export const GenerateShortLinkSchema = z.object({
  originUrl: z
    .string()
    .min(1, "URL não pode estar vazia")
    .max(2048, "URL muito longa (máximo 2048 caracteres)")
    .url("Formato de URL inválido")
    .refine(
      (url) => {
        try {
          const { hostname } = new URL(url);
          return SHOPEE_DOMAINS.some(
            (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
          );
        } catch {
          return false;
        }
      },
      {
        message: `URL deve ser de um domínio oficial da Shopee (${SHOPEE_DOMAINS.join(", ")})`,
      },
    ),
  subIds: z.array(z.string().min(1).max(50)).max(5).optional(),
});

export type GenerateShortLinkInput = z.infer<typeof GenerateShortLinkSchema>;

// productOfferV2 schemas
export const ProductOfferV2Schema = z.object({
  itemId: z.number().int().positive().optional(),
  shopId: z.number().int().positive().optional(),
  keyword: z.string().max(100).optional(),
  sortType: z.number().int().min(1).max(5).optional(),
  page: z.number().int().positive().default(1),
  isAMSOffer: z.boolean().optional(),
  isKeySeller: z.boolean().optional(),
  limit: z.number().int().positive().max(50).default(10),
});

export type ProductOfferV2Input = z.infer<typeof ProductOfferV2Schema>;

// shopeeOfferV2 schemas
export const ShopeeOfferV2Schema = z.object({
  keyword: z.string().max(100).optional(),
  sortType: z.union([z.literal(1), z.literal(2)]).default(1),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export type ShopeeOfferV2Input = z.infer<typeof ShopeeOfferV2Schema>;
