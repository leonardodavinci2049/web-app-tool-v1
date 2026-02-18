import "server-only";

import axios from "axios";
import { createLogger } from "@/core/logger";

const logger = createLogger("ShopeeUrlUtils");

export interface ProductInfo {
  productId: string;
  productName: string;
}

/**
 * Validates if a URL is a valid Shopee product URL.
 */
export function isValidShopeeProductUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const normalizedUrl = url.toLowerCase().trim();

  const validPrefixes = [
    "https://s.shopee.com",
    "https://br.shopee.com",
    "https://shopee.com.br",
    "https://br.shp.ee",
    "https://shp.ee",
  ];

  return validPrefixes.some((prefix) => normalizedUrl.startsWith(prefix));
}

/**
 * Checks if a URL is a short Shopee URL (shp.ee, s.shopee.com).
 */
export function isShortShopeeUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const normalized = url.toLowerCase().trim();
  const shortPrefixes = [
    "https://br.shp.ee",
    "https://shp.ee",
    "https://s.shopee.com",
  ];

  return shortPrefixes.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Resolves a short Shopee URL by following redirects.
 */
export async function resolveShortUrl(
  shortUrl: string,
): Promise<string | null> {
  try {
    const response = await axios.head(shortUrl, {
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status < 400,
    });

    const resolvedUrl: string | undefined =
      (response.request as { res?: { responseUrl?: string } })?.res
        ?.responseUrl || response.config?.url;

    if (resolvedUrl && resolvedUrl !== shortUrl) {
      return resolvedUrl;
    }

    const getResponse = await axios.get(shortUrl, {
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status < 400,
    });

    const finalUrl: string | undefined =
      (getResponse.request as { res?: { responseUrl?: string } })?.res
        ?.responseUrl || getResponse.config?.url;

    if (finalUrl && finalUrl !== shortUrl) {
      return finalUrl;
    }

    logger.warn(`Não foi possível resolver a URL encurtada: ${shortUrl}`);
    return null;
  } catch (error) {
    logger.error(`Erro ao resolver URL encurtada ${shortUrl}:`, error);
    return null;
  }
}

/**
 * Extracts product ID and name from a Shopee URL.
 */
export function extractProductNameId(url: string): ProductInfo | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const regexNamed = /\/([^/]+)-i\.(\d+)\.(\d+)(?:\?.*)?$/;
    const matchNamed = url.match(regexNamed);

    if (matchNamed?.[1] && matchNamed[3]) {
      const formattedName = matchNamed[1]
        .split("-")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

      return {
        productId: matchNamed[3],
        productName: formattedName,
      };
    }

    const regexProduct = /\/product\/(\d+)\/(\d+)(?:\?.*)?$/;
    const matchProduct = url.match(regexProduct);

    if (matchProduct?.[1] && matchProduct[2]) {
      return {
        productId: matchProduct[2],
        productName: "",
      };
    }

    return null;
  } catch (error) {
    logger.error("Erro ao extrair informações do produto:", error);
    return null;
  }
}
