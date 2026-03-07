import { z } from "zod";

export const BrandCreateSchema = z.object({
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_member_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_brand: z.string().max(100).min(1),
  pe_slug: z.string().max(300).min(1),
});

export const BrandFindAllSchema = z.object({
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_member_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_brand_id: z.number().int().min(0).optional(),
  pe_brand: z.string().max(200).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const BrandFindByIdSchema = z.object({
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_member_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_brand_id: z.number().int().positive(),
});

export const BrandUpdateSchema = z.object({
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_member_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_brand_id: z.number().int().positive(),
  pe_brand: z.string().max(100).optional(),
  pe_slug: z.string().max(100).optional(),
  pe_image_path: z.string().max(500).optional(),
  pe_notes: z.string().optional(),
  pe_inactive: z.number().int().min(0).max(1).optional(),
});

export const BrandDeleteSchema = z.object({
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_member_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_brand_id: z.number().int().positive(),
});

export type BrandCreateInput = z.infer<typeof BrandCreateSchema>;
export type BrandFindAllInput = z.infer<typeof BrandFindAllSchema>;
export type BrandFindByIdInput = z.infer<typeof BrandFindByIdSchema>;
export type BrandUpdateInput = z.infer<typeof BrandUpdateSchema>;
export type BrandDeleteInput = z.infer<typeof BrandDeleteSchema>;
