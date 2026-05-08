// 店铺类型：前台展示用（与后端 publicShopSummary 对齐）

export interface ShopPublic {
  id: number;
  name: string;
  nameEn?: string;
  logo?: string;
  banner?: string;
  tagline?: string;
  taglineEn?: string;
  description?: string;
  descriptionEn?: string;
  followerCount?: number;
  goodReviewCount?: number;
  shopCreditLevel?: string;
  productCountOnSale?: number;
  status?: string;
  /** 该店全部在售商品均为「优质商品」时为 true */
  isPremiumShop?: boolean;
}

// 后台店铺行：在 ShopPublic 基础上多一个商品数量统计
export interface ShopAdminRecord extends ShopPublic {
  productCount?: number;
}
