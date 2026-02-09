-- ============================================
-- Wealth Manager Seed Data
-- Migration: 003_seed_data.sql
-- Description: System preset categories for cashflow
-- ============================================

-- ============================================
-- Income Categories - 收入分类
-- ============================================
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('工资', 'income', 'briefcase', '#4CAF50', true),
  ('奖金', 'income', 'gift', '#8BC34A', true),
  ('投资收益', 'income', 'trending-up', '#00BCD4', true),
  ('兼职收入', 'income', 'dollar-sign', '#009688', true),
  ('理财收益', 'income', 'percent', '#03A9F4', true),
  ('租金收入', 'income', 'home', '#3F51B5', true),
  ('退款', 'income', 'rotate-ccw', '#607D8B', true),
  ('红包', 'income', 'gift', '#E91E63', true),
  ('报销', 'income', 'file-text', '#795548', true),
  ('其他收入', 'income', 'plus-circle', '#9E9E9E', true);

-- ============================================
-- Expense Categories - 支出分类
-- ============================================

-- 餐饮类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('餐饮', 'expense', 'coffee', '#FF5722', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '早餐', 'expense', 'sunrise', '#FF7043', true, id
FROM cashflow_categories WHERE name = '餐饮' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '午餐', 'expense', 'sun', '#FF8A65', true, id
FROM cashflow_categories WHERE name = '餐饮' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '晚餐', 'expense', 'moon', '#FFAB91', true, id
FROM cashflow_categories WHERE name = '餐饮' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '零食饮料', 'expense', 'coffee', '#FFCCBC', true, id
FROM cashflow_categories WHERE name = '餐饮' AND is_system = true;

-- 交通类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('交通', 'expense', 'navigation', '#2196F3', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '公交地铁', 'expense', 'train', '#42A5F5', true, id
FROM cashflow_categories WHERE name = '交通' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '打车', 'expense', 'truck', '#64B5F6', true, id
FROM cashflow_categories WHERE name = '交通' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '加油', 'expense', 'droplet', '#90CAF9', true, id
FROM cashflow_categories WHERE name = '交通' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '停车费', 'expense', 'map-pin', '#BBDEFB', true, id
FROM cashflow_categories WHERE name = '交通' AND is_system = true;

-- 购物类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('购物', 'expense', 'shopping-bag', '#9C27B0', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '日用品', 'expense', 'box', '#AB47BC', true, id
FROM cashflow_categories WHERE name = '购物' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '服饰', 'expense', 'shopping-cart', '#BA68C8', true, id
FROM cashflow_categories WHERE name = '购物' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '数码产品', 'expense', 'smartphone', '#CE93D8', true, id
FROM cashflow_categories WHERE name = '购物' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '家居用品', 'expense', 'home', '#E1BEE7', true, id
FROM cashflow_categories WHERE name = '购物' AND is_system = true;

-- 居住类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('居住', 'expense', 'home', '#673AB7', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '房租', 'expense', 'key', '#7E57C2', true, id
FROM cashflow_categories WHERE name = '居住' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '房贷', 'expense', 'credit-card', '#9575CD', true, id
FROM cashflow_categories WHERE name = '居住' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '物业费', 'expense', 'clipboard', '#B39DDB', true, id
FROM cashflow_categories WHERE name = '居住' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '水电燃气', 'expense', 'zap', '#D1C4E9', true, id
FROM cashflow_categories WHERE name = '居住' AND is_system = true;

-- 娱乐类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('娱乐', 'expense', 'film', '#E91E63', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '电影', 'expense', 'film', '#EC407A', true, id
FROM cashflow_categories WHERE name = '娱乐' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '游戏', 'expense', 'play', '#F06292', true, id
FROM cashflow_categories WHERE name = '娱乐' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '旅游', 'expense', 'map', '#F48FB1', true, id
FROM cashflow_categories WHERE name = '娱乐' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '运动健身', 'expense', 'activity', '#F8BBD9', true, id
FROM cashflow_categories WHERE name = '娱乐' AND is_system = true;

-- 医疗健康
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('医疗健康', 'expense', 'heart', '#F44336', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '看病', 'expense', 'thermometer', '#EF5350', true, id
FROM cashflow_categories WHERE name = '医疗健康' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '买药', 'expense', 'package', '#E57373', true, id
FROM cashflow_categories WHERE name = '医疗健康' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '体检', 'expense', 'clipboard', '#EF9A9A', true, id
FROM cashflow_categories WHERE name = '医疗健康' AND is_system = true;

-- 教育学习
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('教育学习', 'expense', 'book', '#FF9800', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '书籍', 'expense', 'book-open', '#FFA726', true, id
FROM cashflow_categories WHERE name = '教育学习' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '培训课程', 'expense', 'award', '#FFB74D', true, id
FROM cashflow_categories WHERE name = '教育学习' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '考试费', 'expense', 'file-text', '#FFCC80', true, id
FROM cashflow_categories WHERE name = '教育学习' AND is_system = true;

-- 人情往来
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('人情往来', 'expense', 'users', '#FFC107', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '礼金', 'expense', 'gift', '#FFCA28', true, id
FROM cashflow_categories WHERE name = '人情往来' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '请客', 'expense', 'users', '#FFD54F', true, id
FROM cashflow_categories WHERE name = '人情往来' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '孝敬长辈', 'expense', 'heart', '#FFE082', true, id
FROM cashflow_categories WHERE name = '人情往来' AND is_system = true;

-- 通讯类
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('通讯', 'expense', 'phone', '#00BCD4', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '话费', 'expense', 'phone', '#26C6DA', true, id
FROM cashflow_categories WHERE name = '通讯' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '网费', 'expense', 'wifi', '#4DD0E1', true, id
FROM cashflow_categories WHERE name = '通讯' AND is_system = true;

-- 金融保险
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('金融保险', 'expense', 'shield', '#607D8B', true);

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '保险费', 'expense', 'shield', '#78909C', true, id
FROM cashflow_categories WHERE name = '金融保险' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '手续费', 'expense', 'percent', '#90A4AE', true, id
FROM cashflow_categories WHERE name = '金融保险' AND is_system = true;

INSERT INTO cashflow_categories (name, type, icon, color, is_system, parent_id)
SELECT '利息支出', 'expense', 'trending-down', '#B0BEC5', true, id
FROM cashflow_categories WHERE name = '金融保险' AND is_system = true;

-- 其他支出
INSERT INTO cashflow_categories (name, type, icon, color, is_system) VALUES
  ('其他支出', 'expense', 'more-horizontal', '#9E9E9E', true);
