/**
 * 数据库初始化：建表 + 种子数据
 * 首次启动时自动执行（幂等：使用 IF NOT EXISTS）
 */
const { query } = require('./db');

const SCHEMA_SQL = `
-- ============================================================
-- 用户表（管理员 + 顾客统一存放）
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) NOT NULL,
  password      VARCHAR(255) NOT NULL DEFAULT '',
  display_name  VARCHAR(100),
  user_type     VARCHAR(20) NOT NULL DEFAULT 'customer',  -- 'admin' | 'customer'
  avatar        VARCHAR(500),
  level         VARCHAR(50),
  phone         VARCHAR(20),
  email         VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'enabled',
  role_codes    JSONB DEFAULT '[]',
  permission_codes JSONB DEFAULT '[]',
  last_login_at TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 分类表
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  name_en  VARCHAR(100),
  parent_id INTEGER REFERENCES categories(id),
  sort     INTEGER DEFAULT 0,
  enabled  BOOLEAN DEFAULT true
);

-- ============================================================
-- 店铺表
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  name_en           VARCHAR(200),
  good_review_count INTEGER DEFAULT 0,
  logo              VARCHAR(500),
  banner            VARCHAR(500),
  tagline           VARCHAR(300),
  tagline_en        VARCHAR(300),
  description       TEXT,
  description_en    TEXT,
  follower_count    INTEGER DEFAULT 0,
  credit_level      VARCHAR(30) DEFAULT 'normal',
  status            VARCHAR(20) DEFAULT 'active'
);

-- ============================================================
-- 商品表
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  name_en           VARCHAR(200),
  sku               VARCHAR(50),
  shop_id           INTEGER REFERENCES shops(id),
  category_id       INTEGER REFERENCES categories(id),
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price    NUMERIC(10,2),
  stock             INTEGER DEFAULT 0,
  safe_stock        INTEGER DEFAULT 0,
  sales             INTEGER DEFAULT 0,
  favorite_count    INTEGER DEFAULT 0,
  good_review_count INTEGER DEFAULT 0,
  rating_count      INTEGER DEFAULT 0,
  avg_rating        NUMERIC(3,2) DEFAULT 0,
  rating_high_count INTEGER DEFAULT 0,
  rating_low_count  INTEGER DEFAULT 0,
  is_premium        BOOLEAN DEFAULT false,
  status            VARCHAR(20) DEFAULT 'on_sale',
  cover             VARCHAR(500),
  description       TEXT,
  description_en    TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SKU 规格定义
-- ============================================================
CREATE TABLE IF NOT EXISTS sku_specs (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name        VARCHAR(50) NOT NULL,
  sort        INTEGER DEFAULT 0
);

-- ============================================================
-- SKU 规格值
-- ============================================================
CREATE TABLE IF NOT EXISTS sku_spec_values (
  id       SERIAL PRIMARY KEY,
  spec_id  INTEGER REFERENCES sku_specs(id) ON DELETE CASCADE,
  label    VARCHAR(50) NOT NULL,
  value    VARCHAR(50) NOT NULL,
  disabled BOOLEAN DEFAULT false
);

-- ============================================================
-- SKU 变体（组合后的具体 SKU）
-- ============================================================
CREATE TABLE IF NOT EXISTS sku_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  spec_values JSONB NOT NULL DEFAULT '{}',
  price       NUMERIC(10,2) NOT NULL,
  stock       INTEGER DEFAULT 0,
  sku         VARCHAR(50)
);

-- ============================================================
-- 购物车
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) NOT NULL,
  product_id INTEGER REFERENCES products(id),
  name       VARCHAR(200),
  price      NUMERIC(10,2),
  count      INTEGER DEFAULT 1,
  checked    BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 订单表
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  order_no     VARCHAR(30) NOT NULL,
  username     VARCHAR(50),
  total_amount NUMERIC(10,2),
  status       VARCHAR(30) DEFAULT 'pending_payment',
  address      TEXT,
  phone        VARCHAR(20),
  pay_time     TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 订单明细
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name       VARCHAR(200),
  price      NUMERIC(10,2),
  count      INTEGER DEFAULT 1
);

-- ============================================================
-- 收藏表
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) NOT NULL,
  product_id INTEGER REFERENCES products(id),
  UNIQUE(username, product_id)
);

-- ============================================================
-- 评价/星级表
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  username   VARCHAR(50) NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content    TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, username)
);

-- ============================================================
-- 角色表
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id               SERIAL PRIMARY KEY,
  code             VARCHAR(50) UNIQUE NOT NULL,
  name             VARCHAR(100),
  permission_codes JSONB DEFAULT '[]'
);

-- ============================================================
-- 消息表
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200),
  content    TEXT,
  type       VARCHAR(30) DEFAULT 'system',
  recipient  VARCHAR(50),
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS title_en VARCHAR(200);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content_en TEXT;

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_carts_username ON carts(username);
CREATE INDEX IF NOT EXISTS idx_orders_username ON orders(username);
CREATE INDEX IF NOT EXISTS idx_favorites_username ON favorites(username);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient);

-- ============================================================
-- 迁移：为已有数据库补充字段
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(200);
`;

