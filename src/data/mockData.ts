import { Producer, AkweteCloth } from '../types';

export const PRODUCERS: Producer[] = [
  {
    id: 'producer-1',
    name: 'Mama Grace Nwosu',
    nativeTitle: 'Master Weaver & Women Leader',
    location: 'Akwete Town, Ukwa East, Abia State',
    village: 'Umuagbayi, Akwete',
    yearsOfExperience: 38,
    avatarUrl: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    bio: 'Woven Akwete cloth for over 35 years in Akwete. Learned the traditional upright loom from her late mother and specializes in authentic Ikaki (tortoise) and traditional wedding double wrappers.',
    specialtyMotif: 'Original Ikaki (Royal Tortoise) & 2-Piece Wedding Wrappers',
    loomType: 'Traditional Akwete Upright Wooden Loom',
    story: `Ndewo! I am Mama Grace. I grew up right here in Akwete town. As a young girl in the 1980s, I would sit on a low stool beside my mother's tall wooden loom after school, watching how she handled the wooden sword (nkpo) to beat the thread tight.

Here in Akwete, our mothers taught us that good cloth cannot be rushed. A proper pair of Akwete wrappers takes me 2 to 3 weeks of daily work from morning till evening. Many people today buy cheap printed factory materials, but when someone wears original Akwete to an Igba Nkwu (traditional wedding) or chieftaincy title taking, everyone in the hall knows the difference immediately. It is heavy, rich, and lasts for decades without fading. 

When you buy from me here, you are dealing directly with my workshop. You can choose your colors and we will weave it cleanly for you.`,
    quote: 'Original Akwete cloth has weight and respect. When you touch it with your hand, you know it came from a human being, not a machine.',
    phone: '+234 803 419 8820',
    whatsapp: '2348034198820',
    totalClothsWoven: 450,
    generationalLineage: 'Family tradition passed from mother to daughter',
    rating: 4.9,
    reviewCount: 38,
    isGuildCertified: true
  },
  {
    id: 'producer-2',
    name: 'Christy Adaobi Nwachukwu',
    nativeTitle: 'Contemporary Akwete Weaver & Designer',
    location: 'Akwete Town, Abia State (Deliveries to Lagos & Abuja)',
    village: 'Umuihueze Compound, Akwete',
    yearsOfExperience: 14,
    avatarUrl: '/images/akwaete_weaver_adaobi_1790722157877.jpg',
    bio: 'Combines traditional Akwete handloom weaving with modern bridal colors and metallic threads. Coordinates custom wedding orders for clients in Nigeria and the diaspora (UK, US, Canada).',
    specialtyMotif: 'Bridal Red & Gold Wrappers, Men\'s Stoles, Custom Color Combinations',
    loomType: 'Handcrafted Vertical Broadloom',
    story: `Hello, my name is Christy. While many young people left the village for the big cities, I chose to stay and build on what my grandmother started. Akwete weaving is one of the proudest heritage crafts in Igbo land, but for years buyers in Lagos or London couldn't easily find genuine weavers without traveling down to Abia State.

This platform gives you a direct link to our looms. When a bride contacts me, she sends me her wedding color palette (like wine and champagne gold, or emerald green and navy). I source high-grade combed cotton and shiny silk-blend threads, prepare the loom, and share photo updates as the cloth grows day by day. You get authentic handmade regalia with zero stress.`,
    quote: 'Our goal is simple: let brides and cultural dressers get original, breathtaking Akwete cloth directly from the women who weave it.',
    phone: '+234 812 774 3391',
    whatsapp: '2348127743391',
    totalClothsWoven: 190,
    generationalLineage: '3rd generation weaver',
    rating: 4.9,
    reviewCount: 26,
    isGuildCertified: true
  },
  {
    id: 'producer-3',
    name: 'Mrs. Ijeoma Ebere',
    nativeTitle: 'Elder, Akwete Weavers Association',
    location: 'Akwete Town, Ukwa East, Abia State',
    village: 'Ohanso Road, Akwete',
    yearsOfExperience: 45,
    avatarUrl: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    bio: 'One of the most senior respected weavers in Akwete. Master of traditional chieftaincy stoles, reversible patterns, and ceremonial wall hangings.',
    specialtyMotif: 'Agwa Eze (King\'s Python Lines) & Chieftaincy Regalia',
    loomType: 'Traditional Hardwood Loom',
    story: `I have been weaving for over 45 years. Kings, traditional rulers, and governors have worn my cloth. What makes our Akwete special is that both the front and the back are neatly finished. The patterns do not unravel.

Young people from all over the world order from us for their weddings and house warmings. When you place an order, our weavers association inspects every piece to ensure the weave is tight and clean before courier dispatch.`,
    quote: 'Akwete cloth is an heirloom. A mother passes it to her daughter, and that daughter wears it on her own wedding day.',
    phone: '+234 802 918 5543',
    whatsapp: '2348029185543',
    totalClothsWoven: 600,
    generationalLineage: 'Akwete Weavers Association Elder',
    rating: 5.0,
    reviewCount: 51,
    isGuildCertified: true
  }
];

