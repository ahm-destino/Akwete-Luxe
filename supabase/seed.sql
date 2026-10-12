-- ============================================================
-- Akwete Luxe — Seed Data (your current mock data)
-- Run AFTER schema.sql
-- ============================================================

-- PRODUCERS
insert into public.producers (id, name, native_title, location, village, years_of_experience, avatar_url, bio, specialty_motif, loom_type, story, quote, phone, whatsapp, total_cloths_woven, generational_lineage, rating, review_count, is_guild_certified) values
(
  'producer-1',
  'Mama Grace Nwosu',
  'Master Weaver & Women Leader',
  'Akwete Town, Ukwa East, Abia State',
  'Umuagbayi, Akwete',
  38,
  '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  'Woven Akwete cloth for over 35 years in Akwete. Learned the traditional upright loom from her late mother and specializes in authentic Ikaki (tortoise) and traditional wedding double wrappers.',
  'Original Ikaki (Royal Tortoise) & 2-Piece Wedding Wrappers',
  'Traditional Akwete Upright Wooden Loom',
  'Ndewo! I am Mama Grace. I grew up right here in Akwete town...',
  'Original Akwete cloth has weight and respect. When you touch it with your hand, you know it came from a human being, not a machine.',
  '+234 803 419 8820',
  '2348034198820',
  450,
  'Family tradition passed from mother to daughter',
  4.9,
  38,
  true
),
(
  'producer-2',
  'Christy Adaobi Nwachukwu',
  'Contemporary Akwete Weaver & Designer',
  'Akwete Town, Abia State (Deliveries to Lagos & Abuja)',
  'Umuihueze Compound, Akwete',
  14,
  '/images/akwaete_weaver_adaobi_1790722157877.jpg',
  'Combines traditional Akwete handloom weaving with modern bridal colors and metallic threads.',
  'Bridal Red & Gold Wrappers, Men''s Stoles, Custom Color Combinations',
  'Handcrafted Vertical Broadloom',
  'Hello, my name is Christy...',
  'Our goal is simple: let brides and cultural dressers get original, breathtaking Akwete cloth directly from the women who weave it.',
  '+234 812 774 3391',
  '2348127743391',
  190,
  '3rd generation weaver',
  4.9,
  26,
  true
),
(
  'producer-3',
  'Mrs. Ijeoma Ebere',
  'Elder, Akwete Weavers Association',
  'Akwete Town, Ukwa East, Abia State',
  'Ohanso Road, Akwete',
  45,
  '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  'One of the most senior respected weavers in Akwete. Master of traditional chieftaincy stoles, reversible patterns, and ceremonial wall hangings.',
  'Agwa Eze (King''s Python Lines) & Chieftaincy Regalia',
  'Traditional Hardwood Loom',
  'I have been weaving for over 45 years...',
  'Akwete cloth is an heirloom. A mother passes it to her daughter, and that daughter wears it on her own wedding day.',
  '+234 802 918 5543',
  '2348029185543',
  600,
  'Akwete Weavers Association Elder',
  5.0,
  51,
  true
);

