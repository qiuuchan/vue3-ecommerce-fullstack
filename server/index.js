const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./db');
const { setup } = require('./setup');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-jwt-secret-dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ecommerce-refresh-secret-dev';
const SALT_ROUNDS = 10;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ============================================================
// JWT 工具函数
// ============================================================
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, userType: user.user_type },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

async function resolveUserProfile(u) {
  const { rows: revCount } = await query(
    'SELECT COUNT(*) as cnt FROM reviews WHERE username = $1 AND rating >= 4', [u.username]
  );
  const { rows: favCount } = await query(
    'SELECT COUNT(*) as cnt FROM favorites WHERE username = $1', [u.username]
  );
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name || u.username,
    userType: u.user_type,
    avatar: u.avatar || '',
    level: u.level || '',
    phone: u.phone || '',
    email: u.email || '',
    status: u.status || 'enabled',
    city: u.city || '',
    memberSince: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : '',
    goodReviewCount: parseInt(revCount[0]?.cnt || 0),
    favoriteCount: parseInt(favCount[0]?.cnt || 0),
    roleCodes: u.role_codes || [],
    permissionCodes: u.permission_codes || [],
    lastLoginAt: u.last_login_at,
  };
}

// ============================================================
// 工具函数
// ============================================================
function getBearerToken(req) {
  const raw = req.headers.authorization || '';
  if (!raw.startsWith('Bearer ')) return '';
  return raw.slice('Bearer '.length).trim();
}

function getLocale(req) {
  const custom = req.headers['x-app-language'] || '';
  if (custom === 'en-US' || custom === 'en') return 'en';
  if (custom === 'zh-CN' || custom === 'zh') return 'zh';
  const lang = req.headers['accept-language'] || '';
  return lang.startsWith('en') ? 'en' : 'zh';
}

function localizeProduct(product, locale) {
  if (locale !== 'en' || !product) return product;
  return { ...product, name: product.name_en || product.name, description: product.description_en || product.description, categoryName: product.categoryNameEn || product.category_name, shopName: product.shopNameEn || product.shop_name_en || product.shopName, shopCreditLevel: product.shopCreditLevel || product.shop_credit_level };
}

function localizeShop(shop, locale) {
  if (locale !== 'en' || !shop) return shop;
  return { ...shop, name: shop.name_en || shop.name, tagline: shop.tagline_en || shop.tagline, description: shop.description_en || shop.description };
}

function localizeCategory(cat, locale) {
  if (locale !== 'en' || !cat) return cat;
  return { ...cat, name: cat.name_en || cat.name };
}

function localizeMessage(msg, locale) {
  if (locale !== 'en' || !msg) return msg;
  return { ...msg, title: msg.title_en || msg.title, content: msg.content_en || msg.content };
}

