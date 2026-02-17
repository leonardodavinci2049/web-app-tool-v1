// Tipos para o serviço de marcas (Brand)

/**
 * Custom error class for brand-related errors
 */
export class BrandError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "BrandError";
    Object.setPrototypeOf(this, BrandError.prototype);
  }
}

/**
 * Error thrown when brand is not found
 */
export class BrandNotFoundError extends BrandError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Marca não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Marca não encontrada";
    super(message, "BRAND_NOT_FOUND", 100404);
    this.name = "BrandNotFoundError";
    Object.setPrototypeOf(this, BrandNotFoundError.prototype);
  }
}

/**
 * Error thrown when brand validation fails
 */
export class BrandValidationError extends BrandError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "BRAND_VALIDATION_ERROR", 100400);
    this.name = "BrandValidationError";
    Object.setPrototypeOf(this, BrandValidationError.prototype);
  }
}

/**
 * Base request interface with common parameters
 */
interface BaseBrandRequest {
  pe_app_id: number;
  pe_system_client_id: number;
  pe_store_id: number;
  pe_organization_id?: string;
  pe_member_id?: string;
  pe_user_id?: string;
  pe_person_id?: number;
}

/**
 * Requisição para listar marcas
 */
export interface FindBrandRequest extends BaseBrandRequest {
  pe_id_marca?: number;
  pe_marca?: string;
  pe_limit?: number;
}

/**
 * Estrutura de dados da marca
 */
export interface BrandData {
  ID_MARCA: number;
  MARCA: string | null;
}

/**
 * Estrutura de resposta da stored procedure
 */
export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

/**
 * Estrutura de metadados MySQL
 */
export interface MySQLMetadata {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
  changedRows: number;
}

/**
 * Base response interface
 */
interface BaseBrandResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  info1: string;
}

/**
 * Resposta da listagem de marcas
 */
export interface FindBrandResponse extends BaseBrandResponse {
  data: [BrandData[], [StoredProcedureResponse], MySQLMetadata];
}
