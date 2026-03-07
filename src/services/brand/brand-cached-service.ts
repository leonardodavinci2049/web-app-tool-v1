import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";

import { brandServiceApi } from "./brand-service-api";
import {
  transformBrand,
  transformBrandList,
  type UIBrand,
} from "./transformers/transformers";

const logger = createLogger("brand-cached-service");

export interface MutationResult {
  success: boolean;
  data?: number;
  error?: string;
}

export async function getBrands(
  params: { brandId?: number; brand?: string; limit?: number } = {},
): Promise<UIBrand[]> {
  "use cache";
  cacheLife("frequent");
  cacheTag(CACHE_TAGS.brands);

  try {
    const response = await brandServiceApi.findAllBrands({
      pe_brand_id: params.brandId,
      pe_brand: params.brand,
      pe_limit: params.limit,
    });

    const brands = brandServiceApi.extractBrands(response);
    return transformBrandList(brands);
  } catch (error) {
    logger.error("Erro ao buscar marcas:", error);
    return [];
  }
}

export async function getBrandById(id: number): Promise<UIBrand | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.brand(String(id)), CACHE_TAGS.brands);

  try {
    const response = await brandServiceApi.findBrandById({
      pe_brand_id: id,
    });

    const brand = brandServiceApi.extractBrandById(response);
    if (!brand) {
      return undefined;
    }

    return transformBrand(brand) ?? undefined;
  } catch (error) {
    logger.error(`Erro ao buscar marca por ID ${id}:`, error);
    return undefined;
  }
}

export async function createBrand(params: {
  brand: string;
  slug: string;
}): Promise<MutationResult> {
  try {
    const response = await brandServiceApi.createBrand({
      pe_brand: params.brand,
      pe_slug: params.slug,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao criar marca",
    };
  } catch (error) {
    logger.error("Erro ao criar marca:", error);
    return { success: false, error: "Erro ao criar marca" };
  }
}

export async function updateBrand(params: {
  brandId: number;
  brand?: string;
  slug?: string;
  imagePath?: string;
  notes?: string;
  inactive?: number;
}): Promise<MutationResult> {
  try {
    const response = await brandServiceApi.updateBrand({
      pe_brand_id: params.brandId,
      pe_brand: params.brand,
      pe_slug: params.slug,
      pe_image_path: params.imagePath,
      pe_notes: params.notes,
      pe_inactive: params.inactive,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao atualizar marca",
    };
  } catch (error) {
    logger.error("Erro ao atualizar marca:", error);
    return { success: false, error: "Erro ao atualizar marca" };
  }
}

export async function deleteBrand(id: number): Promise<MutationResult> {
  try {
    const response = await brandServiceApi.deleteBrand({
      pe_brand_id: id,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);
    if (result && result.sp_return_id > 0) {
      return { success: true, data: result.sp_return_id };
    }

    return {
      success: false,
      error: result?.sp_message || "Erro desconhecido ao excluir marca",
    };
  } catch (error) {
    logger.error("Erro ao excluir marca:", error);
    return { success: false, error: "Erro ao excluir marca" };
  }
}
