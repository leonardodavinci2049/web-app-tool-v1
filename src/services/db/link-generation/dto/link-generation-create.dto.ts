export interface LinkGenerationCreateDto {
  PE_UUID: string;
  PE_CLIENT_ID: number;
  PE_APP_ID: number;
  PE_LINK_DESTINATION: string;
  PE_AFFILIATE_LINK: string;
  PE_FLAG_CLICK: number;
  PE_ITEM_ID: number;
  PE_PRODUCT_NAME: string;
  PE_SHOP_NAME: string;
  PE_SHOP_ID: number;
  PE_PRICE_MIN: number;
  PE_PRICE_MAX: number;
  PE_COMMISSION_RATE: number;
  PE_COMMISSION: number;
  PE_SALES: number;
  PE_RATING_STAR: number;
  PE_IMAGE_URL: string;
  PE_PRODUCT_LINK: string;
  PE_OFFER_LINK: string;
  PE_CURRENCY: string;
  PE_DISCOUNT_PERCENT: number;
  PE_ORIGINAL_PRICE: number;
  PE_CATEGORY: string;
  PE_CATEGORY_ID: number;
  PE_BRAND_NAME: string;
  PE_IS_OFFICIAL: number;
  PE_FREE_SHIPPING: number;
  PE_LOCATION: string;
}

export function validateLinkGenerationCreateDto(
  data: unknown,
): LinkGenerationCreateDto {
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new Error("Dados inválidos fornecidos");
  }

  const dto = (data as Record<string, unknown>) || {};

  const PE_APP_ID =
    dto.PE_APP_ID !== undefined && dto.PE_APP_ID !== null
      ? Number(dto.PE_APP_ID)
      : 1;
  const PE_CLIENT_ID =
    dto.PE_CLIENT_ID !== undefined && dto.PE_CLIENT_ID !== null
      ? Number(dto.PE_CLIENT_ID)
      : 1;
  const PE_UUID = String(dto.PE_UUID || "").trim();
  const PE_LINK_DESTINATION = String(dto.PE_LINK_DESTINATION || "").trim();
  const PE_AFFILIATE_LINK = String(dto.PE_AFFILIATE_LINK || "").trim();
  const PE_FLAG_CLICK =
    dto.PE_FLAG_CLICK !== undefined && dto.PE_FLAG_CLICK !== null
      ? Number(dto.PE_FLAG_CLICK)
      : 0;
  const PE_ITEM_ID =
    dto.PE_ITEM_ID !== undefined && dto.PE_ITEM_ID !== null
      ? Number(dto.PE_ITEM_ID)
      : 0;
  const PE_PRODUCT_NAME = String(dto.PE_PRODUCT_NAME || "").trim();
  const PE_SHOP_NAME = String(dto.PE_SHOP_NAME || "").trim();
  const PE_SHOP_ID =
    dto.PE_SHOP_ID !== undefined && dto.PE_SHOP_ID !== null
      ? Number(dto.PE_SHOP_ID)
      : 0;
  const PE_PRICE_MIN =
    dto.PE_PRICE_MIN !== undefined && dto.PE_PRICE_MIN !== null
      ? Number(dto.PE_PRICE_MIN)
      : 0;
  const PE_PRICE_MAX =
    dto.PE_PRICE_MAX !== undefined && dto.PE_PRICE_MAX !== null
      ? Number(dto.PE_PRICE_MAX)
      : 0;
  const PE_COMMISSION_RATE =
    dto.PE_COMMISSION_RATE !== undefined && dto.PE_COMMISSION_RATE !== null
      ? Number(dto.PE_COMMISSION_RATE)
      : 0;
  const PE_COMMISSION =
    dto.PE_COMMISSION !== undefined && dto.PE_COMMISSION !== null
      ? Number(dto.PE_COMMISSION)
      : 0;
  const PE_SALES =
    dto.PE_SALES !== undefined && dto.PE_SALES !== null
      ? Number(dto.PE_SALES)
      : 0;
  const PE_RATING_STAR =
    dto.PE_RATING_STAR !== undefined && dto.PE_RATING_STAR !== null
      ? Number(dto.PE_RATING_STAR)
      : 0;
  const PE_IMAGE_URL = String(dto.PE_IMAGE_URL || "").trim();
  const PE_PRODUCT_LINK = String(dto.PE_PRODUCT_LINK || "").trim();
  const PE_OFFER_LINK = String(dto.PE_OFFER_LINK || "").trim();
  const PE_CURRENCY = String(dto.PE_CURRENCY || "BRL").trim();
  const PE_DISCOUNT_PERCENT =
    dto.PE_DISCOUNT_PERCENT !== undefined && dto.PE_DISCOUNT_PERCENT !== null
      ? Number(dto.PE_DISCOUNT_PERCENT)
      : 0;
  const PE_ORIGINAL_PRICE =
    dto.PE_ORIGINAL_PRICE !== undefined && dto.PE_ORIGINAL_PRICE !== null
      ? Number(dto.PE_ORIGINAL_PRICE)
      : 0;
  const PE_CATEGORY = String(dto.PE_CATEGORY || "").trim();
  const PE_CATEGORY_ID =
    dto.PE_CATEGORY_ID !== undefined && dto.PE_CATEGORY_ID !== null
      ? Number(dto.PE_CATEGORY_ID)
      : 0;
  const PE_BRAND_NAME = String(dto.PE_BRAND_NAME || "").trim();
  const PE_IS_OFFICIAL =
    dto.PE_IS_OFFICIAL !== undefined && dto.PE_IS_OFFICIAL !== null
      ? Number(dto.PE_IS_OFFICIAL)
      : 0;
  const PE_FREE_SHIPPING =
    dto.PE_FREE_SHIPPING !== undefined && dto.PE_FREE_SHIPPING !== null
      ? Number(dto.PE_FREE_SHIPPING)
      : 0;
  const PE_LOCATION = String(dto.PE_LOCATION || "").trim();

  return {
    PE_UUID,
    PE_CLIENT_ID,
    PE_APP_ID,
    PE_LINK_DESTINATION,
    PE_AFFILIATE_LINK,
    PE_FLAG_CLICK,
    PE_ITEM_ID,
    PE_PRODUCT_NAME,
    PE_SHOP_NAME,
    PE_SHOP_ID,
    PE_PRICE_MIN,
    PE_PRICE_MAX,
    PE_COMMISSION_RATE,
    PE_COMMISSION,
    PE_SALES,
    PE_RATING_STAR,
    PE_IMAGE_URL,
    PE_PRODUCT_LINK,
    PE_OFFER_LINK,
    PE_CURRENCY,
    PE_DISCOUNT_PERCENT,
    PE_ORIGINAL_PRICE,
    PE_CATEGORY,
    PE_CATEGORY_ID,
    PE_BRAND_NAME,
    PE_IS_OFFICIAL,
    PE_FREE_SHIPPING,
    PE_LOCATION,
  };
}
