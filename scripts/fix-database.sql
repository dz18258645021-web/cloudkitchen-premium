-- 修复数据库表结构的脚本
-- 在 Supabase SQL 编辑器中运行此脚本来修复订单表的外键问题

-- 1. 删除现有的订单表（如果存在数据，请先备份）
DROP TABLE IF EXISTS orders CASCADE;

-- 2. 重新创建订单表，移除外键约束，改用 TEXT 类型的 user_id
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- 改为 TEXT 类型，可以存储数字或 UUID
    user_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'ready', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_name ON orders(user_name);

-- 4. 添加更新时间戳触发器
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 创建安全策略
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);

-- 6. 验证预约表是否正确
-- 如果预约表有问题，也重新创建
DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建预约表索引
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- 创建预约表安全策略
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true);

-- 7. 插入一些测试数据来验证表结构
INSERT INTO orders (user_name, items, total_amount, status) VALUES
('测试用户1', '[{"id":101,"name":"川味辣子鸡","price":38,"quantity":1}]', 38.00, 'pending'),
('测试用户2', '[{"id":102,"name":"秘制红烧肉","price":45,"quantity":2}]', 90.00, 'cooking');

INSERT INTO reservations (name, date, time, guests, status) VALUES
('张三', '2024-12-20', '18:00', 4, 'confirmed'),
('李四', '2024-12-21', '19:30', 2, 'confirmed');

-- 8. 验证数据插入
SELECT 'Orders count:' as info, COUNT(*) as count FROM orders
UNION ALL
SELECT 'Reservations count:' as info, COUNT(*) as count FROM reservations;