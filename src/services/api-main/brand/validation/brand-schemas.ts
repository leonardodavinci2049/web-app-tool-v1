/**
 * Schemas de validação Zod para o serviço de marcas
 */

import { z } from "zod";

/**
 * Schema para listar marcas com filtros
 */
export const FindBrandSchema = z.object({
  pe_id_marca: z.number().int().min(0).optional(),
  pe_marca: z.string().max(255).optional(),
  pe_limit: z.number().int().min(1).max(500).optional(),
});

/**
 * Tipos inferidos dos schemas
 */
export type FindBrandInput = z.infer<typeof FindBrandSchema>;
