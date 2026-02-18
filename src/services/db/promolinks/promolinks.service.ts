import { MESSAGES } from "@/core/constants/globalConstants";

import dbService from "../dbConnection";
import { processProcedureResultQueryWithoutId } from "../utils/process-procedure-result.query";
import { ResultModel } from "../utils/result.model";
import { validatePromoLinkFindAllDto } from "./dto/promo-link-find-all.dto";
import { PromoLinkFindAllQuery } from "./query/promo-link-find-all.query";
import type {
  SpResultPromoLinkFindAllType,
  TblPromoLinkFindAll,
} from "./types/promolinks.type";

export class PromoLinksService {
  async execPromoLinkFindAllQuery(dataJsonDto: unknown): Promise<ResultModel> {
    try {
      const validatedDto = validatePromoLinkFindAllDto(dataJsonDto);

      const queryString = PromoLinkFindAllQuery(validatedDto);

      const resultData = (await dbService.selectExecute(
        queryString,
      )) as unknown as SpResultPromoLinkFindAllType;

      return processProcedureResultQueryWithoutId<TblPromoLinkFindAll>(
        resultData as unknown[],
        "Promo links not found",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, "", []);
    }
  }
}

const promoLinksService = new PromoLinksService();
export default promoLinksService;
