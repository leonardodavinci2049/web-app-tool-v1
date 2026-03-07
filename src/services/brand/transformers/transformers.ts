import "server-only";

import type { BrandDetail, BrandListItem } from "../types/brand-types";

export interface UIBrand {
  id: number;
  name: string;
  slug?: string;
  imagePath?: string;
  notes?: string;
  inactive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function transformBrandListItem(entity: BrandListItem): UIBrand {
  return {
    id: entity.ID_MARCA,
    name: entity.MARCA,
    slug: undefined,
    imagePath: undefined,
    notes: undefined,
    inactive: false,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export function transformBrandList(items: BrandListItem[]): UIBrand[] {
  return items.map(transformBrandListItem);
}

export function transformBrandDetail(entity: BrandDetail): UIBrand {
  return {
    id: entity.ID_MARCA,
    name: entity.MARCA ?? entity.NOME ?? "",
    slug: undefined,
    imagePath: undefined,
    notes: undefined,
    inactive: entity.INATIVO === 1,
    createdAt: entity.DATADOCADASTRO,
    updatedAt: entity.DT_UPDATE ?? undefined,
  };
}

export function transformBrandDetailList(items: BrandDetail[]): UIBrand[] {
  return items.map(transformBrandDetail);
}

export function transformBrand(
  entity: BrandListItem | BrandDetail | null | undefined,
): UIBrand | null {
  if (!entity) return null;

  if ("UUID" in entity) {
    return transformBrandDetail(entity as BrandDetail);
  }

  return transformBrandListItem(entity as BrandListItem);
}
