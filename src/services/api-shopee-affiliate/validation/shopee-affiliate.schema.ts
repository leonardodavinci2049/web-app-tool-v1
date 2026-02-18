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
