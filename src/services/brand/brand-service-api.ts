import "server-only";

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
  BrandCreateRequest,
  BrandCreateResponse,
  BrandDeleteRequest,
  BrandDeleteResponse,
  BrandDetail,
  BrandFindAllRequest,
  BrandFindAllResponse,
  BrandFindByIdRequest,
  BrandFindByIdResponse,
  BrandListItem,
  BrandUpdateRequest,
  BrandUpdateResponse,
  StoredProcedureResponse,
} from "./types/brand-types";
import { BrandError, BrandNotFoundError } from "./types/brand-types";
import {
  BrandCreateSchema,
  BrandDeleteSchema,
  BrandFindAllSchema,
  BrandFindByIdSchema,
  BrandUpdateSchema,
} from "./validation/brand-schemas";

const logger = createLogger("BrandServiceApi");

export class BrandServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: envs.SYSTEM_CLIENT_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllBrands(
    params: Partial<BrandFindAllRequest> = {},
  ): Promise<BrandFindAllResponse> {
    try {
      const validatedParams = BrandFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_brand_id: validatedParams.pe_brand_id ?? 0,
        pe_brand: validatedParams.pe_brand ?? "",
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<BrandFindAllResponse>(
        BRAND_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyBrandFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todas as marcas", error);
      throw error;
    }
  }

  async findBrandById(
    params: BrandFindByIdRequest,
  ): Promise<BrandFindByIdResponse> {
    try {
      const validatedParams = BrandFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandFindByIdResponse>(
        BRAND_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new BrandNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao buscar marca por ID",
          "BRAND_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar marca por ID", error);
      throw error;
    }
  }

  async createBrand(params: BrandCreateRequest): Promise<BrandCreateResponse> {
    try {
      const validatedParams = BrandCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandCreateResponse>(
        BRAND_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar marca", error);
      throw error;
    }
  }

  async updateBrand(params: BrandUpdateRequest): Promise<BrandUpdateResponse> {
    try {
      const validatedParams = BrandUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandUpdateResponse>(
        BRAND_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar marca", error);
      throw error;
    }
  }

  async deleteBrand(params: BrandDeleteRequest): Promise<BrandDeleteResponse> {
    try {
      const validatedParams = BrandDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandDeleteResponse>(
        BRAND_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir marca", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response: BrandCreateResponse | BrandUpdateResponse | BrandDeleteResponse,
  ): void {
    const spResponse = response.data?.[0]?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new BrandError(
        spResponse.sp_message || "Erro na operação de marca",
        "BRAND_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyBrandFindAllResponse(
    response: BrandFindAllResponse,
  ): BrandFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Brand find All": [],
        },
      };
    }
    return response;
  }

  extractBrands(response: BrandFindAllResponse): BrandListItem[] {
    return response.data?.["Brand find All"] ?? [];
  }

  extractBrandById(response: BrandFindByIdResponse): BrandDetail | null {
    return response.data?.["Brand find All"]?.[0] ?? null;
  }

  extractStoredProcedureResult(
    response: BrandCreateResponse | BrandUpdateResponse | BrandDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0]?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidBrandList(response: BrandFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"])
    );
  }

  isValidBrandDetail(response: BrandFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"]) &&
      response.data["Brand find All"].length > 0
    );
  }
}

export const brandServiceApi = new BrandServiceApi();
