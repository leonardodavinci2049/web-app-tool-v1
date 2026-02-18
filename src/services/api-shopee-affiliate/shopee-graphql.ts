import "server-only";

import { shopeeHttpClient } from "./shopee-http-client";
import type { ShopeeGraphQLResponse } from "./types/shopee-affiliate.types";

/**
 * Executa uma operação GraphQL (query ou mutation) na API da Shopee.
 *
 * Centraliza o tratamento de:
 * - Erros HTTP (4xx, 5xx) — lançados pelo interceptor do cliente
 * - Erros GraphQL (HTTP 200 com campo `errors` no body)
 * - Respostas sem dados
 *
 * @param query - String GraphQL da query ou mutation
 * @param variables - Variáveis da operação GraphQL (opcional)
 * @returns Os dados tipados da resposta
 * @throws Error com mensagem amigável em caso de falha
 */
export async function executeShopeeGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  // Serializa o payload explicitamente para garantir comportamento previsível
  // O interceptor do shopeeHttpClient recebe a string e assina corretamente
  const payload = JSON.stringify({ query, variables });

  const response = await shopeeHttpClient.post<ShopeeGraphQLResponse<T>>(
    "", // baseURL já aponta para o endpoint GraphQL
    payload,
  );

  // Tratar erros GraphQL (HTTP 200 mas com campo `errors` no body)
  if (response.data.errors && response.data.errors.length > 0) {
    const messages = response.data.errors.map((e) => e.message).join("; ");
    throw new Error(`Erro GraphQL Shopee: ${messages}`);
  }

  if (!response.data.data) {
    throw new Error("Resposta inválida da API Shopee: sem dados");
  }

  return response.data.data;
}
