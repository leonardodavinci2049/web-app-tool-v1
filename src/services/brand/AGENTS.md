# Agent Guidelines - Brand API Service

Este documento define convenções e padrões específicos para o módulo de serviço de marcas (`src/services/api-main/brand`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
brand/
├── brand-service-api.ts       # Classe principal - integração direta com API
├── brand-cached-service.ts    # Funções com cache para Server Components
├── index.ts                   # Exportações públicas
├── types/
│   └── brand-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── brand-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts        # Entity → DTO (API response → UI models)
```

## Responsabilidades

### 1. `brand-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store, organization, user)
- **Normaliza** respostas de API (NOT_FOUND → SUCCESS com array vazio)
- **Extrai** dados da estrutura de resposta da API
- **Lança** erros específicos (`BrandError`, `BrandNotFoundError`)
- **Não usa cache** - apenas comunicação direta

### 2. `brand-cached-service.ts` (Camada de Cache)
- **Fornece** funções para Server Components
- **Usa** Next.js Cache com `cacheLife` e `cacheTag`
- **Transforma** entidades API → DTOs UI
- **Retorna** estruturas simplificadas (`UIBrand[]`, `MutationResult`)
- **Trata erros** silenciosamente (return `[]` ou `undefined`)
- **Usa** tags de cache para invalidação: `CACHE_TAGS.brands`, `CACHE_TAGS.brand(id)`

### 3. `types/brand-types.ts`
- Define interfaces para **requests** (`*Request`)
- Define interfaces para **responses** (`*Response`)
- Define tipos para **entidades** (`BrandListItem`, `BrandDetail`)
- Define classes de erro customizadas

### 4. `validation/brand-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`*Input`)
- Define constraints específicas da API (max length, min values)

### 5. `transformers/transformers.ts`
- **Converte** entidades da API (`BrandListItem`, `BrandDetail`) → DTOs UI (`UIBrand`)
- **Normaliza** tipos (ex: `INATIVO: number` → `inactive: boolean`)
- **Handle** campos opcionais/null

## Padrões de Código

### Nomes de Parâmetros API
Prefixo `pe_` (parameter):

**Parâmetros de Contexto (opcionais):**
```typescript
pe_organization_id: string  // ID da organização (Max 200 chars) - depende do usuário logado
pe_user_id: string          // ID do usuário (Max 200 chars) - depende do usuário logado
pe_member_role: string      // Papel do membro (Max 200 chars) - depende do usuário logado
pe_person_id: number        // ID da pessoa associada - depende do usuário logado
```

**Parâmetros Específicos de Marca:**
```typescript
pe_brand_id: number        // ID da marca
pe_brand: string           // Nome da marca
pe_slug: string            // Slug da marca
pe_image_path: string      // Caminho da imagem
pe_notes: string           // Observações
pe_inactive: number        // 0 = ativo, 1 = inativo
```

### Payload Base
Todos os requests incluem contexto por padrão:
```typescript
{
  // Parâmetros fixos (carregados das variáveis de ambiente)
  pe_app_id: envs.APP_ID,
  pe_system_client_id: envs.SYSTEM_CLIENT_ID,
  pe_store_id: envs.STORE_ID,

  // Parâmetros dinâmicos (dependem do usuário logado)
  // pe_organization_id: string  // Max 200 chars
  // pe_user_id: string          // Max 200 chars
  // pe_member_role: string      // Max 200 chars
  // pe_person_id: number

  // ... parâmetros específicos da operação
}
```

### Estrutura de Resposta da API
```typescript
{
  statusCode: number,      // 200, 404, 500, etc.
  message: string,         // Mensagem da API
  recordId: number,        // ID do registro (se aplicável)
  quantity: number,        // Quantidade de itens
  errorId: number,         // ID do erro (se houver)
  info1?: string,          // Info adicional
  data: {
    "Brand find All": [...],  // Chave específica da API
    "StoredProcedure": [[...]] // Para operações de mutação
  }
}
```

### Cache Configuration
```typescript
// Leitura de lista - cache frequente
"use cache";
cacheLife("frequent");
cacheTag(CACHE_TAGS.brands);

// Leitura por ID - cache de horas
"use cache";
cacheLife("hours");
cacheTag(CACHE_TAGS.brand(String(id)), CACHE_TAGS.brands);
```

### Validação com Zod
```typescript
// Importante: usar .parse() para lançar erro de validação
const validatedParams = BrandCreateSchema.parse(params);

// Para queries opcionais: usar .partial().parse()
const validatedParams = BrandFindAllSchema.partial().parse(params);
```

### Tratamento de Erros
```typescript
// BrandServiceApi: lança erros específicos
if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
  throw new BrandNotFoundError(validatedParams);
}

// brand-cached-service: trata silenciosamente
try {
  // ...
} catch (error) {
  logger.error("Erro ao buscar marcas:", error);
  return []; // ou undefined
}
```

### Transformação de Dados
```typescript
// API Entity → UI DTO
export function transformBrand(entity: BrandListItem | BrandDetail): UIBrand | null {
  if (!entity) return null;
  
  if ("UUID" in entity) {
    return transformBrandDetail(entity); // Detalhe completo
  }
  
  return transformBrandListItem(entity); // Lista simples
}
```

## Constantes Utilizadas

```typescript
// Endpoints da API
BRAND_ENDPOINTS = {
  FIND_ALL: "/brand/find-all",
  FIND_BY_ID: "/brand/find-by-id",
  CREATE: "/brand/create",
  UPDATE: "/brand/update",
  DELETE: "/brand/delete"
}

// Status codes
API_STATUS_CODES = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  EMPTY_RESULT: 100, // Código específico da API
  // ...
}

// Cache tags
CACHE_TAGS = {
  brands: "brands",
  brand: (id: string) => `brand:${id}`
}
```

## Uso em Server Components

```typescript
import { getBrands, getBrandById } from "@/services/api-main/brand";

async function BrandList() {
  const brands = await getBrands({ limit: 50 });
  // brands: UIBrand[]

  return <ul>{brands.map(b => <li key={b.id}>{b.name}</li>)}</ul>;
}
```

## Uso em Server Actions

```typescript
import { createBrand, updateBrand, deleteBrand } from "@/services/api-main/brand";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";

export async function createBrandAction(data: { brand: string, slug: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const result = await createBrand({
    pe_organization_id: session?.user?.organizationId,
    pe_user_id: session?.user?.id,
    pe_member_role: session?.user?.role,
    pe_person_id: session?.user?.personId,
    ...data
  });

  if (result.success) {
    revalidateTag("brands"); // Invalida cache
    return { success: true };
  }

  return { success: false, error: result.error };
}
```

## Regras Específicas

1. **Sempre usar `"server-only"`** no topo dos arquivos
2. **Validar com Zod** antes de enviar para API
3. **Usar cache apenas em `brand-cached-service.ts`**
4. **Lançar erros específicos** em `brand-service-api.ts`
5. **Transformar entidades** para UI DTOs antes de retornar
6. **Invalidar cache** após operações de mutação
7. **Prefixar parâmetros API** com `pe_`
8. **Usar logger** para erros com contexto descritivo
9. **Usar cache tags** hierárquicas (`brands` + `brand:id`)
10. **Normalizar respostas vazias** (NOT_FOUND → SUCCESS + [])
11. **Parâmetros de contexto fixos**: pe_app_id, pe_system_client_id, pe_store_id (carregados de env)
12. **Parâmetros de contexto dinâmicos**: pe_organization_id, pe_user_id, pe_member_role, pe_person_id (obrigatórios na API, mas opcionais nos schemas - devem ser passados pelo usuário logado)
