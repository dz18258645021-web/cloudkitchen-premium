// 模拟数据库 - 用于演示和开发
import { Dish, Order, Reservation, User } from '../types';
import { MOCK_DISHES } from '../constants';

// 模拟数据存储
let mockDishes: Dish[] = [...MOCK_DISHES];
let mockOrders: Order[] = [];
let mockReservations: Reservation[] = [];
let mockUsers: User[] = [];

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 生成 ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const mockDishAPI = {
  async getAll(): Promise<Dish[]> {
    await delay(300);
    return [...mockDishes];
  },

  async create(dish: Omit<Dish, 'id'>): Promise<Dish> {
    await delay(500);
    const newDish: Dish = {
      ...dish,
      id: Date.now()
    };
    mockDishes = [newDish, ...mockDishes];
    return newDish;
  },

  async update(id: number, updates: Partial<Dish>): Promise<Dish> {
    await delay(300);
    const index = mockDishes.findIndex(d => d.id === id);
    if (index === -1) throw new Error('菜品不存在');
    
    mockDishes[index] = { ...mockDishes[index], ...updates };
    return mockDishes[index];
  },

  async delete(id: number): Promise<void> {
    await delay(300);
    mockDishes = mockDishes.filter(d => d.id !== id);
  },

  async updateSales(id: number, increment: number = 1): Promise<void> {
    await delay(200);
    const dish = mockDishes.find(d => d.id === id);
    if (dish) {
      dish.sales += increment;
    }
  }
};

export const mockOrderAPI = {
  async getAll(): Promise<Order[]> {
    await delay(300);
    return [...mockOrders];
  },

  async getByUser(userId: number): Promise<Order[]> {
    await delay(300);
    return mockOrders.filter(o => o.userId === userId);
  },

  async create(order: Omit<Order, 'id'>): Promise<Order> {
    await delay(500);
    const newOrder: Order = {
      ...order,
      id: generateId()
    };
    mockOrders = [newOrder, ...mockOrders];
    return newOrder;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    await delay(300);
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('订单不存在');
    
    mockOrders[index] = { ...mockOrders[index], status };
    return mockOrders[index];
  },

  subscribeToOrders(callback: (orders: Order[]) => void) {
    // 模拟实时更新
    const interval = setInterval(() => {
      callback([...mockOrders]);
    }, 5000);
    
    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
};

export const mockReservationAPI = {
  async getAll(): Promise<Reservation[]> {
    await delay(300);
    return [...mockReservations];
  },

  async create(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    await delay(500);
    const newReservation: Reservation = {
      ...reservation,
      id: generateId()
    };
    mockReservations = [newReservation, ...mockReservations];
    return newReservation;
  },

  async updateStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    await delay(300);
    const index = mockReservations.findIndex(r => r.id === id);
    if (index === -1) throw new Error('预约不存在');
    
    mockReservations[index] = { ...mockReservations[index], status };
    return mockReservations[index];
  }
};

export const mockUserAPI = {
  async getOrCreate(userData: Omit<User, 'id' | 'totalSpend' | 'orderCount'>): Promise<User> {
    await delay(300);
    
    // 查找现有用户
    let user = mockUsers.find(u => u.nickname === userData.nickname);
    
    if (!user) {
      // 创建新用户
      user = {
        ...userData,
        id: Date.now(),
        totalSpend: 0,
        orderCount: 0
      };
      mockUsers.push(user);
    }
    
    return user;
  },

  async updateStats(userId: number, totalSpend: number): Promise<void> {
    await delay(200);
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.totalSpend !== undefined && user.orderCount !== undefined) {
      user.totalSpend += totalSpend;
      user.orderCount += 1;
      user.points += Math.floor(totalSpend);
    }
  }
};