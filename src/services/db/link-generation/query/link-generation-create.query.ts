import type { LinkGenerationCreateDto } from "../dto/link-generation-create.dto";

export function LinkGenerationCreateQuery(
  dataJsonDto: LinkGenerationCreateDto,
): string {
  const PE_UUID = dataJsonDto.PE_UUID;
  const PE_APP_ID = dataJsonDto.PE_APP_ID;
  const PE_CLIENT_ID = dataJsonDto.PE_CLIENT_ID;
  const PE_LINK_DESTINATION = dataJsonDto.PE_LINK_DESTINATION;
  const PE_AFFILIATE_LINK = dataJsonDto.PE_AFFILIATE_LINK;
  const PE_FLAG_CLICK = dataJsonDto.PE_FLAG_CLICK;
  const PE_ITEM_ID = dataJsonDto.PE_ITEM_ID;
  const PE_PRODUCT_NAME = dataJsonDto.PE_PRODUCT_NAME;
  const PE_SHOP_NAME = dataJsonDto.PE_SHOP_NAME;
  const PE_SHOP_ID = dataJsonDto.PE_SHOP_ID;
  const PE_PRICE_MIN = dataJsonDto.PE_PRICE_MIN;
  const PE_PRICE_MAX = dataJsonDto.PE_PRICE_MAX;
  const PE_COMMISSION_RATE = dataJsonDto.PE_COMMISSION_RATE;
  const PE_COMMISSION = dataJsonDto.PE_COMMISSION;
  const PE_SALES = dataJsonDto.PE_SALES;
  const PE_RATING_STAR = dataJsonDto.PE_RATING_STAR;
  const PE_IMAGE_URL = dataJsonDto.PE_IMAGE_URL;
  const PE_PRODUCT_LINK = dataJsonDto.PE_PRODUCT_LINK;
  const PE_OFFER_LINK = dataJsonDto.PE_OFFER_LINK;
  const PE_CURRENCY = dataJsonDto.PE_CURRENCY;
  const PE_DISCOUNT_PERCENT = dataJsonDto.PE_DISCOUNT_PERCENT;
  const PE_ORIGINAL_PRICE = dataJsonDto.PE_ORIGINAL_PRICE;
  const PE_CATEGORY = dataJsonDto.PE_CATEGORY;
  const PE_CATEGORY_ID = dataJsonDto.PE_CATEGORY_ID;
  const PE_BRAND_NAME = dataJsonDto.PE_BRAND_NAME;
  const PE_IS_OFFICIAL = dataJsonDto.PE_IS_OFFICIAL;
  const PE_FREE_SHIPPING = dataJsonDto.PE_FREE_SHIPPING;
  const PE_LOCATION = dataJsonDto.PE_LOCATION;

  const queryString = ` call sp_link_generation_create_v2(
        '${PE_UUID}',
        ${PE_APP_ID},
        ${PE_CLIENT_ID},
        '${PE_LINK_DESTINATION}',
        '${PE_AFFILIATE_LINK}',
        ${PE_FLAG_CLICK},
        ${PE_ITEM_ID},
        '${PE_PRODUCT_NAME}',
        '${PE_SHOP_NAME}',
        ${PE_SHOP_ID},
        ${PE_PRICE_MIN},
        ${PE_PRICE_MAX},
        ${PE_COMMISSION_RATE},
        ${PE_COMMISSION},
        ${PE_SALES},
        ${PE_RATING_STAR},
        '${PE_IMAGE_URL}',
        '${PE_PRODUCT_LINK}',
        '${PE_OFFER_LINK}',
        '${PE_CURRENCY}',
        ${PE_DISCOUNT_PERCENT},
        ${PE_ORIGINAL_PRICE},
        '${PE_CATEGORY}',
        ${PE_CATEGORY_ID},
        '${PE_BRAND_NAME}',
        ${PE_IS_OFFICIAL},
        ${PE_FREE_SHIPPING},
        '${PE_LOCATION}'
      ) `;

  return queryString;
}
