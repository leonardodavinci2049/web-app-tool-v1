/**
 * Serviço de marcas para interagir com a API
 */

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  BRAND_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  BrandData,
  FindBrandRequest,
  FindBrandResponse,
  StoredProcedureResponse,
} from "./types/brand-types";

import { FindBrandSchema } from "./validation/brand-schemas";

// Logger instance
const logger = createLogger("BrandService");

/**
 * Serviço para operações relacionadas a marcas
 */
export class BrandServiceApi extends BaseApiService {
  /**
   * Build base payload with environment variables
   */
  private static buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: envs.SYSTEM_CLIENT_ID,
      pe_store_id: envs.STORE_ID,
      pe_organization_id: envs.ORGANIZATION_ID,
      pe_member_id: envs.MEMBER_ID,
      pe_user_id: envs.USER_ID,
      pe_person_id: envs.PERSON_ID,
      ...additionalData,
    };
  }

  /**
   * Endpoint - Listar Marcas v2
   * @param params - Parâmetros de busca e filtros
   * @returns Promise com lista de marcas
   */
  static async findBrands(
    params: Partial<FindBrandRequest> = {},
  ): Promise<FindBrandResponse> {
    try {
      const validatedParams = BrandServiceApi.validateSearchParams(params);
      const requestBody = BrandServiceApi.buildSearchPayload(validatedParams);

      const response = await BrandServiceApi.executeBrandSearch(requestBody);

      return BrandServiceApi.handleSearchResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de marcas (busca)", error);
      throw error;
    }
  }

  /**
   * Valida parâmetros de busca
   * @private
   */
  private static validateSearchParams(
    params: Partial<FindBrandRequest>,
  ): Partial<FindBrandRequest> {
    try {
      return FindBrandSchema.partial().parse(params);
    } catch (error) {
      logger.error("Erro na validação de parâmetros de busca", error);
      throw error;
    }
  }

  /**
   * Constrói payload de busca com valores padrão
   * @private
   */
  private static buildSearchPayload(
    params: Partial<FindBrandRequest>,
  ): Record<string, unknown> {
    const payload = BrandServiceApi.buildBasePayload({
      pe_id_marca: 0, // Valor padrão - sem filtro específico
      pe_marca: "", // Valor padrão - sem filtro por nome
      pe_limit: 100, // Valor padrão - 100 registros
      ...params,
    });

    return payload;
  }

  /**
   * Executa busca de marcas na API
   * @private
   */
  private static async executeBrandSearch(
    requestBody: Record<string, unknown>,
  ): Promise<FindBrandResponse> {
    const instance = new BrandServiceApi();
    return await instance.post<FindBrandResponse>(
      BRAND_ENDPOINTS.FIND_ALL,
      requestBody,
    );
  }

  /**
   * Trata resposta da busca de marcas
   * @private
   */
  private static handleSearchResponse(
    data: FindBrandResponse,
  ): FindBrandResponse {
    // Verifica se é código de resultado vazio ou não encontrado
    if (
      data.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      data.statusCode === API_STATUS_CODES.NOT_FOUND ||
      data.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      return {
        ...data,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: [
          [],
          [
            {
              sp_return_id: 0,
              sp_message: "Nenhuma marca encontrada",
              sp_error_id: 0,
            },
          ],
          {
            fieldCount: 0,
            affectedRows: 0,
            insertId: 0,
            info: "",
            serverStatus: 0,
            warningStatus: 0,
            changedRows: 0,
          },
        ],
      };
    }

    // Verifica se a busca foi bem-sucedida usando função utilitária
    if (isApiError(data.statusCode)) {
      throw new Error(data.message || "Erro ao buscar marcas");
    }

    return data;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Extrai lista de marcas da resposta da API
   * @param response - Resposta da API
   * @returns Lista de marcas ou array vazio
   */
  static extractBrandList(response: FindBrandResponse): BrandData[] {
    return response.data?.[0] ?? [];
  }

  /**
   * Extrai resposta da stored procedure
   * @param response - Resposta da API com stored procedure
   * @returns Resposta da stored procedure ou null
   */
  static extractStoredProcedureResponse(
    response: FindBrandResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[1]?.[0] ?? null;
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Valida se a resposta de busca de marcas é válida
   * @param response - Resposta da API
   * @returns true se válida, false caso contrário
   */
  static isValidBrandResponse(response: FindBrandResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data[0])
    );
  }

  /**
   * Verifica se a operação foi bem-sucedida baseado na stored procedure
   * @param response - Resposta da API
   * @returns true se bem-sucedida, false caso contrário
   */
  static isOperationSuccessful(response: FindBrandResponse): boolean {
    const spResponse = BrandServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }
}