// ============================================================
// 种子数据
// ============================================================
const SEED_SQL = `
-- 清空旧数据（按依赖顺序）
DELETE FROM sku_variants;
DELETE FROM sku_spec_values;
DELETE FROM sku_specs;
DELETE FROM order_items;
DELETE FROM reviews;
DELETE FROM favorites;
DELETE FROM carts;
DELETE FROM orders;
DELETE FROM messages;
DELETE FROM products;
DELETE FROM shops;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM roles;

-- 重置序列
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE shops_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE carts_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE sku_specs_id_seq RESTART WITH 1;
ALTER SEQUENCE sku_spec_values_id_seq RESTART WITH 1;
ALTER SEQUENCE sku_variants_id_seq RESTART WITH 1;

-- 用户
INSERT INTO users (username, password, display_name, user_type, avatar, level, phone, email, city, role_codes, permission_codes, last_login_at) VALUES
('admin',    '__HASHED_PW__', '超级管理员',   'admin',    'https://api.dicebear.com/9.x/shapes/svg?seed=admin',    '平台管理员', '13800000001', 'admin@demo.com',    '北京', '["super_admin"]', '["product:view","product:create","product:update","product:delete","category:view","category:create","category:update","category:delete","inventory:view","inventory:warning","inventory:update","order:view","order:update","user:view","role:view","message:view","profile:view","shop:view","shop:create","shop:update","shop:delete"]'::jsonb, '2026-04-03 11:30:00'),
('operator', '__HASHED_PW__', '商品运营专员', 'admin',    'https://api.dicebear.com/9.x/shapes/svg?seed=operator', '运营专员',   '13800000002', 'operator@demo.com', '上海', '["operator"]',      '["product:view","product:create","product:update","category:view","inventory:view","inventory:warning","order:view","message:view","profile:view","shop:view"]'::jsonb, '2026-04-03 10:00:00'),
('user01',   '__HASHED_PW__', '张小明',       'customer', 'https://api.dicebear.com/9.x/shapes/svg?seed=user01',   '普通用户',   '13800000003', 'user01@demo.com',   '杭州', '[]', '[]'::jsonb, '2026-04-03 09:00:00'),
('user02',   '__HASHED_PW__', '李晓倩',       'customer', 'https://api.dicebear.com/9.x/shapes/svg?seed=user02',   '普通用户',   '13800000004', 'user02@demo.com',   '深圳', '[]', '[]'::jsonb, '2026-04-03 08:00:00');

-- 角色
INSERT INTO roles (code, name, description, permission_codes) VALUES
('super_admin', '超级管理员', '拥有平台全部菜单与操作权限', '["product:view","product:create","product:update","product:delete","category:view","category:create","category:update","category:delete","inventory:view","inventory:warning","inventory:update","order:view","order:update","user:view","role:view","message:view","profile:view","shop:view","shop:create","shop:update","shop:delete"]'::jsonb),
('operator', '运营专员', '负责商品管理、订单处理和消息回复', '["product:view","product:create","product:update","category:view","inventory:view","inventory:warning","order:view","message:view","profile:view","shop:view"]'::jsonb);

-- 分类
INSERT INTO categories (id, name, name_en, sort) VALUES
(1, '生鲜水果', 'Fresh Fruit', 1),
(2, '乳品饮品', 'Dairy & Beverages', 2),
(3, '谷物粮油', 'Grains & Oils', 3),
(4, '地方特产', 'Local Specialties', 4);

-- 店铺
INSERT INTO shops (id, name, name_en, good_review_count, logo, banner, tagline, tagline_en, description, description_en, follower_count, credit_level) VALUES
(1, '阿克苏原产果园店', 'Aksu Original Orchard Shop', 126, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=200&q=60', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1400&q=70', '产地鲜果 · 当季直发', 'Origin Fresh Fruit · Seasonal Direct Delivery', '专注新疆优质鲜果，冷链配送，坏果包赔。', 'Focus on high-quality fresh fruit from Xinjiang.', 1820, 'excellent'),
(2, '高原鲜奶直营店', 'Highland Fresh Milk Direct Store', 248, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=60', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1400&q=70', '牧场直供 · 醇厚奶香', 'Pasture Direct Supply · Rich Milk Flavor', '高原牧场奶源，短保新鲜。', 'Highland pasture milk source.', 3210, 'excellent'),
(3, '轻食谷物研究社', 'Light Food Grain Research Society', 438, 'https://images.unsplash.com/photo-1515543904379-3d757afe72e0?auto=format&fit=crop&w=200&q=60', 'https://images.unsplash.com/photo-1515543904379-3d757afe72e0?auto=format&fit=crop&w=1400&q=70', '低糖高纤 · 轻负担', 'Low Sugar High Fiber · Light Burden', '谷物与轻食搭配方案。', 'Grain and light food pairing solutions.', 2890, 'excellent'),
(4, '山野特产甄选馆', 'Mountain Wild Specialty Selection Hall', 88, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=60', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=70', '一城一味 · 礼赠佳选', 'One City One Flavor · Gift Selection', '搜罗各地风味特产。', 'Collecting local specialty flavors.', 960, 'good'),
(5, '有机生活方式馆', 'Organic Lifestyle Hall', 612, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=60', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=70', '有机甄选 · 安心日常', 'Organic Selection · Peaceful Daily Life', '有机食品与植物基饮品。', 'Organic food and plant-based drinks.', 4100, 'excellent');

-- 商品
INSERT INTO products (id, name, name_en, sku, shop_id, category_id, price, original_price, stock, safe_stock, sales, favorite_count, good_review_count, rating_count, avg_rating, status, cover, description, description_en) VALUES
(1,  '阿克苏苹果礼盒', 'Aksu Apple Gift Box', 'FRUIT-001', 1, 1, 39.9, 49.9, 128, 40, 562, 156, 338, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80', '来自新疆阿克苏产区，果肉细腻，甜脆多汁。', 'From Xinjiang Aksu region, delicate flesh, sweet and crisp.'),
(2,  '高原纯牛奶', 'Highland Pure Milk', 'MILK-002', 2, 2, 28.5, 32.0, 36, 50, 402, 94, 192, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', '高原牧场新鲜牛乳，口感醇厚。', 'Fresh milk from highland pasture, rich taste.'),
(3,  '有机燕麦片', 'Organic Oatmeal', 'GRAIN-003', 3, 3, 22.8, 29.9, 64, 30, 287, 122, 245, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', '低糖高纤，适合早餐与轻食搭配。', 'Low sugar, high fiber, suitable for breakfast.'),
(4,  '云南野生菌礼包', 'Yunnan Wild Mushroom Gift Set', 'LOCAL-004', 4, 4, 88.0, 108.0, 18, 20, 118, 73, 104, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', '精选云南山野菌菇，适合煲汤和礼赠。', 'Selected wild mushrooms from Yunnan.'),
(5,  '椰香燕麦奶', 'Coconut Oat Milk', 'MILK-005', 5, 2, 19.9, 24.9, 84, 40, 204, 110, 216, 0, 0, 'off_sale', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', '植物基饮品，适合轻食搭配。', 'Plant-based drink.'),
(6,  '库尔勒香梨', 'Korla Fragrant Pear', 'FRUIT-006', 1, 1, 29.9, 35.9, 72, 30, 196, 88, 146, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80', '果香清甜，入口细腻。', 'Fragrant and sweet, delicate taste.'),
(7,  '黄金奇异果', 'Golden Kiwi', 'FRUIT-007', 5, 1, 45.0, 55.0, 58, 26, 178, 133, 224, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80', '酸甜平衡，维 C 丰富。', 'Balanced sweet and sour, rich in vitamin C.'),
(8,  '草莓酸奶昔', 'Strawberry Yogurt Smoothie', 'MILK-008', 2, 2, 18.9, 22.9, 97, 45, 319, 165, 297, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', '草莓风味浓郁，入口细滑。', 'Rich strawberry flavor, smooth texture.'),
(9,  '黑芝麻核桃奶', 'Black Sesame Walnut Milk', 'MILK-009', 2, 2, 21.9, 26.9, 54, 32, 140, 69, 128, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', '谷物与坚果香气结合。', 'Combination of grain and nut aroma.'),
(10, '即食藜麦沙拉碗', 'Ready-to-Eat Quinoa Salad Bowl', 'GRAIN-010', 3, 3, 26.0, 31.0, 43, 20, 201, 84, 171, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', '低脂饱腹，适合办公午餐。', 'Low fat, filling, suitable for office lunch.'),
(11, '全麦面包切片', 'Whole Wheat Bread Slices', 'GRAIN-011', 3, 3, 14.8, 18.0, 85, 35, 330, 101, 260, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', '麦香浓郁，早餐即食方便。', 'Rich wheat aroma, convenient for breakfast.'),
(12, '五谷杂粮礼盒', 'Whole Grain Gift Box', 'GRAIN-012', 3, 3, 58.0, 68.0, 52, 24, 119, 66, 142, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', '精选 8 种粗粮组合。', 'Selected 8 kinds of coarse grains.'),
(13, '四川牛肉酱', 'Sichuan Beef Sauce', 'LOCAL-013', 4, 4, 16.9, 21.9, 120, 40, 480, 188, 312, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80', '香辣过瘾，拌饭拌面都很适合。', 'Spicy and delicious.'),
(14, '贵州酸汤火锅底料', 'Guizhou Sour Soup Hot Pot Base', 'LOCAL-014', 4, 4, 23.5, 29.5, 66, 28, 210, 77, 156, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', '酸辣开胃，适合家庭聚餐。', 'Sour and spicy appetizer.'),
(15, '新疆红枣夹核桃', 'Xinjiang Red Date Stuffed Walnuts', 'LOCAL-015', 4, 4, 32.9, 39.9, 90, 36, 264, 93, 204, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80', '软糯香甜，休闲零食首选。', 'Soft and sweet, perfect snack.'),
(16, '冷榨亚麻籽油', 'Cold-Pressed Flaxseed Oil', 'GRAIN-016', 5, 3, 46.0, 58.0, 29, 20, 132, 57, 119, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', '冷拌凉菜更适合。', 'Better for cold dishes.'),
(17, '巴旦木坚果杯', 'Almond Nut Cup', 'LOCAL-017', 5, 4, 27.9, 33.9, 74, 30, 174, 115, 233, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80', '轻巧便携。', 'Lightweight and portable.'),
(18, '无糖希腊酸奶', 'Sugar-Free Greek Yogurt', 'MILK-018', 2, 2, 25.5, 30.0, 44, 22, 162, 108, 196, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', '高蛋白低糖。', 'High protein, low sugar.'),
(19, '猫山王榴莲冰皮', 'Musang King Durian Ice Skin', 'FRUIT-019', 1, 1, 62.0, 72.0, 25, 18, 95, 138, 180, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', '香甜细滑。', 'Sweet and smooth.'),
(20, '低卡果蔬脆片', 'Low-Calorie Fruit and Veggie Chips', 'LOCAL-020', 5, 4, 18.8, 22.8, 99, 42, 286, 144, 267, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80', '非油炸轻零食。', 'Non-fried light snack.'),
(21, '鲜榨橙汁组合', 'Freshly Squeezed Orange Juice Combo', 'MILK-021', 2, 2, 31.5, 38.0, 48, 24, 154, 71, 149, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80', '橙香浓郁。', 'Rich orange aroma.'),
(22, '进口蓝莓盒装', 'Imported Blueberry Box', 'FRUIT-022', 1, 1, 34.8, 39.8, 32, 18, 143, 96, 171, 0, 0, 'on_sale', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80', '酸甜平衡。', 'Balanced sweet and sour.');

-- SKU 规格（给商品1: 阿克苏苹果 添加多规格）
INSERT INTO sku_specs (product_id, name, sort) VALUES
(1, '颜色', 1),
(1, '规格', 2);

INSERT INTO sku_spec_values (spec_id, label, value) VALUES
(1, '红色', 'red'), (1, '绿色', 'green'), (1, '黄色', 'yellow'),
(2, '小果 2斤', 'small'), (2, '中果 5斤', 'medium'), (2, '大果 10斤', 'large');

INSERT INTO sku_variants (product_id, spec_values, price, stock, sku) VALUES
(1, '{"颜色":"red","规格":"small"}'::jsonb, 12.8, 50, 'FRUIT-001-RS'),
(1, '{"颜色":"red","规格":"medium"}'::jsonb, 15.8, 100, 'FRUIT-001-RM'),
(1, '{"颜色":"red","规格":"large"}'::jsonb, 22.0, 30, 'FRUIT-001-RL'),
(1, '{"颜色":"green","规格":"small"}'::jsonb, 12.8, 0, 'FRUIT-001-GS'),
(1, '{"颜色":"green","规格":"medium"}'::jsonb, 15.8, 60, 'FRUIT-001-GM'),
(1, '{"颜色":"yellow","规格":"large"}'::jsonb, 22.0, 20, 'FRUIT-001-YL');

-- 评价
INSERT INTO reviews (product_id, username, rating, content) VALUES
(1, 'user01', 5, '沃柑很新鲜，汁水很足！'),
(1, 'user02', 4, '不错，甜度适中。'),
(4, 'user01', 5, '车厘子个大味甜！'),
(4, 'user02', 3, '有点贵了。');

-- 收藏
INSERT INTO favorites (username, product_id) VALUES
('user01', 1), ('user01', 3), ('user01', 6),
('user02', 2), ('user02', 5);

-- 订单
INSERT INTO orders (order_no, username, total_amount, status, address, phone, created_at) VALUES
('SO202604030001', 'user01', 128.8, 'pending_shipping', '北京市朝阳区望京街道 88 号', '13800000001', '2026-04-03 09:18:00'),
('SO202604030002', 'user02', 88.0, 'completed', '上海市浦东新区金科路 100 号', '13800000002', '2026-04-03 10:30:00'),
('SO202604020001', 'user01', 57.0, 'pending_payment', '杭州市滨江区网商路 9 号', '13800000003', '2026-04-02 15:16:00');

INSERT INTO order_items (order_id, product_id, name, price, count) VALUES
(1, 1, '阿克苏苹果礼盒', 39.9, 2),
(1, 3, '有机燕麦片', 22.8, 2),
(2, 4, '云南野生菌礼包', 88.0, 1),
(3, 2, '高原纯牛奶', 28.5, 2);

-- 消息
INSERT INTO messages (title, title_en, content, content_en, type, recipient) VALUES
('订单已发货', 'Order Shipped', '您的订单 #SO202604030001 已发货', 'Your order #SO202604030001 has been shipped', 'order', 'user01'),
('限时优惠', 'Limited Time Offer', '生鲜水果夏季促销 — 低至7折！', 'Fresh Fruit Summer Sale — up to 30% off!', 'promotion', 'user01'),
('系统公告', 'System Announcement', '平台计划于5月10日凌晨维护', 'Platform maintenance scheduled for May 10th early morning', 'system', 'user01');
`;