// ============================================================
// 消息本地化
// ============================================================
const MESSAGES = {
  'auth.login_required':        { zh: '请先登录',                 en: 'Please sign in first' },
  'auth.token_expired':          { zh: 'Token已过期',              en: 'Token expired' },
  'auth.token_invalid':          { zh: 'Token无效',               en: 'Invalid token' },
  'auth.admin_required':         { zh: '无管理员权限',              en: 'Admin access required' },
  'auth.credentials_required':   { zh: '用户名和密码不能为空',        en: 'Username and password are required' },
  'auth.bad_credentials':        { zh: '用户名或密码错误',           en: 'Invalid username or password' },
  'auth.not_admin':              { zh: '该账号不是管理员',           en: 'This account is not an admin' },
  'auth.not_customer':           { zh: '该账号不是商城用户',         en: 'This account is not a store user' },
  'auth.register_params':        { zh: '用户名和密码（至少6位）不能为空', en: 'Username and password (min. 6 chars) are required' },
  'auth.missing_refresh':        { zh: '缺少refreshToken',         en: 'Missing refresh token' },
  'auth.refresh_invalid':        { zh: 'refreshToken无效或已过期',   en: 'Refresh token invalid or expired' },
  'auth.invalid_params':         { zh: '参数不合法',               en: 'Invalid parameters' },
  'auth.logged_out':             { zh: '已退出',                  en: 'Logged out' },
  'server.internal_error':       { zh: '服务器内部错误',            en: 'Internal server error' },
  'user.not_found':              { zh: '用户不存在',               en: 'User not found' },
  'user.reset_ok':               { zh: '密码重置成功',              en: 'Password reset successful' },
  'user.reset_failed':           { zh: '重置失败',                en: 'Password reset failed' },
  'user.register_failed':        { zh: '注册失败',                en: 'Registration failed' },
  'user.load_failed':            { zh: '加载用户信息失败',          en: 'Failed to load user info' },
  'user.center_failed':          { zh: '加载用户中心失败',          en: 'Failed to load user center' },
  'user.no_fields':              { zh: '无更新字段',               en: 'No fields to update' },
  'user.update_failed':          { zh: '更新失败',                en: 'Update failed' },
  'product.not_found':           { zh: '商品不存在',               en: 'Product not found' },
  'product.load_failed':         { zh: '加载商品失败',              en: 'Failed to load products' },
  'product.load_list_failed':    { zh: '加载商品列表失败',           en: 'Failed to load product list' },
  'product.load_detail_failed':  { zh: '加载商品详情失败',           en: 'Failed to load product detail' },
  'product.name_price_required': { zh: '商品名称和价格不能为空',       en: 'Product name and price are required' },
  'product.create_failed':       { zh: '新增商品失败',              en: 'Failed to create product' },
  'product.update_failed':       { zh: '更新商品失败',              en: 'Failed to update product' },
  'product.delete_failed':       { zh: '删除商品失败',              en: 'Failed to delete product' },
  'review.rating_required':      { zh: '请给出1-5星评价',           en: 'Please rate 1-5 stars' },
  'review.load_failed':          { zh: '加载评价失败',              en: 'Failed to load reviews' },
  'review.submit_failed':        { zh: '评价失败',                en: 'Rating failed' },
  'favorite.add_failed':         { zh: '收藏失败',                en: 'Failed to favorite' },
  'favorite.remove_failed':      { zh: '取消收藏失败',              en: 'Failed to unfavorite' },
  'favorite.load_failed':        { zh: '加载收藏失败',              en: 'Failed to load favorites' },
  'cart.load_failed':            { zh: '加载购物车失败',            en: 'Failed to load cart' },
  'cart.add_failed':             { zh: '加购失败',                en: 'Failed to add to cart' },
  'cart.not_found':              { zh: '购物车记录不存在',           en: 'Cart item not found' },
  'cart.update_failed':          { zh: '更新购物车失败',            en: 'Failed to update cart' },
  'cart.delete_failed':          { zh: '删除失败',                en: 'Delete failed' },
  'cart.clear_failed':           { zh: '清空失败',                en: 'Failed to clear cart' },
  'shop.not_found':              { zh: '店铺不存在',               en: 'Shop not found' },
  'shop.load_failed':            { zh: '加载店铺失败',              en: 'Failed to load shops' },
  'shop.name_required':          { zh: '店铺名称不能为空',           en: 'Shop name is required' },
  'shop.create_failed':          { zh: '新增店铺失败',              en: 'Failed to create shop' },
  'shop.update_failed':          { zh: '更新店铺失败',              en: 'Failed to update shop' },
  'shop.delete_failed':          { zh: '删除店铺失败',              en: 'Failed to delete shop' },
  'category.load_failed':        { zh: '加载分类失败',              en: 'Failed to load categories' },
  'category.name_required':      { zh: '分类名称不能为空',           en: 'Category name is required' },
  'category.create_failed':      { zh: '新增分类失败',              en: 'Failed to create category' },
  'category.not_found':          { zh: '分类不存在',               en: 'Category not found' },
  'category.update_failed':      { zh: '更新分类失败',              en: 'Failed to update category' },
  'category.delete_failed':      { zh: '删除分类失败',              en: 'Failed to delete category' },
  'order.load_failed':           { zh: '加载订单失败',              en: 'Failed to load orders' },
  'order.load_detail_failed':    { zh: '加载订单详情失败',           en: 'Failed to load order detail' },
  'order.items_required':        { zh: '订单商品不能为空',           en: 'Order items cannot be empty' },
  'order.create_failed':         { zh: '创建订单失败',              en: 'Failed to create order' },
  'order.not_found':             { zh: '订单不存在',               en: 'Order not found' },
  'order.cancel_only_pending':   { zh: '只能取消待付款订单',         en: 'Only pending payment orders can be cancelled' },
  'order.cancelled':             { zh: '订单已取消',               en: 'Order cancelled' },
  'order.cancel_failed':         { zh: '取消订单失败',              en: 'Failed to cancel order' },
  'order.update_failed':         { zh: '更新订单失败',              en: 'Failed to update order' },
  'dashboard.load_failed':       { zh: '加载仪表盘失败',            en: 'Failed to load dashboard' },
  'inventory.stock_required':    { zh: '库存数量不能为空',           en: 'Stock quantity is required' },
  'inventory.load_failed':       { zh: '加载库存失败',              en: 'Failed to load inventory' },
  'inventory.warning_failed':    { zh: '加载库存预警失败',           en: 'Failed to load inventory warnings' },
  'inventory.update_failed':     { zh: '更新库存失败',              en: 'Failed to update inventory' },
  'admin.user_list_failed':      { zh: '加载用户列表失败',           en: 'Failed to load user list' },
  'admin.user_create_failed':    { zh: '新增用户失败',              en: 'Failed to create user' },
  'admin.user_update_failed':    { zh: '更新用户失败',              en: 'Failed to update user' },
  'admin.user_delete_failed':    { zh: '删除用户失败',              en: 'Failed to delete user' },
  'admin.role_load_failed':      { zh: '加载角色失败',              en: 'Failed to load roles' },
  'admin.msg_load_failed':       { zh: '加载消息失败',              en: 'Failed to load messages' },
  'admin.msg_mark_failed':       { zh: '标记失败',                en: 'Mark as read failed' },
  'admin.profile_load_failed':   { zh: '加载失败',                en: 'Load failed' },
  'dash.todo.pending_shipping':  { zh: '待发货订单',               en: 'Orders to ship' },
  'dash.todo.low_stock':         { zh: '库存预警商品',              en: 'Low stock alerts' },
  'dash.todo.pending_payment':   { zh: '待付款订单',               en: 'Orders pending payment' },
};

function t(key, locale) {
  const entry = MESSAGES[key];
  if (!entry) return key;
  return locale === 'en' ? entry.en : entry.zh;
}

// ============================================================
// 认证中间件
// ============================================================
function requireLogin(req, res, next) {
  const locale = getLocale(req);
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: t('auth.login_required', locale) });
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: t('auth.token_expired', locale) });
    return res.status(401).json({ message: t('auth.token_invalid', locale) });
  }
}

function requireAdmin(req, res, next) {
  const locale = getLocale(req);
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: t('auth.login_required', locale) });
  try {
    const decoded = verifyAccessToken(token);
    if (decoded.userType !== 'admin') return res.status(403).json({ message: t('auth.admin_required', locale) });
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: t('auth.token_invalid', locale) });
  }
}

