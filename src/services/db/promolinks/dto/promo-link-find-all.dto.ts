export interface PromoLinkFindAllDto {
  PE_CLIENT_ID?: number;
  PE_APP_ID: number;
  PE_LINK_ID: number;
  PE_LIMIT?: number;
}

export function validatePromoLinkFindAllDto(
  data: unknown,
): PromoLinkFindAllDto {
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new Error("Dados inválidos fornecidos");
  }

  const dto = (data as Record<string, unknown>) || {};

  const PE_APP_ID =
    dto.PE_APP_ID !== undefined && dto.PE_APP_ID !== null
      ? Number(dto.PE_APP_ID)
      : 1;
  const PE_CLIENT_ID =
    dto.PE_CLIENT_ID !== undefined && dto.PE_CLIENT_ID !== null
      ? Number(dto.PE_CLIENT_ID)
      : undefined;
  const PE_LINK_ID =
    dto.PE_LINK_ID !== undefined && dto.PE_LINK_ID !== null
      ? Number(dto.PE_LINK_ID)
      : 0;
  const PE_LIMIT =
    dto.PE_LIMIT !== undefined && dto.PE_LIMIT !== null
      ? Number(dto.PE_LIMIT)
      : 10;

  return {
    PE_CLIENT_ID,
    PE_APP_ID,
    PE_LINK_ID,
    PE_LIMIT,
  };
}
