// 商品类型：前台和后台都共用这一份，后台字段会更完整一点。
export interface Product {
  id: number;
  name: string;
  nameEn?: string;
  sku?: string;
  shopId?: number;
  shopName?: string;
  shopGoodReviewCount?: number;
  shopCreditLevel?: string;
  categoryId?: number;
  categoryName?: string;
  categoryNameEn?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  sales?: number;
  favoriteCount?: number;
  /** 评价条数（与后端 ratingCount 一致，兼容旧字段名） */
  goodReviewCount?: number;
  ratingCount?: number;
  avgRating?: number;
  ratingHighCount?: number;
  ratingLowCount?: number;
  /** 高星(>3)条数大于低星(<3)条数且总有评价时为 true */
  isPremiumProduct?: boolean;
  /** 当前用户已提交的星级，未评则无 */
  myRating?: number;
  /** 登录用户可提交/修改评价 */
  canRate?: boolean;
  isFavorite?: boolean;
  /** @deprecated 请用 canRate */
  canGoodReview?: boolean;
  status?: 'on_sale' | 'off_sale';
  cover: string;
  description?: string;
  descriptionEn?: string;
  createdAt?: string;
  updatedAt?: string;
  // 多规格 SKU
  skuSpecs?: SkuSpec[];
  skuVariants?: SkuVariant[];
}

export interface SkuSpec {
  name: string;
  values: SkuSpecValue[];
}

export interface SkuSpecValue {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SkuVariant {
  id: number | string;
  specValues: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
}

/** 商品评价 */
export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  content?: string;
  createdAt: string;
  updatedAt?: string;
}