-- CLOTHS
insert into public.cloths (id, title, igbo_name, motif_name, motif_symbolism, producer_id, producer_name, producer_avatar, price_ngn, price_usd, image_url, secondary_image_url, dimensions, materials, weave_time_days, colors, category, in_stock, stock_count, description, cultural_occasion, weight_grams, loom_type) values
(
  'cloth-ikaki-royal',
  'Classic Royal Ikaki (Tortoise) Double Wrapper Set',
  'Akwa Ikaki Eze',
  'Ikaki (Tortoise - Wisdom & Longevity)',
  'The traditional tortoise motif is a symbol of royal wisdom, patience, and leadership in Igbo culture.',
  'producer-1', 'Mama Grace Nwosu', '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  135000, 95,
  '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
  '/images/akwaete_hero_cloth_1790722114411.jpg',
  'Complete 2-Piece Wrapper Set (each piece approx. 48 x 76 inches)',
  'Pure combed cotton base with raised emerald green & gold silk-blend motif threads',
  18, array['Deep Indigo','Emerald Green','Gold','Off-White'],
  'Royal', true, 2,
  'A complete two-piece double wrapper woven by Mama Grace in Akwete.',
  'Chieftaincy Title Taking, Family Milestones, Cultural Events',
  1100, 'Upright Wooden Loom'
),
(
  'cloth-ochi-bridal',
  'Wine Red & Gold Bridal Akwete (Igba Nkwu Special)',
  'Akwa Nwanyi Igba Nkwu',
  'Ochi & Diamond (Bridal Joy & Prosperity)',
  'Represents marital joy, fertility, and prosperity for the newly wedded couple.',
  'producer-2', 'Christy Adaobi Nwachukwu', '/images/akwaete_weaver_adaobi_1790722157877.jpg',
  145000, 105,
  '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
  '/images/akwaete_hero_cloth_1790722114411.jpg',
  '2 Full Wrappers + Matching Headtie/Shoulder Sash',
  'High-density cotton with shimmering metallic gold and rich ruby wine thread',
  20, array['Wine Red','Gold','Warm White'],
  'Bridal', true, 3,
  'Specially designed by Christy Adaobi for brides on their traditional wedding day.',
  'Traditional Wedding (Igba Nkwu), Mother of the Bride/Groom, Child Dedication',
  950, 'Vertical Broadloom'
),
(
  'cloth-agwa-sovereign',
  'Traditional Terracotta & Indigo Multi-Pattern Wrapper',
  'Akwa Agwa Akwete',
  'Agwa (Geometric Line Weave)',
  'Represents wealth, continuity, and family heritage through alternating geometric ribbing.',
  'producer-3', 'Mrs. Ijeoma Ebere', '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  125000, 90,
  '/images/akwaete_hero_cloth_1790722114411.jpg',
  '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
  'Complete 2-Piece Wrapper Set (48 x 78 inches each)',
  '100% Indigenous Akwete hand-dyed cotton yarn',
  22, array['Terracotta','Indigo Blue','Ivory','Black'],
  'Ceremonial', true, 1,
  'Woven with dense traditional handloom ribbing by elder Mrs. Ijeoma.',
  'Cultural Festivals, Church Harvest, Family Gatherings',
  1200, 'Hardwood Upright Loom'
),
(
  'cloth-kpakpando-gold',
  'Gold & Ivory Modern Akwete Stole & Wrapper',
  'Akwa Kpakpando',
  'Kpakpando (Morning Star Motif)',
  'Signifies illumination, bright future, and good fortune for the wearer.',
  'producer-2', 'Christy Adaobi Nwachukwu', '/images/akwaete_weaver_adaobi_1790722157877.jpg',
  95000, 70,
  '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
  '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
  'Single Wide Wrapper or Luxury Shoulder Throw (44 x 72 inches)',
  'Soft combed cotton with gold metallic thread accents',
  14, array['Warm Gold','Ivory White','Charcoal'],
  'Contemporary', true, 4,
  'A versatile modern piece that can be worn over an English dress or framed as wall textile.',
  'Sunday Service, Receptions, Wall Art Decor, Executive Gifts',
  850, 'Handcrafted Vertical Loom'
),
(
  'cloth-ebe-nze',
  'Men''s Chieftaincy Stole & Wrapper Set',
  'Akwa Ebe Nze na Ozo',
  'Ebe Nze (Chief''s Stool & Authority)',
  'Emblem of integrity, leadership, and clan authority for men taking titles.',
  'producer-1', 'Mama Grace Nwosu', '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  110000, 80,
  '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
  '/images/akwaete_hero_cloth_1790722114411.jpg',
  'Full Men''s Wrapper (48 x 75 in) + Matching Shoulder Muffler (12 x 70 in)',
  'Thick organic cotton with crimson and bone white raised weave',
  16, array['Ceremonial Crimson','Bone White','Navy'],
  'Ceremonial', true, 2,
  'Designed specifically for men. Includes the main wrapper cloth and a matching shoulder stole.',
  'Title Taking, Chieftaincy, Traditional Wedding Groom Outfit',
  1050, 'Upright Wooden Loom'
),
(
  'cloth-ahia-modern',
  'Diamond Heritage Akwete Tapestry & Double Wrapper',
  'Akwa Ahia Umuahia',
  'Ahia (Market Prosperity & Community)',
  'Celebrates good business, community prosperity, and peace in the family.',
  'producer-3', 'Mrs. Ijeoma Ebere', '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
  130000, 92,
  '/images/akwaete_hero_cloth_1790722114411.jpg',
  '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
  '2-Piece Wrapper Set or Framed Wall Art (50 x 78 inches each)',
  'Indigo cotton with warm ochre and ivory accents',
  20, array['Indigo','Ochre Gold','Ivory'],
  'Wall Tapestry', true, 1,
  'A genuine collector''s piece woven with tight diamond motifs.',
  'Cultural Diplomatic Gifts, Living Room Art, Traditional Ceremonies',
  1250, 'Hardwood Upright Loom'
);

-- ============================================================
-- Ensure seeded master weavers are approved & live (idempotent).
-- (status defaults to 'active', but we set it explicitly for clarity so
--  these founding weavers appear on the public storefront immediately.)
-- ============================================================
update public.producers set status = 'active' where status is distinct from 'active';