async function setup() {
  console.log('[Setup] Creating tables...');
  await query(SCHEMA_SQL);
  console.log('[Setup] Tables created. Seeding data...');

  // bcrypt 哈希种子密码
  const bcrypt = require('bcryptjs');
  const hashedPw = await bcrypt.hash('123456', 10);
  const finalSeedSql = SEED_SQL.replace(/__HASHED_PW__/g, hashedPw);
  console.log('[Setup] Hashed seed passwords. Seeding data...');
  await query(finalSeedSql);

  // 修复序列：种子数据使用显式 ID，序列需要对齐到 MAX(id)
  console.log('[Setup] Fixing sequences...');
  await query("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id),1) FROM users))");
  await query("SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id),1) FROM categories))");
  await query("SELECT setval('shops_id_seq', (SELECT COALESCE(MAX(id),1) FROM shops))");
  await query("SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id),1) FROM products))");
  await query("SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id),1) FROM orders))");
  await query("SELECT setval('order_items_id_seq', (SELECT COALESCE(MAX(id),1) FROM order_items))");
  await query("SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id),1) FROM reviews))");
  await query("SELECT setval('sku_specs_id_seq', (SELECT COALESCE(MAX(id),1) FROM sku_specs))");
  await query("SELECT setval('sku_spec_values_id_seq', (SELECT COALESCE(MAX(id),1) FROM sku_spec_values))");
  await query("SELECT setval('sku_variants_id_seq', (SELECT COALESCE(MAX(id),1) FROM sku_variants))");
  console.log('[Setup] Database ready!');
}

// 直接运行时执行初始化
if (require.main === module) {
  setup()
    .then(() => {
      console.log('[Setup] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Setup] Failed:', err);
      process.exit(1);
    });
}

module.exports = { setup };
