
import { Dish, DishCategory, User } from './types';

export const CURRENT_USER: User = {
  id: 1,
  nickname: "美食家小王",
  avatar: "https://picsum.photos/id/64/200/200",
  totalSpend: 1250.50,
  orderCount: 42,
  role: 'guest',
  points: 250
};

export const MOCK_DISHES: Dish[] = [
  {
    id: 101,
    name: "川味辣子鸡",
    price: 38.00,
    category: DishCategory.MEAT,
    image: "https://picsum.photos/id/292/300/300",
    sales: 450,
    spiciness: 4,
    isSoldOut: false,
    tags: ["主厨推荐"]
  },
  {
    id: 102,
    name: "秘制红烧肉",
    price: 45.00,
    category: DishCategory.MEAT,
    image: "https://picsum.photos/id/488/300/300",
    sales: 1200,
    spiciness: 1,
    isSoldOut: false
  },
  {
    id: 201,
    name: "清炒西兰花",
    price: 18.00,
    category: DishCategory.VEG,
    image: "https://picsum.photos/id/365/300/300",
    sales: 890,
    spiciness: 0,
    isSoldOut: false
  },
  {
    id: 202,
    name: "麻婆豆腐",
    price: 22.00,
    category: DishCategory.VEG,
    image: "https://picsum.photos/id/490/300/300",
    sales: 600,
    spiciness: 3,
    isSoldOut: false
  },
  {
    id: 301,
    name: "红烧牛肉面",
    price: 28.00,
    category: DishCategory.SOUP,
    image: "https://picsum.photos/id/225/300/300",
    sales: 2100,
    spiciness: 2,
    isSoldOut: false
  },
  {
    id: 401,
    name: "港式冻柠茶",
    price: 12.00,
    category: DishCategory.DRINK,
    image: "https://picsum.photos/id/430/300/300",
    sales: 3000,
    spiciness: 0,
    isSoldOut: false
  },
  {
    id: 402,
    name: "精酿啤酒",
    price: 25.00,
    category: DishCategory.DRINK,
    image: "https://picsum.photos/id/443/300/300",
    sales: 150,
    spiciness: 0,
    isSoldOut: true
  }
];

export const SQL_SCHEMA = `
-- 10人点餐系统 SQLite 数据库结构

-- 1. 用户表 (Users)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT UNIQUE,          -- 微信 OpenID (可选)
    nickname TEXT NOT NULL,      -- 昵称
    avatar_url TEXT,             -- 头像
    total_spend REAL DEFAULT 0,  -- 总消费
    order_count INTEGER DEFAULT 0, -- 下单次数
    is_disabled INTEGER DEFAULT 0, -- 0: 正常, 1: 禁用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 菜品表 (Dishes)
CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,         -- 价格 (支持小数)
    category TEXT NOT NULL,      -- 分类: '荤菜', '素菜', '汤面', '饮品'
    image_url TEXT,
    spiciness INTEGER DEFAULT 0, -- 辣度 0-5
    recommend_index INTEGER DEFAULT 0, -- 推荐指数
    is_sold_out INTEGER DEFAULT 0, -- 是否售罄
    sort_order INTEGER DEFAULT 0, -- 手动排序权重
    monthly_sales INTEGER DEFAULT 0 -- 月销量
);

-- 3. 订单表 (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items_json TEXT NOT NULL,    -- JSON 格式: [{"dishId":1, "qty":2, "price":38}, ...]
    total_amount REAL NOT NULL,  -- 总金额
    status TEXT DEFAULT 'pending', -- 状态: 'pending'(待支付), 'paid'(已支付), 'completed'(已完成)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 性能索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_dishes_category ON dishes(category);
`;
