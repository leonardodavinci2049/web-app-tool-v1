import type { LinkGenerationFindAllDto } from "../dto/link-generation-find-all.dto";

export function LinkGenerationFindAllQuery(
  dataJsonDto: LinkGenerationFindAllDto,
): string {
  const PE_APP_ID = dataJsonDto.PE_APP_ID;
  const PE_CLIENT_ID = dataJsonDto.PE_CLIENT_ID;
  const PE_LIMIT = dataJsonDto.PE_LIMIT;

  const clientIdValue = PE_CLIENT_ID !== undefined ? PE_CLIENT_ID : "NULL";

  const queryString = ` call sp_link_generation_find_all_v2(
        ${PE_APP_ID},
        ${clientIdValue},
        ${PE_LIMIT}
      ) `;

  return queryString;
}