export const AKWETE_CLOTHS: AkweteCloth[] = [
  {
    id: 'cloth-ikaki-royal',
    title: 'Classic Royal Ikaki (Tortoise) Double Wrapper Set',
    igboName: 'Akwa Ikaki Eze',
    motifName: 'Ikaki (Tortoise - Wisdom & Longevity)',
    motifSymbolism: 'The traditional tortoise motif is a symbol of royal wisdom, patience, and leadership in Igbo culture. Traditionally worn by titled elders and respected families.',
    producerId: 'producer-1',
    producerName: 'Mama Grace Nwosu',
    producerAvatar: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    priceNGN: 135000,
    priceUSD: 95,
    imageUrl: '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
    secondaryImageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
    dimensions: 'Complete 2-Piece Wrapper Set (each piece approx. 48 x 76 inches)',
    materials: 'Pure combed cotton base with raised emerald green & gold silk-blend motif threads',
    weaveTimeDays: 18,
    colors: ['Deep Indigo', 'Emerald Green', 'Gold', 'Off-White'],
    category: 'Royal',
    inStock: true,
    stockCount: 2,
    description: 'A complete two-piece double wrapper woven by Mama Grace in Akwete. The emerald and gold Ikaki pattern is raised on a deep indigo and cream background. Perfect for traditional titles, coronations, and family milestone celebrations.',
    culturalOccasion: 'Chieftaincy Title Taking, Family Milestones, Cultural Events',
    weightGrams: 1100,
    loomType: 'Upright Wooden Loom'
  },
  {
    id: 'cloth-ochi-bridal',
    title: 'Wine Red & Gold Bridal Akwete (Igba Nkwu Special)',
    igboName: 'Akwa Nwanyi Igba Nkwu',
    motifName: 'Ochi & Diamond (Bridal Joy & Prosperity)',
    motifSymbolism: 'Represents marital joy, fertility, and prosperity for the newly wedded couple. Woven with vibrant festive tones.',
    producerId: 'producer-2',
    producerName: 'Christy Adaobi Nwachukwu',
    producerAvatar: '/images/akwaete_weaver_adaobi_1790722157877.jpg',
    priceNGN: 145000,
    priceUSD: 105,
    imageUrl: '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
    secondaryImageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
    dimensions: '2 Full Wrappers + Matching Headtie/Shoulder Sash',
    materials: 'High-density cotton with shimmering metallic gold and rich ruby wine thread',
    weaveTimeDays: 20,
    colors: ['Wine Red', 'Gold', 'Warm White'],
    category: 'Bridal',
    inStock: true,
    stockCount: 3,
    description: 'Specially designed by Christy Adaobi for brides on their traditional wedding day. The cloth has substantial weight so it wraps securely and holds shape all day through dancing and photo sessions.',
    culturalOccasion: 'Traditional Wedding (Igba Nkwu), Mother of the Bride/Groom, Child Dedication',
    weightGrams: 950,
    loomType: 'Vertical Broadloom'
  },
  {
    id: 'cloth-agwa-sovereign',
    title: 'Traditional Terracotta & Indigo Multi-Pattern Wrapper',
    igboName: 'Akwa Agwa Akwete',
    motifName: 'Agwa (Geometric Line Weave)',
    motifSymbolism: 'Represents wealth, continuity, and family heritage through alternating geometric ribbing.',
    producerId: 'producer-3',
    producerName: 'Mrs. Ijeoma Ebere',
    producerAvatar: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    priceNGN: 125000,
    priceUSD: 90,
    imageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
    secondaryImageUrl: '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
    dimensions: 'Complete 2-Piece Wrapper Set (48 x 78 inches each)',
    materials: '100% Indigenous Akwete hand-dyed cotton yarn',
    weaveTimeDays: 22,
    colors: ['Terracotta', 'Indigo Blue', 'Ivory', 'Black'],
    category: 'Ceremonial',
    inStock: true,
    stockCount: 1,
    description: 'Woven with dense traditional handloom ribbing by elder Mrs. Ijeoma. Rich earthy tones that match coral beads and gold accessories for cultural outings.',
    culturalOccasion: 'Cultural Festivals, Church Harvest, Family Gatherings',
    weightGrams: 1200,
    loomType: 'Hardwood Upright Loom'
  },
  {
    id: 'cloth-kpakpando-gold',
    title: 'Gold & Ivory Modern Akwete Stole & Wrapper',
    igboName: 'Akwa Kpakpando',
    motifName: 'Kpakpando (Morning Star Motif)',
    motifSymbolism: 'Signifies illumination, bright future, and good fortune for the wearer.',
    producerId: 'producer-2',
    producerName: 'Christy Adaobi Nwachukwu',
    producerAvatar: '/images/akwaete_weaver_adaobi_1790722157877.jpg',
    priceNGN: 95000,
    priceUSD: 70,
    imageUrl: '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
    secondaryImageUrl: '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
    dimensions: 'Single Wide Wrapper or Luxury Shoulder Throw (44 x 72 inches)',
    materials: 'Soft combed cotton with gold metallic thread accents',
    weaveTimeDays: 14,
    colors: ['Warm Gold', 'Ivory White', 'Charcoal'],
    category: 'Contemporary',
    inStock: true,
    stockCount: 4,
    description: 'A versatile modern piece that can be worn over an English dress, paired with lace for an occasion, or framed as a stunning living room wall textile.',
    culturalOccasion: 'Sunday Service, Receptions, Wall Art Decor, Executive Gifts',
    weightGrams: 850,
    loomType: 'Handcrafted Vertical Loom'
  },
  {
    id: 'cloth-ebe-nze',
    title: 'Men\'s Chieftaincy Stole & Wrapper Set',
    igboName: 'Akwa Ebe Nze na Ozo',
    motifName: 'Ebe Nze (Chief\'s Stool & Authority)',
    motifSymbolism: 'Emblem of integrity, leadership, and clan authority for men taking titles or attending high-profile events.',
    producerId: 'producer-1',
    producerName: 'Mama Grace Nwosu',
    producerAvatar: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    priceNGN: 110000,
    priceUSD: 80,
    imageUrl: '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg',
    secondaryImageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
    dimensions: 'Full Men\'s Wrapper (48 x 75 in) + Matching Shoulder Muffler (12 x 70 in)',
    materials: 'Thick organic cotton with crimson and bone white raised weave',
    weaveTimeDays: 16,
    colors: ['Ceremonial Crimson', 'Bone White', 'Navy'],
    category: 'Ceremonial',
    inStock: true,
    stockCount: 2,
    description: 'Designed specifically for men. Includes the main wrapper cloth and a matching shoulder stole that rests cleanly across an Isiagu or white linen outfit.',
    culturalOccasion: 'Title Taking, Chieftaincy, Traditional Wedding Groom Outfit',
    weightGrams: 1050,
    loomType: 'Upright Wooden Loom'
  },
  {
    id: 'cloth-ahia-modern',
    title: 'Diamond Heritage Akwete Tapestry & Double Wrapper',
    igboName: 'Akwa Ahia Umuahia',
    motifName: 'Ahia (Market Prosperity & Community)',
    motifSymbolism: 'Celebrates good business, community prosperity, and peace in the family.',
    producerId: 'producer-3',
    producerName: 'Mrs. Ijeoma Ebere',
    producerAvatar: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
    priceNGN: 130000,
    priceUSD: 92,
    imageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
    secondaryImageUrl: '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg',
    dimensions: '2-Piece Wrapper Set or Framed Wall Art (50 x 78 inches each)',
    materials: 'Indigo cotton with warm ochre and ivory accents',
    weaveTimeDays: 20,
    colors: ['Indigo', 'Ochre Gold', 'Ivory'],
    category: 'Wall Tapestry',
    inStock: true,
    stockCount: 1,
    description: 'A genuine collector\'s piece woven with tight diamond motifs. Can be worn as a traditional double wrapper or used with mounting rods for home and office interior decoration.',
    culturalOccasion: 'Cultural Diplomatic Gifts, Living Room Art, Traditional Ceremonies',
    weightGrams: 1250,
    loomType: 'Hardwood Upright Loom'
  }
];

