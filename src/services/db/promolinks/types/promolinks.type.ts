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

export interface TblPromoLinkFindAll {
  ID: number;
  LINK1: string;
  LINK2: string;
  LINK3: string;
  LINK_NAME1: string;
  LINK_NAME2: string;
  LINK_NAME3: string;
  SECRET_KEY1: string;
  SECRET_KEY2: string;
  SECRET_KEY3: string;
  NOTES: string;
  CREATEDAT: string;
  UPDATEDAT: string;
}

export type SpResultPromoLinkFindAllType = [
  TblPromoLinkFindAll[],
  SpDefaultFeedback[],
  SpOperationResult,
];
