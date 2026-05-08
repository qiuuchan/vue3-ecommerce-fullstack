export type { AppLocale } from './messages';
export { permissionMessageKey } from './messages';
import type { AppLocale as AppLocaleType } from './messages';

import { addressMessages as zhAddress } from './locales/zh-CN/address';
import { adminMessages as zhAdmin } from './locales/zh-CN/admin';
import { cartMessages as zhCart } from './locales/zh-CN/cart';
import { commonMessages as zhCommon } from './locales/zh-CN/common';
import { homeMessages as zhHome } from './locales/zh-CN/home';
import { layoutMessages as zhLayout } from './locales/zh-CN/layout';
import { orderMessages as zhOrder } from './locales/zh-CN/order';
import { productMessages as zhProduct } from './locales/zh-CN/product';
import { routeMessages as zhRoute } from './locales/zh-CN/route';
import { userMessages as zhUser } from './locales/zh-CN/user';
import { addressMessages as enAddress } from './locales/en-US/address';
import { adminMessages as enAdmin } from './locales/en-US/admin';
import { cartMessages as enCart } from './locales/en-US/cart';
import { commonMessages as enCommon } from './locales/en-US/common';
import { homeMessages as enHome } from './locales/en-US/home';
import { layoutMessages as enLayout } from './locales/en-US/layout';
import { orderMessages as enOrder } from './locales/en-US/order';
import { productMessages as enProduct } from './locales/en-US/product';
import { routeMessages as enRoute } from './locales/en-US/route';
import { userMessages as enUser } from './locales/en-US/user';

export const appMessages: Record<AppLocaleType, Record<string, string>> = {
  'zh-CN': {
    ...zhAddress,
    ...zhAdmin,
    ...zhCart,
    ...zhCommon,
    ...zhHome,
    ...zhLayout,
    ...zhOrder,
    ...zhProduct,
    ...zhRoute,
    ...zhUser,
  },
  'en-US': {
    ...enAddress,
    ...enAdmin,
    ...enCart,
    ...enCommon,
    ...enHome,
    ...enLayout,
    ...enOrder,
    ...enProduct,
    ...enRoute,
    ...enUser,
  },
};
