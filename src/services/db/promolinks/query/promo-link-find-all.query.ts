import type { PromoLinkFindAllDto } from "../dto/promo-link-find-all.dto";

export function PromoLinkFindAllQuery(
  dataJsonDto: PromoLinkFindAllDto,
): string {
  const PE_APP_ID = dataJsonDto.PE_APP_ID;
  const PE_CLIENT_ID = dataJsonDto.PE_CLIENT_ID;
  const PE_LINK_ID = dataJsonDto.PE_LINK_ID;
  const PE_LIMIT = dataJsonDto.PE_LIMIT;

  const clientIdValue = PE_CLIENT_ID !== undefined ? PE_CLIENT_ID : "NULL";

  const queryString = ` call sp_promo_link_find_all_v2(
        ${PE_APP_ID},
        ${clientIdValue},
        ${PE_LINK_ID},
        ${PE_LIMIT}
      ) `;

  return queryString;
}
