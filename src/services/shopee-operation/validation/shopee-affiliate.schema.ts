import { z } from "zod";

export const GenerateShortLinkSchema = z.object({
  originUrl: z
    .string()
    .min(1, "URL não pode estar vazia")
    .url("URL inválida")
    .refine(
      (url) => url.toLowerCase().includes("shopee"),
      "URL deve ser um link da Shopee",
    ),
  subIds: z.array(z.string()).optional(),
});

export type GenerateShortLinkInput = z.infer<typeof GenerateShortLinkSchema>;