export const DEMO_BUYER: {
  id: string;
  name: string;
  email: string;
  role: 'buyer';
  phone: string;
  location: string;
} = {
  id: 'buyer-demo-1',
  name: 'Chidinma Okafor',
  email: 'chidinma.okafor@gmail.com',
  role: 'buyer',
  phone: '+234 809 112 4433',
  location: 'Lekki Phase 1, Lagos'
};

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    senderId: 'buyer-demo-1',
    senderName: 'Chidinma Okafor',
    senderRole: 'buyer' as const,
    receiverId: 'producer-1',
    receiverName: 'Mama Grace Nwosu',
    clothId: 'cloth-ikaki-royal',
    clothTitle: 'Classic Royal Ikaki (Tortoise) Double Wrapper Set',
    text: 'Good afternoon Mama Grace! I saw your Ikaki double wrapper. My brother has an upcoming title taking in November in Aba. Can you weave this same design in navy blue with touches of gold?',
    timestamp: 'Yesterday at 3:15 PM',
    read: true
  },
  {
    id: 'msg-2',
    senderId: 'producer-1',
    senderName: 'Mama Grace Nwosu',
    senderRole: 'producer' as const,
    receiverId: 'buyer-demo-1',
    receiverName: 'Chidinma Okafor',
    clothId: 'cloth-ikaki-royal',
    clothTitle: 'Classic Royal Ikaki (Tortoise) Double Wrapper Set',
    text: 'Ndewo my daughter! Yes, I have good quality navy blue thread and gold silk thread ready. If you confirm this week, it will take me about 18 days on the loom and I will send it via Peace Mass or GIG Logistics straight to Lagos.',
    timestamp: 'Yesterday at 4:40 PM',
    read: true
  }
];
