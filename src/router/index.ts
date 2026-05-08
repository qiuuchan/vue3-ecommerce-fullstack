import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { appMessages } from '@/i18n/index';
import { adminRoutes } from './modules/admin';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页', titleKey: 'route.home' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductListView.vue'),
          meta: { title: '商品列表', titleKey: 'route.products' }
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/SearchView.vue'),
          meta: { title: '搜索', titleKey: 'route.search' }
        },
        {
          path: 'compare',
          name: 'compare',
          component: () => import('@/views/CompareView.vue'),
          meta: { title: '商品比较', titleKey: 'route.compare' }
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue'),
          meta: { title: '消息通知', titleKey: 'route.notifications' }
        },
        {
          path: 'products/:id',
          name: 'product-detail',
          component: () => import('@/views/ProductDetailView.vue'),
          meta: { title: '商品详情', titleKey: 'route.productDetail' }
        },
        {
          path: 'shops/:id',
          name: 'shop-detail',
          component: () => import('@/views/ShopView.vue'),
          meta: { title: '店铺主页', titleKey: 'route.shopDetail' }
        },
        {
          path: 'favorites',
          name: 'favorites',
          component: () => import('@/views/FavoritesView.vue'),
          meta: { title: '我的收藏', titleKey: 'route.favorites', requiresAuth: true }
        },
        {
          path: 'user',
          name: 'user-center',
          component: () => import('@/views/UserCenterView.vue'),
          meta: { title: '用户中心', titleKey: 'route.userCenter', requiresAuth: true }
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/views/CartView.vue'),
          meta: { title: '购物车', titleKey: 'route.cart', requiresAuth: true }
        },
        {
          path: 'user/addresses',
          name: 'addresses',
          component: () => import('@/views/AddressManageView.vue'),
          meta: { title: '收货地址', titleKey: 'route.addresses', requiresAuth: true }
        },
        {
          path: 'user/orders',
          name: 'user-orders',
          component: () => import('@/views/UserOrdersView.vue'),
          meta: { title: '我的订单', titleKey: 'route.userOrders', requiresAuth: true }
        },
        {
          path: 'user/orders/:id',
          name: 'user-order-detail',
          component: () => import('@/views/UserOrderDetailView.vue'),
          meta: { title: '订单详情', titleKey: 'route.userOrderDetail', requiresAuth: true }
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/views/CheckoutView.vue'),
          meta: { title: '确认订单', titleKey: 'route.checkout', requiresAuth: true }
        },
        {
          path: 'order-success/:orderId',
          name: 'order-success',
          component: () => import('@/views/OrderSuccessView.vue'),
          meta: { title: '下单成功', titleKey: 'route.orderSuccess' }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', titleKey: 'route.login' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '注册', titleKey: 'route.register' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { title: '重置密码', titleKey: 'route.forgotPassword' }
    },
    adminRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面未找到', titleKey: 'route.notFound' }
    }
  ]
});

router.afterEach((to) => {
  const locale = localStorage.getItem('app_locale') || 'zh-CN';
  const titleKey = to.meta.titleKey as string | undefined;
  const baseTitle = 'Cross-region Mall';
  let pageTitle = baseTitle;
  if (titleKey) {
    const msg = appMessages[locale as keyof typeof appMessages]?.[titleKey];
    pageTitle = msg || (appMessages['zh-CN']?.[titleKey] as string) || (to.meta.title as string) || baseTitle;
  } else if (to.meta.title) {
    pageTitle = to.meta.title as string;
  }
  document.title = pageTitle === baseTitle ? pageTitle : `${pageTitle} · ${baseTitle}`;
});

router.beforeEach((to: RouteLocationNormalized) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLogin) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return '/products';
  }

  if (to.path === '/login' && userStore.isLogin && typeof to.query.redirect === 'undefined') {
    return userStore.isAdmin ? '/admin/dashboard' : '/products';
  }

  return true;
});

export default router;
