export interface SpDefaultFeedback {
  sp_return_id?: string;
  sp_message?: string;
  sp_error_id?: number;
}

export interface SpOperationResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
  changedRows: number;
}

export type SpResultRecordCreateType = [SpDefaultFeedback[], SpOperationResult];

export interface TblLinkGenerationFindAll {
  ID: number;
  CREATEDAT: string;
  LINK_DESTINATION: string;
  AFFILIATE_LINK: string;
  FLAG_CLICK: number;
  ITEM_ID: number;
  PRODUCT_NAME: string;
  SHOP_NAME: string;
  SHOP_ID: number;
  PRICE_MIN: number;
  PRICE_MAX: number;
  COMMISSION_RATE: number;
  COMMISSION: number;
  SALES: number;
  RATING_STAR: number;
  IMAGE_URL: string;
  PRODUCT_LINK: string;
  OFFER_LINK: string;
  CURRENCY: string;
  DISCOUNT_PERCENT: number;
  ORIGINAL_PRICE: number;
  CATEGORY: string;
  CATEGORY_ID: number;
  BRAND_NAME: string;
  IS_OFFICIAL: number;
  FREE_SHIPPING: number;
  LOCATION: string;
}

export type SpResultlinkGenerationFindAllType = [
  TblLinkGenerationFindAll[],
  SpDefaultFeedback[],
  SpOperationResult,
];