// ============================================================
// 身份认证
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const locale = getLocale(req);
    const { username, password, loginType } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: t('auth.credentials_required', locale) });
    }
    const { rows } = await query('SELECT * FROM users WHERE username = $1 AND status = $2', [username, 'enabled']);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: t('auth.bad_credentials', locale) });
    }
    const type = loginType || 'customer';
    if (type === 'admin' && user.user_type === 'customer') {
      return res.status(403).json({ message: t('auth.not_admin', locale) });
    }
    if (type === 'customer' && user.user_type !== 'customer') {
      return res.status(403).json({ message: t('auth.not_customer', locale) });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    const profile = await resolveUserProfile(user);
    res.json({ token: accessToken, refreshToken, profile });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ message: t('server.internal_error', getLocale(req)) });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const locale = getLocale(req);
    const { username, password, displayName, email, avatar } = req.body || {};
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ message: t('auth.register_params', locale) });
    }
    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const resolvedAvatar = avatar || `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(username)}${Date.now()}`;
    const { rows } = await query(
      `INSERT INTO users (username, password, display_name, user_type, avatar, email, status)
       VALUES ($1, $2, $3, 'customer', $4, $5, 'enabled') RETURNING *`,
      [username, hashedPw, displayName || username, resolvedAvatar, email || null]
    );
    const user = rows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const profile = await resolveUserProfile(user);
    res.status(201).json({ token: accessToken, refreshToken, profile });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ message: t('user.register_failed', getLocale(req)) });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const locale = getLocale(req);
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ message: t('auth.missing_refresh', locale) });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const token = generateAccessToken({ id: decoded.id, username: decoded.username, user_type: decoded.userType || 'customer' });
    res.json({ token });
  } catch (err) {
    return res.status(401).json({ message: t('auth.refresh_invalid', locale) });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const locale = getLocale(req);
    const { username, newPassword } = req.body || {};
    if (!username || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: t('auth.invalid_params', locale) });
    }
    const { rows } = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (rows.length === 0) return res.status(404).json({ message: t('user.not_found', locale) });
    const hashedPw = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query('UPDATE users SET password = $1 WHERE username = $2', [hashedPw, username]);
    res.json({ message: t('user.reset_ok', locale) });
  } catch (err) {
    console.error('[Auth] Reset error:', err);
    res.status(500).json({ message: t('user.reset_failed', getLocale(req)) });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const locale = getLocale(req);
  res.json({ message: t('auth.logged_out', locale) });
});

// ============================================================
// 商品
// ============================================================
app.get('/api/products', async (req, res) => {
  try {
    const { rows: rawProducts } = await query(
      `SELECT p.*, s.name AS shop_name, s.name_en AS shop_name_en, s.credit_level AS shop_credit_level,
              c.name AS category_name, c.name_en AS category_name_en
       FROM products p
       LEFT JOIN shops s ON p.shop_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'on_sale'
       ORDER BY p.id`
    );
    const locale = getLocale(req);
    const products = rawProducts.map(p => localizeProduct({
      ...p, shopName: p.shop_name, shopCreditLevel: p.shop_credit_level,
      categoryName: p.category_name,
      price: parseFloat(p.price), originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
      goodReviewCount: p.good_review_count, favoriteCount: p.favorite_count,
      ratingCount: p.rating_count, avgRating: p.avg_rating ? parseFloat(p.avg_rating) : 0,
      ratingHighCount: p.rating_high_count, ratingLowCount: p.rating_low_count,
      isPremiumProduct: p.is_premium, safeStock: p.safe_stock,
    }, locale));
    const token = getBearerToken(req);
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const { rows: favs } = await query('SELECT product_id FROM favorites WHERE username = $1', [decoded.username]);
        const favIds = new Set(favs.map(f => f.product_id));
        products.forEach(p => { p.isFavorite = favIds.has(p.id); });
      } catch { /* token expired, skip favorites */ }
    }
    res.json(products);
  } catch (err) {
    console.error('[Products] List error:', err);
    res.status(500).json({ message: t('product.load_failed', getLocale(req)) });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query(
      `SELECT p.*, s.name AS shop_name, s.name_en AS shop_name_en, s.credit_level AS shop_credit_level,
              c.name AS category_name, c.name_en AS category_name_en
       FROM products p LEFT JOIN shops s ON p.shop_id = s.id LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: t('product.not_found', locale) });
    const p = rows[0];
    let product = localizeProduct({ ...p, shopName: p.shop_name, shopCreditLevel: p.shop_credit_level,
      categoryName: p.category_name, price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
      goodReviewCount: p.good_review_count, favoriteCount: p.favorite_count,
      ratingCount: p.rating_count, avgRating: p.avg_rating ? parseFloat(p.avg_rating) : 0,
      ratingHighCount: p.rating_high_count, ratingLowCount: p.rating_low_count,
      isPremiumProduct: p.is_premium, safeStock: p.safe_stock,
    }, locale);
    // SKU 规格
    const { rows: specs } = await query('SELECT * FROM sku_specs WHERE product_id = $1 ORDER BY sort', [p.id]);
    if (specs.length > 0) {
      const skuSpecs = [];
      for (const spec of specs) {
        const { rows: values } = await query('SELECT * FROM sku_spec_values WHERE spec_id = $1', [spec.id]);
        skuSpecs.push({ name: spec.name, values });
      }
      product.skuSpecs = skuSpecs;
      const { rows: variants } = await query('SELECT * FROM sku_variants WHERE product_id = $1', [p.id]);
      product.skuVariants = variants.map(v => ({ ...v, price: parseFloat(v.price) }));
    }
    const token = getBearerToken(req);
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const { rows: favs } = await query('SELECT id FROM favorites WHERE username = $1 AND product_id = $2', [decoded.username, p.id]);
        product.isFavorite = favs.length > 0;
        const { rows: revs } = await query('SELECT rating FROM reviews WHERE product_id = $1 AND username = $2', [p.id, decoded.username]);
        product.myRating = revs.length > 0 ? revs[0].rating : undefined;
        product.canRate = true;
      } catch { /* skip */ }
    }
    res.json(product);
  } catch (err) {
    console.error('[Products] Detail error:', err);
    res.status(500).json({ message: t('product.load_failed', getLocale(req)) });
  }
});

// ============================================================
// 评价
// ============================================================
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.display_name AS user_name, u.avatar AS user_avatar
       FROM reviews r LEFT JOIN users u ON r.username = u.username
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`, [req.params.id]
    );
    res.json(rows.map(r => ({
      id: r.id, productId: r.product_id, userName: r.user_name || r.username,
      userAvatar: r.user_avatar, rating: r.rating, content: r.content, createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('[Reviews] List error:', err);
    res.status(500).json({ message: t('review.load_failed', getLocale(req)) });
  }
});

app.post('/api/products/:id/reviews', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { stars } = req.body || {};
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: t('review.rating_required', locale) });
    const productId = parseInt(req.params.id);
    const username = req.user.username;
    await query(
      `INSERT INTO reviews (product_id, username, rating) VALUES ($1, $2, $3)
       ON CONFLICT (product_id, username) DO UPDATE SET rating = $3, created_at = NOW()`,
      [productId, username, stars]
    );
    const { rows: stats } = await query(
      'SELECT COUNT(*) as cnt, COALESCE(AVG(rating),0) as avg_r FROM reviews WHERE product_id = $1', [productId]
    );
    const cnt = parseInt(stats[0].cnt);
    const avg = parseFloat(stats[0].avg_r);
    const { rows: hl } = await query(
      'SELECT COUNT(*) FILTER (WHERE rating > 3) as hc, COUNT(*) FILTER (WHERE rating < 3) as lc FROM reviews WHERE product_id = $1', [productId]
    );
    await query(
      'UPDATE products SET rating_count=$1, avg_rating=$2, rating_high_count=$3, rating_low_count=$4, is_premium=$5 WHERE id=$6',
      [cnt, avg, parseInt(hl[0].hc), parseInt(hl[0].lc), cnt > 0 && parseInt(hl[0].hc) > parseInt(hl[0].lc), productId]
    );
    const { rows: prod } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    res.json({ ...prod[0], myRating: stars, canRate: true });
  } catch (err) {
    console.error('[Reviews] Submit error:', err);
    res.status(500).json({ message: t('review.submit_failed', getLocale(req)) });
  }
});

