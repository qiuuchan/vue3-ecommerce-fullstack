import { http, HttpResponse } from 'msw';

/* ============================================================
   MSW Mock 数据与处理器 — 离线演示全功能可用
   ============================================================ */

// ---------- helpers ----------
const getLocale = (): string => {
  try { return localStorage.getItem('app_locale') || 'zh-CN'; }
  catch { return 'zh-CN'; }
};

const L = () => getLocale();
const isEn = () => L() === 'en-US';

const t = (zh: string, en: string) => (isEn() ? en : zh);

let nextId = 2000;
const uid = () => nextId++;

// ---------- 种子数据 ----------
const mockProducts = () => [
  { id: 1, name: t('云南沃柑', 'Yunnan Tangerine'), sku: 'F001', shopId: 1, shopName: t('鲜果时光', 'Fresh Time'), shopGoodReviewCount: 128, shopCreditLevel: 'excellent', categoryId: 1, categoryName: t('生鲜水果', 'Fresh Fruits'), price: 15.8, originalPrice: 22.0, stock: 500, sales: 2340, favoriteCount: 189, goodReviewCount: 156, ratingCount: 180, avgRating: 4.7, ratingHighCount: 5, ratingLowCount: 3, isPremiumProduct: true, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1546549036-b22e03f2eceb?auto=format&fit=crop&w=400&q=60', description: t('新鲜采摘，汁多味甜', 'Freshly picked, juicy and sweet') },
  { id: 2, name: t('川红心猕猴桃', 'Sichuan Red Kiwi'), sku: 'F002', shopId: 1, shopName: t('鲜果时光', 'Fresh Time'), shopGoodReviewCount: 128, shopCreditLevel: 'excellent', categoryId: 1, categoryName: t('生鲜水果', 'Fresh Fruits'), price: 28.0, originalPrice: 39.9, stock: 300, sales: 1580, favoriteCount: 120, goodReviewCount: 98, ratingCount: 110, avgRating: 4.5, ratingHighCount: 3, ratingLowCount: 2, isPremiumProduct: true, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=400&q=60', description: t('红心品种，维C丰富', 'Red heart variety, rich in vitamin C') },
  { id: 3, name: t('有机蓝莓', 'Organic Blueberry'), sku: 'F003', shopId: 2, shopName: t('优选好铺', 'Premium Store'), shopGoodReviewCount: 89, shopCreditLevel: 'good', categoryId: 1, categoryName: t('生鲜水果', 'Fresh Fruits'), price: 35.0, originalPrice: 45.0, stock: 150, sales: 890, favoriteCount: 67, goodReviewCount: 55, ratingCount: 62, avgRating: 4.8, ratingHighCount: 2, ratingLowCount: 1, isPremiumProduct: false, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=60', description: t('进口有机蓝莓，颗粒饱满', 'Imported organic blueberries, plump') },
  { id: 4, name: t('智利车厘子', 'Chilean Cherry'), sku: 'F004', shopId: 2, shopName: t('优选好铺', 'Premium Store'), shopGoodReviewCount: 89, shopCreditLevel: 'good', categoryId: 1, categoryName: t('生鲜水果', 'Fresh Fruits'), price: 58.0, originalPrice: 78.0, stock: 80, sales: 2340, favoriteCount: 210, goodReviewCount: 178, ratingCount: 195, avgRating: 4.6, ratingHighCount: 4, ratingLowCount: 2, isPremiumProduct: true, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=400&q=60', description: t('空运直达，新鲜饱满', 'Air-freighted, fresh and plump') },
  { id: 5, name: t('精品牛排', 'Premium Steak'), sku: 'M001', shopId: 3, shopName: t('御膳坊', 'Imperial Kitchen'), shopGoodReviewCount: 210, shopCreditLevel: 'excellent', categoryId: 2, categoryName: t('肉禽蛋奶', 'Meat & Dairy'), price: 88.0, originalPrice: 118.0, stock: 60, sales: 456, favoriteCount: 89, goodReviewCount: 67, ratingCount: 75, avgRating: 4.9, ratingHighCount: 1, ratingLowCount: 0, isPremiumProduct: true, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1603048297172-c83bc3f5f2b2?auto=format&fit=crop&w=400&q=60', description: t('澳洲谷饲，雪花纹理', 'Australian grain-fed, marbled texture') },
  { id: 6, name: t('有机鸡蛋', 'Organic Eggs'), sku: 'M002', shopId: 3, shopName: t('御膳坊', 'Imperial Kitchen'), shopGoodReviewCount: 210, shopCreditLevel: 'excellent', categoryId: 2, categoryName: t('肉禽蛋奶', 'Meat & Dairy'), price: 25.0, originalPrice: 32.0, stock: 200, sales: 1200, favoriteCount: 56, goodReviewCount: 45, ratingCount: 50, avgRating: 4.3, ratingHighCount: 2, ratingLowCount: 3, isPremiumProduct: false, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1509479100390-f6360986f5e1?auto=format&fit=crop&w=400&q=60', description: t('散养土鸡蛋，蛋黄饱满', 'Free-range eggs, rich yolk') },
  { id: 7, name: t('东北大米', 'Northeast Rice'), sku: 'G001', shopId: 4, shopName: t('粮油旗舰店', 'Grain Flagship'), shopGoodReviewCount: 56, shopCreditLevel: 'normal', categoryId: 3, categoryName: t('粮油调味', 'Grain & Seasoning'), price: 49.9, originalPrice: 65.0, stock: 1000, sales: 5600, favoriteCount: 320, goodReviewCount: 289, ratingCount: 310, avgRating: 4.4, ratingHighCount: 6, ratingLowCount: 4, isPremiumProduct: false, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=60', description: t('五常大米，粒粒香糯', 'Wuchang rice, fragrant and sticky') },
  { id: 8, name: t('橄榄油', 'Olive Oil'), sku: 'G002', shopId: 4, shopName: t('粮油旗舰店', 'Grain Flagship'), shopGoodReviewCount: 56, shopCreditLevel: 'normal', categoryId: 3, categoryName: t('粮油调味', 'Grain & Seasoning'), price: 68.0, originalPrice: 88.0, stock: 150, sales: 780, favoriteCount: 45, goodReviewCount: 32, ratingCount: 38, avgRating: 4.6, ratingHighCount: 1, ratingLowCount: 1, isPremiumProduct: false, isFavorite: false, canRate: false, status: 'on_sale' as const, cover: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=60', description: t('特级初榨，意大利进口', 'Extra virgin, imported from Italy') },
];

const mockReviews = () => [
  { id: 1, productId: 1, userId: 1, userName: 'user01', avatar: '', rating: 5, content: t('沃柑很新鲜，汁水很足，包装也很用心！', 'Very fresh tangerines, juicy and well-packaged!'), createdAt: '2026-04-15T08:30:00Z' },
  { id: 2, productId: 1, userId: 2, userName: 'user02', avatar: '', rating: 4, content: t('不错，甜度适中，个头均匀。', 'Not bad, moderate sweetness, uniform size.'), createdAt: '2026-04-18T14:20:00Z' },
  { id: 3, productId: 1, userId: 3, userName: 'admin', avatar: '', rating: 5, content: t('回购多次了，品质稳定。', 'Repeated purchases, consistent quality.'), createdAt: '2026-04-22T10:00:00Z' },
  { id: 4, productId: 4, userId: 1, userName: 'user01', avatar: '', rating: 5, content: t('车厘子个大味甜，空运就是新鲜！', 'Big and sweet cherries, fresh from air freight!'), createdAt: '2026-04-10T16:45:00Z' },
  { id: 5, productId: 4, userId: 2, userName: 'user02', avatar: '', rating: 3, content: t('有点贵了，品质一般。', 'A bit expensive, average quality.'), createdAt: '2026-04-12T09:15:00Z' },
  { id: 6, productId: 5, userId: 1, userName: 'user01', avatar: '', rating: 5, content: t('牛排品质非常好，煎出来很嫩！', 'Excellent steak quality, very tender after pan-searing!'), createdAt: '2026-04-20T19:00:00Z' },
];

// ---------- handlers ----------
export const handlers = [
  // ========== Products ==========
  http.get('/api/products', () => HttpResponse.json(mockProducts())),

  http.get('/api/products/:id', ({ params }) => {
    const p = mockProducts().find(x => x.id === Number(params.id));
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    // 为部分商品添加模拟多规格数据
    const withSku: any = { ...p };
    if (p.id === 1) {
      withSku.skuSpecs = [
        { name: t('颜色', 'Color'), values: [{ label: t('红色', 'Red'), value: 'red' }, { label: t('绿色', 'Green'), value: 'green' }, { label: t('黄色', 'Yellow'), value: 'yellow' }] },
        { name: t('规格', 'Size'), values: [{ label: t('小果 2斤', 'Small 1kg'), value: 'small' }, { label: t('中果 5斤', 'Medium 2.5kg'), value: 'medium' }, { label: t('大果 10斤', 'Large 5kg'), value: 'large' }] },
      ];
      const cKey = t('颜色', 'Color');
      const sKey = t('规格', 'Size');
      withSku.skuVariants = [
        { id: 'r-s', specValues: { [cKey]: 'red', [sKey]: 'small' }, price: 12.8, stock: 50, sku: 'F001-RS' },
        { id: 'r-m', specValues: { [cKey]: 'red', [sKey]: 'medium' }, price: 15.8, stock: 100, sku: 'F001-RM' },
        { id: 'r-l', specValues: { [cKey]: 'red', [sKey]: 'large' }, price: 22.0, stock: 30, sku: 'F001-RL' },
        { id: 'g-s', specValues: { [cKey]: 'green', [sKey]: 'small' }, price: 12.8, stock: 0, sku: 'F001-GS' },
        { id: 'g-m', specValues: { [cKey]: 'green', [sKey]: 'medium' }, price: 15.8, stock: 60, sku: 'F001-GM' },
        { id: 'y-l', specValues: { [cKey]: 'yellow', [sKey]: 'large' }, price: 22.0, stock: 20, sku: 'F001-YL' },
      ];
    } else if (p.id === 5) {
      withSku.skuSpecs = [
        { name: t('规格', 'Size'), values: [{ label: t('200g', '200g'), value: '200g' }, { label: t('300g', '300g'), value: '300g' }, { label: t('500g', '500g'), value: '500g' }] },
      ];
      const sKey2 = t('规格', 'Size');
      withSku.skuVariants = [
        { id: 's1', specValues: { [sKey2]: '200g' }, price: 48.0, stock: 30, sku: 'M001-S' },
        { id: 's2', specValues: { [sKey2]: '300g' }, price: 88.0, stock: 60, sku: 'M001-M' },
        { id: 's3', specValues: { [sKey2]: '500g' }, price: 138.0, stock: 20, sku: 'M001-L' },
      ];
    }
    return HttpResponse.json(withSku);
  }),

  http.get('/api/products/:id/reviews', ({ params }) => {
    const reviews = mockReviews().filter(r => r.productId === Number(params.id));
    return HttpResponse.json(reviews);
  }),

  http.post('/api/products/:id/reviews', async ({ params, request }) => {
    const body = await request.json() as { stars: number };
    const id = Number(params.id);
    const product = mockProducts().find(p => p.id === id);
    if (!product) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    // 更新评分统计
    product.ratingCount += 1;
    product.avgRating = (product.avgRating * (product.ratingCount - 1) + body.stars) / product.ratingCount;
    return HttpResponse.json(product);
  }),

  // ========== Auth ==========
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string; loginType?: string };
    const validUsers: Record<string, { password: string; role: string; id: number }> = {
      admin: { password: '123456', role: 'admin', id: 1 },
      operator: { password: '123456', role: 'operator', id: 2 },
      user01: { password: '123456', role: 'customer', id: 3 },
      user02: { password: '123456', role: 'customer', id: 4 },
    };
    const user = validUsers[body.username];
    if (!user || user.password !== body.password) {
      return HttpResponse.json({ message: t('用户名或密码错误', 'Invalid username or password') }, { status: 401 });
    }
    const loginType = body.loginType || 'customer';
    if (loginType === 'admin' && user.role === 'customer') {
      return HttpResponse.json({ message: t('该账号不是管理员', 'Not an admin account') }, { status: 403 });
    }
    if (loginType === 'customer' && user.role !== 'customer') {
      return HttpResponse.json({ message: t('该账号不是商城用户', 'Not a customer account') }, { status: 403 });
    }
    return HttpResponse.json({
      token: `mock-token-${body.username}-${Date.now()}`,
      user: { id: user.id, username: body.username, role: user.role, email: `${body.username}@example.com`, avatar: '' }
    });
  }),

  http.post('/api/auth/logout', () => HttpResponse.json({ message: 'ok' })),

  // ========== Cart ==========
  http.get('/api/cart', () => HttpResponse.json([])),

  http.post('/api/cart', async ({ request }) => {
    const body = await request.json() as { productId: number; count?: number };
    const product = mockProducts().find(p => p.id === body.productId);
    return HttpResponse.json({ id: uid(), productId: body.productId, count: body.count || 1, product, checked: true });
  }),

  http.put('/api/cart/:id', async ({ params, request }) => {
    const body = await request.json() as { count?: number; checked?: boolean };
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  http.delete('/api/cart/:id', () => HttpResponse.json({ message: 'ok' })),

  // ========== Shops ==========
  http.get('/api/shops', () => HttpResponse.json([
    { id: 1, name: t('鲜果时光', 'Fresh Time'), description: t('专注新鲜水果', 'Fresh fruits specialist'), logo: '', creditLevel: 'excellent', goodReviewCount: 128, productCount: 25 },
    { id: 2, name: t('优选好铺', 'Premium Store'), description: t('精选全球好物', 'Curated global goods'), logo: '', creditLevel: 'good', goodReviewCount: 89, productCount: 18 },
    { id: 3, name: t('御膳坊', 'Imperial Kitchen'), description: t('高端食材供应商', 'Premium ingredient supplier'), logo: '', creditLevel: 'excellent', goodReviewCount: 210, productCount: 30 },
    { id: 4, name: t('粮油旗舰店', 'Grain Flagship'), description: t('粮油调味一站购', 'One-stop grain & seasoning'), logo: '', creditLevel: 'normal', goodReviewCount: 56, productCount: 12 },
  ])),

  http.get('/api/shops/:id', ({ params }) => {
    const shops = [
      { id: 1, name: t('鲜果时光', 'Fresh Time'), description: t('专注新鲜水果', 'Fresh fruits specialist'), logo: '', creditLevel: 'excellent', goodReviewCount: 128, productCount: 25, products: mockProducts().filter(p => p.shopId === 1) },
      { id: 2, name: t('优选好铺', 'Premium Store'), description: t('精选全球好物', 'Curated global goods'), logo: '', creditLevel: 'good', goodReviewCount: 89, productCount: 18, products: mockProducts().filter(p => p.shopId === 2) },
      { id: 3, name: t('御膳坊', 'Imperial Kitchen'), description: t('高端食材供应商', 'Premium ingredient supplier'), logo: '', creditLevel: 'excellent', goodReviewCount: 210, productCount: 30, products: mockProducts().filter(p => p.shopId === 3) },
      { id: 4, name: t('粮油旗舰店', 'Grain Flagship'), description: t('粮油调味一站购', 'One-stop grain & seasoning'), logo: '', creditLevel: 'normal', goodReviewCount: 56, productCount: 12, products: mockProducts().filter(p => p.shopId === 4) },
    ];
    const shop = shops.find(s => s.id === Number(params.id));
    return shop ? HttpResponse.json(shop) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // ========== Categories ==========
  http.get('/api/categories', () => HttpResponse.json([
    { id: 1, name: t('生鲜水果', 'Fresh Fruits'), icon: '', productCount: 4 },
    { id: 2, name: t('肉禽蛋奶', 'Meat & Dairy'), icon: '', productCount: 2 },
    { id: 3, name: t('粮油调味', 'Grain & Seasoning'), icon: '', productCount: 2 },
  ])),

  // ========== User / Favorites ==========
  http.get('/api/user/favorites', () => HttpResponse.json([mockProducts()[0], mockProducts()[3]])),

  http.post('/api/user/favorites/:productId', ({ params }) => {
    const p = mockProducts().find(x => x.id === Number(params.productId));
    return p ? HttpResponse.json({ ...p, isFavorite: true }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/user/favorites/:productId', () => HttpResponse.json({ message: 'ok' })),

  // ========== Orders ==========
  http.get('/api/user/orders', () => HttpResponse.json([
    { id: 1001, orderNo: 'ORD20260501001', totalAmount: 103.8, status: 'completed', createdAt: '2026-05-01T10:30:00Z', items: [{ productId: 1, productName: t('云南沃柑', 'Yunnan Tangerine'), price: 15.8, count: 2, cover: mockProducts()[0].cover }] },
    { id: 1002, orderNo: 'ORD20260503002', totalAmount: 58.0, status: 'shipped', createdAt: '2026-05-03T14:20:00Z', items: [{ productId: 4, productName: t('智利车厘子', 'Chilean Cherry'), price: 58.0, count: 1, cover: mockProducts()[3].cover }] },
  ])),

  http.get('/api/user/orders/:id', ({ params }) => {
    const orders = [
      { id: 1001, orderNo: 'ORD20260501001', totalAmount: 103.8, status: 'completed', createdAt: '2026-05-01T10:30:00Z', address: { name: '张三', phone: '138****8888', address: t('北京市朝阳区xxx路100号', 'No.100, xxx Road, Chaoyang, Beijing') }, items: [{ productId: 1, productName: t('云南沃柑', 'Yunnan Tangerine'), price: 15.8, count: 2, cover: mockProducts()[0].cover }, { productId: 2, productName: t('川红心猕猴桃', 'Sichuan Red Kiwi'), price: 28.0, count: 1, cover: mockProducts()[1].cover }] },
      { id: 1002, orderNo: 'ORD20260503002', totalAmount: 58.0, status: 'shipped', createdAt: '2026-05-03T14:20:00Z', address: { name: '张三', phone: '138****8888', address: t('北京市朝阳区xxx路100号', 'No.100, xxx Road, Chaoyang, Beijing') }, items: [{ productId: 4, productName: t('智利车厘子', 'Chilean Cherry'), price: 58.0, count: 1, cover: mockProducts()[3].cover }] },
    ];
    const order = orders.find(o => o.id === Number(params.id));
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // ========== User Profile ==========
  http.get('/api/user/profile', () => HttpResponse.json({
    id: 3, username: 'user01', email: 'user01@example.com', avatar: '', phone: '138****8888', creditLevel: 'good'
  })),

  // ========== Addresses ==========
  http.get('/api/user/addresses', () => HttpResponse.json([
    { id: 1, name: t('张三', 'Zhang San'), phone: '138****8888', province: t('北京市', 'Beijing'), city: t('朝阳区', 'Chaoyang'), district: '', detail: t('xxx路100号', 'No.100, xxx Road'), isDefault: true },
  ])),

  // ========== Admin APIs (minimal) ==========
  http.get('/api/admin/dashboard/stats', () => HttpResponse.json({
    totalOrders: 2580, totalRevenue: 156800, totalUsers: 320, totalProducts: 45,
    recentOrders: [
      { id: 1001, orderNo: 'ORD20260501001', username: 'user01', totalAmount: 103.8, status: 'completed', createdAt: '2026-05-01T10:30:00Z' },
      { id: 1002, orderNo: 'ORD20260503002', username: 'user02', totalAmount: 58.0, status: 'shipped', createdAt: '2026-05-03T14:20:00Z' },
    ]
  })),

  http.get('/api/admin/products', () => HttpResponse.json(mockProducts())),

  http.get('/api/admin/orders', () => HttpResponse.json([
    { id: 1001, orderNo: 'ORD20260501001', username: 'user01', totalAmount: 103.8, status: 'completed', createdAt: '2026-05-01T10:30:00Z' },
    { id: 1002, orderNo: 'ORD20260503002', username: 'user02', totalAmount: 58.0, status: 'shipped', createdAt: '2026-05-03T14:20:00Z' },
  ])),

  // ========== Fallback: bypass unmatched ==========
  http.all('/api/*', ({ request }) => {
    console.warn(`[MSW] Unhandled: ${request.method} ${request.url}`);
    // Let through to real backend if available
    return HttpResponse.json({ message: 'MSW fallback: not mocked' }, { status: 501 });
  }),
];
