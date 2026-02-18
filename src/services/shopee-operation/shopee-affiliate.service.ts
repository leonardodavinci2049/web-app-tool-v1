import axios from "axios";
import { envs } from "@/config/envs";
import { generateShopeeAuthHeader } from "./shopee-auth";
import type {
  GenerateShortLinkInput,
  ShopeeGraphQLResponse,
} from "./types/shopee-affiliate.types";
import { GenerateShortLinkSchema } from "./validation/shopee-affiliate.schema";

export async function generateShortLink(originUrl: string): Promise<string> {
  const validatedInput: GenerateShortLinkInput = GenerateShortLinkSchema.parse({
    originUrl,
  });

  const subIds = [envs.SHOPEE_AFFILIATESUBIDS];

  const query = `mutation { generateShortLink(input: { originUrl: ${JSON.stringify(validatedInput.originUrl)}, subIds: ${JSON.stringify(subIds)} }) { shortLink } }`;

  const payload = JSON.stringify({ query });

  const authHeader = generateShopeeAuthHeader(payload);

  try {
    const response = await axios.post<ShopeeGraphQLResponse>(
      envs.SHOPEE_AFFILIATEENDPOINT,
      payload,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        timeout: envs.SHOPEE_AFFILIATETIMEOUT,
      },
    );

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessage = response.data.errors
        .map((error) => error.message)
        .join(", ");
      throw new Error(`Erro da API Shopee: ${errorMessage}`);
    }

    if (!response.data.data?.generateShortLink?.shortLink) {
      throw new Error("Não foi possível gerar o link de afiliado");
    }

    return response.data.data.generateShortLink.shortLink;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Tempo de esgotado ao tentar conectar à API Shopee");
      }
      if (error.response) {
        throw new Error(`Erro na resposta da API: ${error.response.status}`);
      }
      throw new Error(`Erro de conexão: ${error.message}`);
    }
    throw error;
  }
}