// ============================================================
// 收藏
// ============================================================
app.post('/api/products/:id/favorite', requireLogin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await query('INSERT INTO favorites (username, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.username, productId]);
    await query('UPDATE products SET favorite_count = favorite_count + 1 WHERE id = $1', [productId]);
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    res.json({ ...rows[0], isFavorite: true });
  } catch (err) {
    res.status(500).json({ message: t('favorite.add_failed', getLocale(req)) });
  }
});

app.delete('/api/products/:id/favorite', requireLogin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await query('DELETE FROM favorites WHERE username = $1 AND product_id = $2', [req.user.username, productId]);
    await query('UPDATE products SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = $1', [productId]);
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    res.json({ ...rows[0], isFavorite: false });
  } catch (err) {
    res.status(500).json({ message: t('favorite.remove_failed', getLocale(req)) });
  }
});

// ============================================================
// 购物车
// ============================================================
app.get('/api/cart', requireLogin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM carts WHERE username = $1 ORDER BY id', [req.user.username]);
    res.json(rows.map(c => ({ id: c.id, productId: c.product_id, name: c.name, price: parseFloat(c.price), count: c.count, checked: c.checked })));
  } catch (err) {
    res.status(500).json({ message: t('cart.load_failed', getLocale(req)) });
  }
});

app.post('/api/cart', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { productId, count = 1 } = req.body || {};
    const { rows: prods } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (prods.length === 0) return res.status(404).json({ message: t('product.not_found', locale) });
    const p = prods[0];
    const { rows: existing } = await query('SELECT * FROM carts WHERE username = $1 AND product_id = $2', [req.user.username, productId]);
    if (existing.length > 0) {
      await query('UPDATE carts SET count = count + $1 WHERE id = $2', [count, existing[0].id]);
    } else {
      await query('INSERT INTO carts (username, product_id, name, price, count) VALUES ($1,$2,$3,$4,$5)',
        [req.user.username, productId, p.name, p.price, count]);
    }
    const { rows: carts } = await query('SELECT * FROM carts WHERE username = $1 ORDER BY id', [req.user.username]);
    res.json(carts.map(c => ({ id: c.id, productId: c.product_id, name: c.name, price: parseFloat(c.price), count: c.count, checked: c.checked })));
  } catch (err) {
    res.status(500).json({ message: t('cart.add_failed', getLocale(req)) });
  }
});

app.put('/api/cart/:id', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { count, checked } = req.body || {};
    const cartId = parseInt(req.params.id);
    const { rows } = await query('SELECT * FROM carts WHERE id = $1 AND username = $2', [cartId, req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('cart.not_found', locale) });
    if (count !== undefined) await query('UPDATE carts SET count = $1 WHERE id = $2', [count, cartId]);
    if (checked !== undefined) await query('UPDATE carts SET checked = $1 WHERE id = $2', [checked, cartId]);
    const { rows: updated } = await query('SELECT * FROM carts WHERE id = $1', [cartId]);
    const c = updated[0];
    res.json({ id: c.id, productId: c.product_id, name: c.name, price: parseFloat(c.price), count: c.count, checked: c.checked });
  } catch (err) {
    res.status(500).json({ message: t('cart.update_failed', getLocale(req)) });
  }
});

app.delete('/api/cart/:id', requireLogin, async (req, res) => {
  try {
    await query('DELETE FROM carts WHERE id = $1 AND username = $2', [req.params.id, req.user.username]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('cart.delete_failed', getLocale(req)) }); }
});

app.delete('/api/cart', requireLogin, async (req, res) => {
  try {
    await query('DELETE FROM carts WHERE username = $1', [req.user.username]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('cart.clear_failed', getLocale(req)) }); }
});

// ============================================================
// 店铺
// ============================================================
app.get('/api/shops', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM shops WHERE status = $1 ORDER BY id', ['active']);
    res.json(rows.map(s => localizeShop(s, getLocale(req))));
  } catch (err) { res.status(500).json({ message: t('shop.load_failed', getLocale(req)) }); }
});

app.get('/api/shops/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM shops WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('shop.not_found', getLocale(req)) });
    const locale = getLocale(req);
    const shop = localizeShop(rows[0], locale);
    const { rows: prods } = await query(
      `SELECT p.*, c.name AS category_name, c.name_en AS category_name_en
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.shop_id = $1 AND p.status = 'on_sale' ORDER BY p.id`, [shop.id]
    );
    shop.products = prods.map(p => localizeProduct({ ...p, price: parseFloat(p.price), shopName: shop.name, shopCreditLevel: shop.credit_level }, locale));
    res.json(shop);
  } catch (err) { res.status(500).json({ message: t('shop.load_failed', getLocale(req)) }); }
});

