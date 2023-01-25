export const generate_categories = `INSERT INTO PUBLIC.CATEGORIES(CATEGORY) VALUES 
('Аренда жилья'),
('Еда'),
('Клининг'),
('Расходники'),
('Стирка'),
('Вода') ON CONFLICT (CATEGORY) DO NOTHING`;
