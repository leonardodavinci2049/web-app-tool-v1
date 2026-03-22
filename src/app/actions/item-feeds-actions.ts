"use server";

import {
  type FeedMode,
  type ItemFeed,
  type ItemFeedDataConnection,
  GetItemFeedDataSchema,
  ListItemFeedsSchema,
  getItemFeedData,
  listItemFeeds,
} from "@/services/api-shopee-affiliate";

export interface ListItemFeedsResult {
  success: boolean;
  feeds?: ItemFeed[];
  error?: string;
}

export interface GetItemFeedDataResult {
  success: boolean;
  data?: ItemFeedDataConnection;
  error?: string;
}

/**
 * Server Action para buscar a lista de feeds de ofertas da Shopee.
 *
 * Recebe o feedMode via FormData, valida com Zod e chama o serviço.
 */
export async function fetchItemFeeds(
  formData: FormData,
): Promise<ListItemFeedsResult> {
  const feedMode = formData.get("feedMode");

  // Validação de tipo básica
  if (typeof feedMode !== "string" || !feedMode.trim()) {
    return { success: false, error: "Por favor, selecione um modo de feed" };
  }

  // Validação com Zod
  const parseResult = ListItemFeedsSchema.safeParse({
    feedMode: feedMode as FeedMode,
  });
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message;
    return { success: false, error: firstError ?? "Modo de feed inválido" };
  }

  try {
    const response = await listItemFeeds(parseResult.data);
    return {
      success: true,
      feeds: response.feeds,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

/**
 * Server Action para buscar os dados/produtos de um feed específico da Shopee.
 *
 * Recebe datafeedId, offset e limit via FormData.
 */
export async function fetchItemFeedData(
  formData: FormData,
): Promise<GetItemFeedDataResult> {
  const datafeedId = formData.get("datafeedId");
  const offset = formData.get("offset");
  const limit = formData.get("limit");

  if (typeof datafeedId !== "string" || !datafeedId.trim()) {
    return { success: false, error: "datafeedId é obrigatório" };
  }

  const parseResult = GetItemFeedDataSchema.safeParse({
    datafeedId,
    offset: offset ? Number(offset) : 0,
    limit: limit ? Number(limit) : 500,
  });
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message;
    return { success: false, error: firstError ?? "Parâmetros inválidos" };
  }

  try {
    const response = await getItemFeedData(parseResult.data);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