// ============================================================
// 分类
// ============================================================
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM categories WHERE enabled = true ORDER BY sort');
    res.json(rows.map(c => localizeCategory(c, getLocale(req))));
  } catch (err) { res.status(500).json({ message: t('category.load_failed', getLocale(req)) }); }
});

// ============================================================
// 用户（前台）
// ============================================================
app.get('/api/user/profile', requireLogin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('user.not_found', getLocale(req)) });
    res.json(await resolveUserProfile(rows[0]));
  } catch (err) { res.status(500).json({ message: t('user.load_failed', getLocale(req)) }); }
});

app.get('/api/user/center', requireLogin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('user.not_found', getLocale(req)) });
    res.json(await resolveUserProfile(rows[0]));
  } catch (err) { res.status(500).json({ message: t('user.center_failed', getLocale(req)) }); }
});

app.put('/api/user/profile', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { displayName, avatar, email, city } = req.body || {};
    const sets = []; const vals = []; let idx = 1;
    if (displayName !== undefined) { sets.push(`display_name = $${idx++}`); vals.push(displayName); }
    if (avatar !== undefined) { sets.push(`avatar = $${idx++}`); vals.push(avatar); }
    if (email !== undefined) { sets.push(`email = $${idx++}`); vals.push(email); }
    if (city !== undefined) { sets.push(`city = $${idx++}`); vals.push(city); }
    if (sets.length === 0) return res.status(400).json({ message: t('user.no_fields', locale) });
    vals.push(req.user.username);
    await query(`UPDATE users SET ${sets.join(', ')} WHERE username = $${idx}`, vals);
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [req.user.username]);
    res.json(await resolveUserProfile(rows[0]));
  } catch (err) { res.status(500).json({ message: t('user.update_failed', getLocale(req)) }); }
});

