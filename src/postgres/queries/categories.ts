export const generate_categories = `INSERT INTO PUBLIC.CATEGORIES(CATEGORY) VALUES 
('Аренда жилья'),
('Еда'),
('Клининг'),
('Расходники'),
('Стирка'),
('Вода'), 
('Сотовая связь') ON CONFLICT (CATEGORY) DO NOTHING`;
