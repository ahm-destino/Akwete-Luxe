export interface Producer {
  id: string;
  name: string;
  nativeTitle: string; // e.g. "Nneoma", "Mama", "Onye Kpa Akwa"
  location: string;
  village: string;
  yearsOfExperience: number;
  avatarUrl: string;
  bio: string;
  specialtyMotif: string;
  loomType: string;
  story: string;
  quote: string;
  phone: string;
  whatsapp: string;
  totalClothsWoven: number;
  generationalLineage: string; // e.g. "3rd generation weaver"
  rating: number;
  reviewCount: number;
  isGuildCertified: boolean;
}

export interface AkweteCloth {
  id: string;
  title: string;
  igboName: string;
  motifName: string;
  motifSymbolism: string;
  producerId: string;
  producerName: string;
  producerAvatar: string;
  priceNGN: number;
  priceUSD: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  dimensions: string; // e.g. "48 x 76 inches (Double Wrapper Set)"
  materials: string; // e.g. "Organic hand-spun cotton & raw silk weft"
  weaveTimeDays: number;
  colors: string[];
  category: 'Bridal' | 'Royal' | 'Ceremonial' | 'Contemporary' | 'Wall Tapestry';
  inStock: boolean;
  stockCount: number;
  description: string;
  culturalOccasion: string;
  weightGrams: number;
  loomType: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'producer' | 'admin';
  avatarUrl?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  producerId?: string; // If registered as producer
  joinedDate: string;
}

export interface OrderItem {
  cloth: AkweteCloth;
  quantity: number;
  customNote?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: OrderItem[];
  totalNGN: number;
  totalUSD: number;
  status: 'Pending Verification' | 'Weaving / Preparing' | 'Shipped' | 'Delivered';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD';
  producerNames: string[];
  loomNote?: string;
  payoutReleased?: boolean;
  payoutDate?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'producer' | 'admin';
  receiverId: string;
  receiverName: string;
  clothId?: string;
  clothTitle?: string;
  text: string;
  timestamp: string;
  read: boolean;
  actingOnBehalfOfProducerName?: string;
}

export interface CustomCommission {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  producerId: string;
  producerName: string;
  desiredMotif: string;
  occasion: string;
  colors: string;
  estimatedBudgetNGN: number;
  targetDate: string;
  notes: string;
  status: 'Requested' | 'In Discussion' | 'Loom Warped' | 'Completed';
  createdAt: string;
  weaverProgressNote?: string;
}
