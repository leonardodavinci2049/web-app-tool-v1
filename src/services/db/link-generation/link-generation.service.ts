import { MESSAGES } from "@/core/constants/globalConstants";

import dbService from "../dbConnection";
import { processProcedureResultMutation } from "../utils/process-procedure-result.mutation";
import { processProcedureResultQueryWithoutId } from "../utils/process-procedure-result.query";
import { ResultModel } from "../utils/result.model";
import { validateLinkGenerationCreateDto } from "./dto/link-generation-create.dto";
import { validateLinkGenerationFindAllDto } from "./dto/link-generation-find-all.dto";
import { LinkGenerationCreateQuery } from "./query/link-generation-create.query";
import { LinkGenerationFindAllQuery } from "./query/link-generation-find-all.query";
import type {
  SpResultlinkGenerationFindAllType,
  SpResultRecordCreateType,
  TblLinkGenerationFindAll,
} from "./types/link-generation.type";

export class LinkGenerationService {
  async execLinkGenerationCreateQuery(
    dataJsonDto: unknown,
  ): Promise<ResultModel> {
    try {
      const validatedDto = validateLinkGenerationCreateDto(dataJsonDto);

      const queryString = LinkGenerationCreateQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordCreateType;

      return processProcedureResultMutation(
        resultData as unknown[],
        "Link generation creation failed",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }

  async execLinkGenerationFindAllQuery(
    dataJsonDto: unknown,
  ): Promise<ResultModel> {
    try {
      const validatedDto = validateLinkGenerationFindAllDto(dataJsonDto);

      const queryString = LinkGenerationFindAllQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultlinkGenerationFindAllType;

      return processProcedureResultQueryWithoutId<TblLinkGenerationFindAll>(
        resultData as unknown[],
        "Link generations not found",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }
}

const linkGenerationService = new LinkGenerationService();
export default linkGenerationService;
