-- CloudKitchen 数据库初始化脚本
-- 在 Supabase SQL 编辑器中运行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('guest', 'chef')),
    points INTEGER DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 菜品表
CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('招牌硬菜', '时令素食', '暖心汤面', '特调饮品')),
    image_url TEXT,
    description TEXT,
    spiciness INTEGER DEFAULT 0 CHECK (spiciness >= 0 AND spiciness <= 5),
    is_sold_out BOOLEAN DEFAULT FALSE,
    sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- 移除外键约束，允许 NULL
    user_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'ready', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 预约表
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建增加菜品销量的函数
CREATE OR REPLACE FUNCTION increment_dish_sales(dish_id INTEGER, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE dishes 
    SET sales = sales + increment_by,
        updated_at = NOW()
    WHERE id = dish_id;
END;
$$ LANGUAGE plpgsql;

-- 创建更新用户统计的函数
CREATE OR REPLACE FUNCTION update_user_stats(user_id UUID, spend_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET total_spend = total_spend + spend_amount,
        order_count = order_count + 1,
        points = points + FLOOR(spend_amount)::INTEGER,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 插入示例菜品数据
INSERT INTO dishes (name, price, category, image_url, description, spiciness, sales) VALUES
('川味辣子鸡', 38.00, '招牌硬菜', 'https://picsum.photos/id/292/300/300', '麻辣鲜香，鸡肉嫩滑，配菜丰富', 4, 450),
('秘制红烧肉', 45.00, '招牌硬菜', 'https://picsum.photos/id/488/300/300', '肥而不腻，入口即化，传统工艺', 1, 1200),
('清炒西兰花', 18.00, '时令素食', 'https://picsum.photos/id/365/300/300', '清淡爽口，营养丰富，时令蔬菜', 0, 890),
('麻婆豆腐', 22.00, '时令素食', 'https://picsum.photos/id/490/300/300', '麻辣鲜香，豆腐嫩滑，经典川菜', 3, 600),
('红烧牛肉面', 28.00, '暖心汤面', 'https://picsum.photos/id/225/300/300', '汤浓肉烂，面条劲道，暖胃暖心', 2, 2100),
('港式冻柠茶', 12.00, '特调饮品', 'https://picsum.photos/id/430/300/300', '清香解腻，冰爽怡人，港式经典', 0, 3000),
('精酿啤酒', 25.00, '特调饮品', 'https://picsum.photos/id/443/300/300', '口感醇厚，泡沫丰富，限量供应', 0, 150)
ON CONFLICT DO NOTHING;

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略（允许所有操作，实际项目中应该更严格）
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on dishes" ON dishes FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true);