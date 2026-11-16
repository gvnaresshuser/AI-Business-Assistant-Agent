INSERT INTO prod_products_biz_agent
(
    business_id,
    category_id,
    product_name,
    sku,
    brand,
    model_number,
    description,
    unit_price,
    unit_cost,
    reorder_level
)
SELECT
    b.id,
    c.id,
    p.product_name,
    p.sku,
    p.brand,
    p.model_number,
    p.description,
    p.unit_price,
    p.unit_cost,
    p.reorder_level
FROM biz_businesses_biz_agent b
CROSS JOIN (
    VALUES
    ('Mobiles','Samsung Galaxy S26','MOB001','Samsung','S26','5G smartphone',79999,65000,5),
    ('Mobiles','Samsung Galaxy A56','MOB002','Samsung','A56','Mid-range smartphone',39999,32000,5),
    ('Mobiles','iPhone 17','MOB003','Apple','IP17','Apple smartphone',89999,76000,5),
    ('Mobiles','iPhone 17 Pro','MOB004','Apple','IP17P','Premium Apple smartphone',129999,110000,3),
    ('Mobiles','OnePlus 14','MOB005','OnePlus','OP14','Flagship smartphone',69999,57000,5),
    ('Mobiles','OnePlus Nord 6','MOB006','OnePlus','N6','Mid-range smartphone',32999,26000,5),
    ('Mobiles','Redmi Note 15','MOB007','Xiaomi','RN15','Android smartphone',18999,14500,10),
    ('Mobiles','Google Pixel 11','MOB008','Google','P11','Google smartphone',74999,61000,3),

    ('Laptops','Dell Inspiron 15','LAP001','Dell','INS15','15 inch laptop',65999,54000,5),
    ('Laptops','Dell XPS 14','LAP002','Dell','XPS14','Premium laptop',149999,125000,3),
    ('Laptops','HP Pavilion 15','LAP003','HP','PAV15','Everyday laptop',62999,51000,5),
    ('Laptops','HP Spectre x360','LAP004','HP','SPX360','Convertible laptop',139999,115000,3),
    ('Laptops','Lenovo IdeaPad Slim 5','LAP005','Lenovo','IPS5','Slim laptop',69999,56000,5),
    ('Laptops','Lenovo ThinkPad E14','LAP006','Lenovo','TPE14','Business laptop',84999,70000,5),
    ('Laptops','Apple MacBook Air','LAP007','Apple','MBA','Apple laptop',109999,92000,3),
    ('Laptops','Asus Vivobook 16','LAP008','Asus','VB16','Everyday laptop',57999,46000,5),

    ('Televisions','Samsung 43 inch Smart TV','TV001','Samsung','TU43','4K Smart TV',42999,34000,5),
    ('Televisions','Samsung 55 inch QLED TV','TV002','Samsung','Q55','QLED television',79999,65000,3),
    ('Televisions','LG 43 inch LED TV','TV003','LG','L43','LED television',39999,32000,5),
    ('Televisions','LG 55 inch OLED TV','TV004','LG','O55','OLED television',129999,108000,3),
    ('Televisions','Sony Bravia 50 inch','TV005','Sony','BR50','4K television',74999,61000,3),
    ('Televisions','TCL 43 inch Smart TV','TV006','TCL','T43','Smart television',32999,26000,5),

    ('Audio','Sony Wireless Headphones','AUD001','Sony','WH1000','Noise cancelling headphones',24999,18500,10),
    ('Audio','JBL Bluetooth Speaker','AUD002','JBL','FLIP','Portable speaker',9999,6500,10),
    ('Audio','Bose Soundbar','AUD003','Bose','SB900','Premium soundbar',49999,39000,5),
    ('Audio','Boat Airdopes','AUD004','Boat','AD450','Wireless earbuds',2499,1400,20),
    ('Audio','Apple AirPods Pro','AUD005','Apple','APP3','Wireless earbuds',24999,19500,5),
    ('Audio','JBL Party Speaker','AUD006','JBL','PARTY','Portable party speaker',18999,14000,5),

    ('Accessories','USB C Cable','ACC001','Portronics','UC01','USB C charging cable',499,180,30),
    ('Accessories','Wireless Mouse','ACC002','Logitech','M185','Wireless mouse',899,500,20),
    ('Accessories','Mechanical Keyboard','ACC003','Redragon','K552','Gaming keyboard',3499,2200,10),
    ('Accessories','Laptop Cooling Pad','ACC004','Zebronics','CP01','Cooling pad',1299,750,10),
    ('Accessories','65W Fast Charger','ACC005','Anker','C65','Fast charging adapter',2499,1600,10),
    ('Accessories','HDMI Cable','ACC006','Amazon Basics','HDMI2','High speed HDMI cable',599,250,20),
    ('Accessories','Laptop Backpack','ACC007','HP','BAG15','Laptop backpack',1999,1100,10),

    ('Storage','Samsung 1TB SSD','STR001','Samsung','SSD1TB','Internal SSD',8999,6500,10),
    ('Storage','WD 2TB External HDD','STR002','Western Digital','HDD2TB','External hard drive',6499,4700,10),
    ('Storage','SanDisk 128GB Pen Drive','STR003','SanDisk','PD128','USB storage device',899,450,20),
    ('Storage','Crucial 2TB SSD','STR004','Crucial','C2TB','Internal SSD',13999,10500,5),
    ('Storage','Seagate 4TB HDD','STR005','Seagate','SG4TB','External hard drive',9999,7500,5),

    ('Networking','TP Link WiFi 6 Router','NET001','TP-Link','AX1500','WiFi 6 router',3999,2600,10),
    ('Networking','D Link Gigabit Router','NET002','D-Link','DIR825','Wireless router',2999,1900,10),
    ('Networking','Netgear Mesh WiFi','NET003','Netgear','MESH2','Mesh networking system',12999,9500,5),
    ('Networking','TP Link 8 Port Switch','NET004','TP-Link','SW8','Gigabit network switch',2499,1500,10),
    ('Networking','TP Link WiFi Adapter','NET005','TP-Link','WA1200','USB WiFi adapter',1299,700,10),

    ('Cameras','Canon EOS R50','CAM001','Canon','EOSR50','Mirrorless digital camera',74999,60000,3),
    ('Cameras','Sony Alpha A6400','CAM002','Sony','A6400','Mirrorless camera',89999,73000,3),
    ('Cameras','Nikon Z50','CAM003','Nikon','Z50','Mirrorless camera',79999,65000,3),
    ('Cameras','Logitech C920 Webcam','CAM004','Logitech','C920','Full HD webcam',6999,4500,10),
    ('Cameras','GoPro Hero','CAM005','GoPro','HERO','Action camera',39999,31000,5)
) AS p(
    category_name,
    product_name,
    sku,
    brand,
    model_number,
    description,
    unit_price,
    unit_cost,
    reorder_level
)
CROSS JOIN cat_categories_biz_agent c
WHERE b.business_name = 'Demo Electronics Store'
  AND c.business_id = b.id
  AND c.category_name = p.category_name
ON CONFLICT (business_id, sku) DO NOTHING;