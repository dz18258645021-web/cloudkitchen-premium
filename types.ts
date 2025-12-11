
export enum DishCategory {
  MEAT = '招牌硬菜',
  VEG = '时令素食',
  SOUP = '暖心汤面',
  DRINK = '特调饮品'
}

export type UserRole = 'guest' | 'chef';

export interface User {
  id: number;
  nickname: string;
  avatar: string;
  role: UserRole;
  points: number;
  totalSpend?: number;
  orderCount?: number;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: DishCategory;
  image: string;
  sales: number;
  isSoldOut: boolean;
  calories?: number;
  spiciness?: number;
  tags?: string[];
}

export interface CartItem extends Dish {
  quantity: number;
}

export interface Order {
  id: string;
  userId: number;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'cooking' | 'ready' | 'completed';
  createdAt: number;
}

export interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmed' | 'cancelled';
}

export interface LotteryUpload {
  id: string;
  imageUrl: string;
  status: 'pending' | 'verified';
  uploadDate: number;
}