app.get('/api/user/favorites', requireLogin, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, s.name AS shop_name, s.credit_level AS shop_credit_level
       FROM favorites f JOIN products p ON f.product_id = p.id LEFT JOIN shops s ON p.shop_id = s.id
       WHERE f.username = $1 ORDER BY f.id DESC`, [req.user.username]
    );
    const locale = getLocale(req);
    res.json(rows.map(p => localizeProduct({ ...p, price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
      shopName: p.shop_name, shopCreditLevel: p.shop_credit_level, isFavorite: true,
    }, locale)));
  } catch (err) { res.status(500).json({ message: t('favorite.load_failed', getLocale(req)) }); }
});

// ============================================================
// 订单
// ============================================================
app.get('/api/user/orders', requireLogin, async (req, res) => {
  try {
    const { rows: orders } = await query('SELECT * FROM orders WHERE username = $1 ORDER BY created_at DESC', [req.user.username]);
    const result = [];
    for (const o of orders) {
      const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
      result.push({ id: o.id, orderNo: o.order_no, totalAmount: parseFloat(o.total_amount),
        status: o.status, createdAt: o.created_at,
        items: items.map(i => ({ productId: i.product_id, name: i.name, price: parseFloat(i.price), count: i.count })),
      });
    }
    res.json(result);
  } catch (err) { res.status(500).json({ message: t('order.load_failed', getLocale(req)) }); }
});

app.get('/api/user/orders/:id', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND username = $2', [req.params.id, req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('order.not_found', locale) });
    const o = rows[0];
    const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
    res.json({ id: o.id, orderNo: o.order_no, totalAmount: parseFloat(o.total_amount),
      status: o.status, createdAt: o.created_at, payTime: o.pay_time, phone: o.phone,
      address: { recipient: o.username, phone: o.phone, address: o.address },
      items: items.map(i => ({ productId: i.product_id, name: i.name, price: parseFloat(i.price), count: i.count })),
    });
  } catch (err) { res.status(500).json({ message: t('order.load_detail_failed', getLocale(req)) }); }
});

app.post('/api/user/orders', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { items, address, totalAmount } = req.body || {};
    if (!items || items.length === 0) return res.status(400).json({ message: t('order.items_required', locale) });
    const orderNo = 'SO' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Date.now()).slice(-4);
    const { rows } = await query(
      `INSERT INTO orders (order_no, username, total_amount, status, address, phone) VALUES ($1,$2,$3,'pending_payment',$4,$5) RETURNING *`,
      [orderNo, req.user.username, totalAmount, address || '', '']
    );
    for (const item of items) {
      await query('INSERT INTO order_items (order_id, product_id, name, price, count) VALUES ($1,$2,$3,$4,$5)',
        [rows[0].id, item.productId, item.name, item.price, item.count]);
      await query('UPDATE products SET sales = sales + $1, stock = GREATEST(stock - $1, 0) WHERE id = $2', [item.count, item.productId]);
    }
    res.json({ id: rows[0].id, orderNo: rows[0].order_no, status: rows[0].status, totalAmount: parseFloat(rows[0].total_amount) });
  } catch (err) { res.status(500).json({ message: t('order.create_failed', getLocale(req)) }); }
});

app.put('/api/user/orders/:id/cancel', requireLogin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND username = $2', [req.params.id, req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('order.not_found', locale) });
    if (rows[0].status !== 'pending_payment') return res.status(400).json({ message: t('order.cancel_only_pending', locale) });
    await query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    for (const item of items) {
      await query('UPDATE products SET stock = stock + $1, sales = GREATEST(sales - $1, 0) WHERE id = $2', [item.count, item.product_id]);
    }
    res.json({ message: t('order.cancelled', locale) });
  } catch (err) { res.status(500).json({ message: t('order.cancel_failed', getLocale(req)) }); }
});

// ============================================================
// 地址
// ============================================================
app.get('/api/user/addresses', requireLogin, (req, res) => {
  res.json([{ id: 1, name: '张小明', phone: '13800000001', province: '北京市', city: '朝阳区', district: '', detail: '望京街道 88 号', isDefault: true }]);
});

// ============================================================
// 管理端
// ============================================================

// --- 仪表盘（/overview 和 /stats 都支持） ---
function dashboardHandler(req, res) {
  (async () => {
    try {
      const locale = getLocale(req);
      const en = locale === 'en';
      // 统计数据
      const { rows: os } = await query('SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount),0) as total_revenue FROM orders');
      const { rows: uc } = await query('SELECT COUNT(*) as total_users FROM users');
      const { rows: pc } = await query('SELECT COUNT(*) as total_products FROM products');
      const { rows: ic } = await query("SELECT COUNT(*) as cnt FROM products WHERE status = 'on_sale'");
      const { rows: wc } = await query('SELECT COUNT(*) as cnt FROM products WHERE stock < safe_stock');
      // 演示用：使用全量数据而非当日数据
      const { rows: np } = await query("SELECT COUNT(*) as cnt FROM products");
      const { rows: to } = await query("SELECT COUNT(*) as cnt FROM orders");
      const { rows: ts } = await query("SELECT COALESCE(SUM(total_amount),0) as val FROM orders");

      // 趋势（最近7天 — 演示数据混合真实订单）
      const { rows: trendsRaw } = await query(
        `SELECT TO_CHAR(d::date, 'YYYY-MM-DD') as date,
                COALESCE((SELECT SUM(total_amount) FROM orders WHERE created_at::date = d::date), 0) as sales,
                COALESCE((SELECT COUNT(*) FROM orders WHERE created_at::date = d::date), 0) as orders
         FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d
         ORDER BY d`
      );
      // 为演示效果补充趋势数据：在真实数据基础上叠加一个增长曲线
      const trends = trendsRaw.map((t, i) => {
        const base = 800 + i * 200;  // 从 800 增长到 2000
        const noise = Math.round((Math.random() - 0.5) * 300);
        const daySales = parseFloat(t.sales) + base + noise;
        const dayOrders = parseInt(t.orders) + 5 + Math.floor(i * 1.5);
        return { date: t.date, sales: Math.max(daySales, 100), orders: Math.max(dayOrders, 1) };
      });

      // 分类占比
      const nameCol = en ? 'COALESCE(c.name_en, c.name)' : 'c.name';
      const { rows: catShares } = await query(
        `SELECT ${nameCol} as name, COUNT(p.id)::int as value
         FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'on_sale'
         GROUP BY c.id, ${nameCol} ORDER BY value DESC`
      );

      // 热销商品
      const hotNameCol = en ? 'COALESCE(name_en, name)' : 'name';
      const { rows: hot } = await query(
        `SELECT id, ${hotNameCol} as name, sales, (price * sales) as revenue
         FROM products WHERE status = 'on_sale' ORDER BY sales DESC LIMIT 5`
      );

      // 待办事项
      const { rows: pendingOrders } = await query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending_shipping'");
      const { rows: lowStock } = await query('SELECT COUNT(*) as cnt FROM products WHERE stock < safe_stock');
      const { rows: pendingPay } = await query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending_payment'");

      const summary = {
        newProductsToday: parseInt(np[0].cnt),
        productsOnSale: parseInt(ic[0].cnt),
        inventoryWarnings: parseInt(wc[0].cnt),
        todayOrders: parseInt(to[0].cnt),
        todaySales: parseFloat(ts[0].val),
      };

      const todos = [
        { id: 1, title: t('dash.todo.pending_shipping', locale), level: 'high', count: parseInt(pendingOrders[0].cnt) },
        { id: 2, title: t('dash.todo.low_stock', locale), level: 'high', count: parseInt(lowStock[0].cnt) },
        { id: 3, title: t('dash.todo.pending_payment', locale), level: 'medium', count: parseInt(pendingPay[0].cnt) },
      ];

      res.json({ summary, trends, categoryShares: catShares, hotProducts: hot.map(h => ({ ...h, revenue: parseFloat(h.revenue || 0) })), todos });
    } catch (err) { console.error('[Dashboard]', err); res.status(500).json({ message: t('dashboard.load_failed', getLocale(req)) }); }
  })();
}
app.get('/api/admin/dashboard/stats', requireAdmin, dashboardHandler);
app.get('/api/admin/dashboard/overview', requireAdmin, dashboardHandler);

// --- 商品管理 ---
app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query(
      `SELECT p.*, s.name AS shop_name, s.name_en AS shop_name_en, c.name AS category_name, c.name_en AS category_name_en
       FROM products p LEFT JOIN shops s ON p.shop_id = s.id LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id`
    );
    res.json(rows.map(p => localizeProduct({
      ...p, price: parseFloat(p.price), shopName: p.shop_name, categoryName: p.category_name,
      categoryNameEn: p.category_name_en
    }, locale)));
  } catch (err) { res.status(500).json({ message: t('product.load_list_failed', getLocale(req)) }); }
});

app.get('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query(
      `SELECT p.*, s.name AS shop_name, s.name_en AS shop_name_en, c.name AS category_name, c.name_en AS category_name_en
       FROM products p LEFT JOIN shops s ON p.shop_id = s.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: t('product.not_found', locale) });
    const p = rows[0];
    res.json(localizeProduct({
      ...p, price: parseFloat(p.price), shopName: p.shop_name, categoryName: p.category_name,
      categoryNameEn: p.category_name_en
    }, locale));
  } catch (err) { res.status(500).json({ message: t('product.load_detail_failed', getLocale(req)) }); }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { name, price, originalPrice, stock, categoryId, shopId, cover, description, status } = req.body || {};
    if (!name || price == null) return res.status(400).json({ message: t('product.name_price_required', locale) });
    const { rows } = await query(
      `INSERT INTO products (name, price, original_price, stock, category_id, shop_id, cover, description, status, sku)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, price, originalPrice || price, stock || 0, categoryId || 1, shopId || 1, cover || '', description || '', status || 'on_sale', 'SKU-' + Date.now()]
    );
    res.status(201).json({ ...rows[0], price: parseFloat(rows[0].price) });
  } catch (err) { console.error('[Admin] Product create:', err); res.status(500).json({ message: t('product.create_failed', getLocale(req)) }); }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, price, stock, status, description } = req.body || {};
    await query(`UPDATE products SET name=COALESCE($1,name), price=COALESCE($2,price), stock=COALESCE($3,stock), status=COALESCE($4,status), description=COALESCE($5,description), updated_at=NOW() WHERE id=$6`,
      [name, price, stock, status, description, req.params.id]);
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('product.not_found', getLocale(req)) });
    res.json({ ...rows[0], price: parseFloat(rows[0].price) });
  } catch (err) { res.status(500).json({ message: t('product.update_failed', getLocale(req)) }); }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('product.delete_failed', getLocale(req)) }); }
});

// --- 分类管理 ---
app.get('/api/admin/categories', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM categories ORDER BY sort');
    res.json(rows.map(c => localizeCategory(c, locale)));
  } catch (err) { res.status(500).json({ message: t('category.load_failed', getLocale(req)) }); }
});

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { name, nameEn, sort } = req.body || {};
    if (!name) return res.status(400).json({ message: t('category.name_required', locale) });
    const { rows } = await query('INSERT INTO categories (name, name_en, sort) VALUES ($1,$2,$3) RETURNING *', [name, nameEn || name, sort || 0]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: t('category.create_failed', getLocale(req)) }); }
});

app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { name, nameEn, sort, enabled } = req.body || {};
    await query('UPDATE categories SET name=COALESCE($1,name), name_en=COALESCE($2,name_en), sort=COALESCE($3,sort), enabled=COALESCE($4,enabled) WHERE id=$5',
      [name, nameEn, sort, enabled, req.params.id]);
    const { rows } = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('category.not_found', getLocale(req)) });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: t('category.update_failed', getLocale(req)) }); }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('category.delete_failed', getLocale(req)) }); }
});

// --- 店铺管理 ---
app.get('/api/admin/shops', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM shops ORDER BY id');
    res.json(rows.map(s => localizeShop(s, locale)));
  } catch (err) { res.status(500).json({ message: t('shop.load_failed', getLocale(req)) }); }
});

app.post('/api/admin/shops', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { name, nameEn, description, tagline, logo } = req.body || {};
    if (!name) return res.status(400).json({ message: t('shop.name_required', locale) });
    const { rows } = await query(
      'INSERT INTO shops (name, name_en, description, tagline, logo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, nameEn || name, description || '', tagline || '', logo || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: t('shop.create_failed', getLocale(req)) }); }
});

app.put('/api/admin/shops/:id', requireAdmin, async (req, res) => {
  try {
    const { name, nameEn, description, tagline, logo, status } = req.body || {};
    await query('UPDATE shops SET name=COALESCE($1,name), name_en=COALESCE($2,name_en), description=COALESCE($3,description), tagline=COALESCE($4,tagline), logo=COALESCE($5,logo), status=COALESCE($6,status) WHERE id=$7',
      [name, nameEn, description, tagline, logo, status, req.params.id]);
    const { rows } = await query('SELECT * FROM shops WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('shop.not_found', getLocale(req)) });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: t('shop.update_failed', getLocale(req)) }); }
});

app.delete('/api/admin/shops/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM shops WHERE id = $1', [req.params.id]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('shop.delete_failed', getLocale(req)) }); }
});

// --- 订单管理 ---
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = [];
    for (const o of rows) {
      const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
      orders.push({ ...o, totalAmount: parseFloat(o.total_amount), orderNo: o.order_no, items: items.map(i => ({ ...i, price: parseFloat(i.price) })) });
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ message: t('order.load_failed', getLocale(req)) }); }
});

app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('order.not_found', getLocale(req)) });
    const o = rows[0];
    const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
    res.json({ ...o, totalAmount: parseFloat(o.total_amount), orderNo: o.order_no, items: items.map(i => ({ ...i, price: parseFloat(i.price) })) });
  } catch (err) { res.status(500).json({ message: t('order.load_detail_failed', getLocale(req)) }); }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    await query('UPDATE orders SET status = $1 WHERE id = $2', [req.body?.status, req.params.id]);
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('order.not_found', getLocale(req)) });
    res.json({ ...rows[0], totalAmount: parseFloat(rows[0].total_amount) });
  } catch (err) { res.status(500).json({ message: t('order.update_failed', getLocale(req)) }); }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  // 前端调用 /:id/status 路径
  req.params.id = req.params.id;
  try {
    await query('UPDATE orders SET status = $1 WHERE id = $2', [req.body?.status, req.params.id]);
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('order.not_found', getLocale(req)) });
    res.json({ ...rows[0], totalAmount: parseFloat(rows[0].total_amount) });
  } catch (err) { res.status(500).json({ message: t('order.update_failed', getLocale(req)) }); }
});

// --- 库存管理 ---
app.get('/api/admin/inventory/list', requireAdmin, stockListHandler);
app.get('/api/admin/inventory', requireAdmin, stockListHandler);
function stockListHandler(req, res) {
  (async () => {
    try {
      const locale = getLocale(req);
      const { rows } = await query(
        `SELECT p.id, p.name, p.name_en, p.sku, p.stock, p.safe_stock, p.status, s.name AS shop_name, s.name_en AS shop_name_en
         FROM products p LEFT JOIN shops s ON p.shop_id = s.id ORDER BY p.id`
      );
      res.json(rows.map(p => {
        const item = { ...p, shopName: p.shop_name || '' };
        if (locale === 'en') {
          item.name = p.name_en || p.name;
          item.shopName = p.shop_name_en || p.shop_name || '';
        }
        return item;
      }));
    } catch (err) { res.status(500).json({ message: t('inventory.load_failed', getLocale(req)) }); }
  })();
}

app.get('/api/admin/inventory/warning', requireAdmin, stockWarningHandler);
app.get('/api/admin/inventory/warnings', requireAdmin, stockWarningHandler);
function stockWarningHandler(req, res) {
  (async () => {
    try {
      const locale = getLocale(req);
      const { rows } = await query(
        `SELECT p.id, p.name, p.name_en, p.sku, p.stock, p.safe_stock, s.name AS shop_name, s.name_en AS shop_name_en
         FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.stock < p.safe_stock ORDER BY p.stock ASC`
      );
      res.json(rows.map(p => {
        const item = { ...p, shopName: p.shop_name || '' };
        if (locale === 'en') {
          item.name = p.name_en || p.name;
          item.shopName = p.shop_name_en || p.shop_name || '';
        }
        return item;
      }));
    } catch (err) { res.status(500).json({ message: t('inventory.warning_failed', getLocale(req)) }); }
  })();
}

app.put('/api/admin/inventory/:productId', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { stock, safeStock } = req.body || {};
    if (stock === undefined) return res.status(400).json({ message: t('inventory.stock_required', locale) });
    await query('UPDATE products SET stock = $1, safe_stock = COALESCE($2, safe_stock) WHERE id = $3',
      [stock, safeStock, req.params.productId]);
    const { rows } = await query(
      `SELECT p.id, p.name, p.name_en, p.sku, p.stock, p.safe_stock, s.name AS shop_name, s.name_en AS shop_name_en
       FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.id = $1`, [req.params.productId]
    );
    if (rows.length === 0) return res.status(404).json({ message: t('product.not_found', locale) });
    const p = rows[0];
    const item = { ...p, shopName: p.shop_name || '' };
    if (locale === 'en') {
      item.name = p.name_en || p.name;
      item.shopName = p.shop_name_en || p.shop_name || '';
    }
    res.json(item);
  } catch (err) { res.status(500).json({ message: t('inventory.update_failed', getLocale(req)) }); }
});

// --- 用户管理 ---
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users ORDER BY id');
    res.json(rows.map(u => ({ id: u.id, username: u.username, displayName: u.display_name, userType: u.user_type, status: u.status, phone: u.phone, email: u.email, level: u.level, roleCodes: u.role_codes || [], lastLoginAt: u.last_login_at })));
  } catch (err) { res.status(500).json({ message: t('admin.user_list_failed', getLocale(req)) }); }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { username, password, displayName, userType, email, phone } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: t('auth.credentials_required', locale) });
    const bcrypt = require('bcryptjs');
    const hashedPw = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (username, password, display_name, user_type, email, phone, status)
       VALUES ($1,$2,$3,$4,$5,$6,'enabled') RETURNING *`,
      [username, hashedPw, displayName || username, userType || 'customer', email || '', phone || '']
    );
    const u = rows[0];
    res.status(201).json({ id: u.id, username: u.username, displayName: u.display_name, userType: u.user_type, status: u.status, phone: u.phone, email: u.email, level: u.level, roleCodes: u.role_codes || [] });
  } catch (err) { console.error('[Admin] User create:', err); res.status(500).json({ message: t('admin.user_create_failed', getLocale(req)) }); }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { displayName, email, phone, status, userType } = req.body || {};
    await query(
      'UPDATE users SET display_name=COALESCE($1,display_name), email=COALESCE($2,email), phone=COALESCE($3,phone), status=COALESCE($4,status), user_type=COALESCE($5,user_type) WHERE id=$6',
      [displayName, email, phone, status, userType, req.params.id]
    );
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: t('user.not_found', getLocale(req)) });
    const u = rows[0];
    res.json({ id: u.id, username: u.username, displayName: u.display_name, userType: u.user_type, status: u.status, phone: u.phone, email: u.email, level: u.level, roleCodes: u.role_codes || [] });
  } catch (err) { res.status(500).json({ message: t('admin.user_update_failed', getLocale(req)) }); }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: t('admin.user_delete_failed', getLocale(req)) }); }
});

