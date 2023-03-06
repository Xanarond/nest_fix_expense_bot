export const generate_categories = `INSERT INTO PUBLIC.CATEGORIES(CATEGORY, CATEGORY_EN) VALUES 
('Аренда жилья', 'Rent'),
('Еда', 'Food'),
('Клининг', 'Cleaning'),
('Расходники','Consumables'),
('Стирка', 'Laundry'),
('Вода', 'Water'), 
('Сотовая связь', 'Mobile communication') ON CONFLICT DO NOTHING`;
