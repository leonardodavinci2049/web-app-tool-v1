import "server-only";

import type { AxiosInstance } from "axios";
import axios from "axios";
import { envs } from "@/config/envs";
import { createLogger } from "@/core/logger";
import { generateShopeeAuthHeader } from "./shopee-auth";

const logger = createLogger("ApiShopeeAffiliateHttpClient");

/**
 * Cria uma instância Axios configurada especificamente para a API da Shopee.
 *
 * O interceptor de requisição injeta automaticamente o header de autenticação
 * SHA256 baseado no payload de cada requisição, eliminando a necessidade de
 * chamar `generateShopeeAuthHeader` manualmente em cada método.
 */
function createShopeeHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: envs.SHOPEE_AFFILIATEENDPOINT,
    timeout: envs.SHOPEE_AFFILIATETIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Interceptor de requisição: injeta autenticação SHA256
  instance.interceptors.request.use((config) => {
    // Garante que o payload seja uma string JSON antes de assinar
    const payload =
      typeof config.data === "string"
        ? config.data
        : JSON.stringify(config.data ?? {});

    config.headers.Authorization = generateShopeeAuthHeader(payload);

    return config;
  });

  // Interceptor de resposta: logging estruturado
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      logger.error("Shopee API error", {
        status: error.response?.status,
        code: error.code,
        // Não logar o payload completo — pode conter dados sensíveis
        url: error.config?.url,
      });
      return Promise.reject(error);
    },
  );

  return instance;
}

// Instância singleton do cliente Shopee
export const shopeeHttpClient = createShopeeHttpClient();