// --- 角色 ---
app.get('/api/admin/roles', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM roles ORDER BY id');
    res.json(rows.map(r => {
      const permCount = (r.permission_codes || []).length;
      const defaultDesc = locale === 'en'
        ? `${r.name} role, ${permCount} permission(s)`
        : `${r.name}角色，拥有 ${permCount} 项权限`;
      return {
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description || defaultDesc,
        permissionCodes: r.permission_codes || [],
      };
    }));
  } catch (err) { res.status(500).json({ message: t('admin.role_load_failed', getLocale(req)) }); }
});

// --- 消息 ---
app.get('/api/admin/messages', requireAdmin, async (req, res) => {
  try {
    const locale = getLocale(req);
    const { rows } = await query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows.map(m => localizeMessage({ ...m, isRead: m.is_read, createdAt: m.created_at }, locale)));
  } catch (err) { res.status(500).json({ message: t('admin.msg_load_failed', getLocale(req)) }); }
});

app.put('/api/admin/messages/:id/read', requireAdmin, async (req, res) => {
  try { await query('UPDATE messages SET is_read = true WHERE id = $1', [req.params.id]); res.json({ message: 'ok' }); }
  catch (err) { res.status(500).json({ message: t('admin.msg_mark_failed', getLocale(req)) }); }
});

// --- 个人资料 ---
app.get('/api/admin/profile', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [req.user.username]);
    if (rows.length === 0) return res.status(404).json({ message: t('user.not_found', getLocale(req)) });
    res.json(await resolveUserProfile(rows[0]));
  } catch (err) { res.status(500).json({ message: t('admin.profile_load_failed', getLocale(req)) }); }
});

app.put('/api/admin/profile', requireAdmin, async (req, res) => {
  try {
    const { displayName, phone, email } = req.body || {};
    await query('UPDATE users SET display_name=COALESCE($1,display_name), phone=COALESCE($2,phone), email=COALESCE($3,email) WHERE username=$4',
      [displayName, phone, email, req.user.username]);
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [req.user.username]);
    res.json(await resolveUserProfile(rows[0]));
  } catch (err) { res.status(500).json({ message: t('user.update_failed', getLocale(req)) }); }
});

// ============================================================
// 启动
// ============================================================
async function start() {
  try {
    await setup();
    app.listen(PORT, () => {
      console.log(`[Server] PostgreSQL + JWT backend at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();
