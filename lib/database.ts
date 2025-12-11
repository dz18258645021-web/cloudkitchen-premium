import { supabase, DatabaseDish, DatabaseOrder, DatabaseReservation, DatabaseUser } from './supabase'
import { mockDishAPI, mockOrderAPI, mockReservationAPI, mockUserAPI } from './mockDatabase'
import { Dish, Order, Reservation, User, CartItem, DishCategory } from '../types'

// 检查是否配置了 Supabase
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';
};

// 测试 Supabase 连接
const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  
  try {
    const { error } = await supabase.from('dishes').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};

let useSupabase: boolean | null = null;

// 数据转换函数
const convertDishFromDB = (dbDish: DatabaseDish): Dish => ({
  id: dbDish.id,
  name: dbDish.name,
  price: dbDish.price,
  category: dbDish.category as DishCategory,
  image: dbDish.image_url,
  description: dbDish.description,
  spiciness: dbDish.spiciness,
  isSoldOut: dbDish.is_sold_out,
  sales: dbDish.sales
})

const convertDishToDB = (dish: Omit<Dish, 'id'>): Omit<DatabaseDish, 'id' | 'created_at' | 'updated_at'> => ({
  name: dish.name,
  price: dish.price,
  category: dish.category,
  image_url: dish.image,
  description: dish.description,
  spiciness: dish.spiciness || 0,
  is_sold_out: dish.isSoldOut,
  sales: dish.sales
})

const convertOrderFromDB = (dbOrder: DatabaseOrder): Order => ({
  id: dbOrder.id,
  userId: dbOrder.user_id ? (isNaN(parseInt(dbOrder.user_id)) ? 0 : parseInt(dbOrder.user_id)) : 0,
  userName: dbOrder.user_name,
  items: dbOrder.items as CartItem[],
  totalAmount: dbOrder.total_amount,
  status: dbOrder.status,
  createdAt: new Date(dbOrder.created_at).getTime()
})

const convertOrderToDB = (order: Omit<Order, 'id'>): Omit<DatabaseOrder, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: order.userId ? order.userId.toString() : null, // 将数字 ID 转换为字符串，或设为 null
  user_name: order.userName,
  items: order.items,
  total_amount: order.totalAmount,
  status: order.status
})

// 自动选择数据库实现
const getAPI = async () => {
  if (useSupabase === null) {
    useSupabase = await testSupabaseConnection();
  }
  return useSupabase;
};

// 菜品相关 API
export const dishAPI = {
  // 获取所有菜品
  async getAll(): Promise<Dish[]> {
    if (!(await getAPI())) {
      return mockDishAPI.getAll();
    }
    
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(convertDishFromDB) || []
  },

  // 添加新菜品
  async create(dish: Omit<Dish, 'id'>): Promise<Dish> {
    if (!(await getAPI())) {
      return mockDishAPI.create(dish);
    }
    
    const dishData = convertDishToDB(dish);
    
    const { data, error } = await supabase
      .from('dishes')
      .insert([dishData])
      .select()
      .single()
    
    if (error) throw error;
    return convertDishFromDB(data)
  },

  // 更新菜品
  async update(id: number, updates: Partial<Dish>): Promise<Dish> {
    if (!(await getAPI())) {
      return mockDishAPI.update(id, updates);
    }
    
    const { data, error } = await supabase
      .from('dishes')
      .update(convertDishToDB(updates as Dish))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertDishFromDB(data)
  },

  // 删除菜品
  async delete(id: number): Promise<void> {
    if (!(await getAPI())) {
      return mockDishAPI.delete(id);
    }
    
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // 更新销量
  async updateSales(id: number, increment: number = 1): Promise<void> {
    if (!(await getAPI())) {
      return mockDishAPI.updateSales(id, increment);
    }
    
    const { error } = await supabase.rpc('increment_dish_sales', {
      dish_id: id,
      increment_by: increment
    })
    
    if (error) throw error
  }
}

// 订单相关 API
export const orderAPI = {
  // 获取所有订单
  async getAll(): Promise<Order[]> {
    if (!(await getAPI())) {
      return mockOrderAPI.getAll();
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(convertOrderFromDB) || []
  },

  // 获取用户订单
  async getByUser(userId: number): Promise<Order[]> {
    if (!(await getAPI())) {
      return mockOrderAPI.getByUser(userId);
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId.toString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(convertOrderFromDB) || []
  },

  // 创建订单
  async create(order: Omit<Order, 'id'>): Promise<Order> {
    if (!(await getAPI())) {
      return mockOrderAPI.create(order);
    }
    
    try {
      const orderData = convertOrderToDB(order);
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()
      
      if (error) {
        throw new Error(`订单创建失败: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('订单创建失败: 未返回数据');
      }
      
      return convertOrderFromDB(data);
    } catch (err) {
      // 如果是我们抛出的错误，直接重新抛出
      if (err instanceof Error && err.message.includes('订单创建失败')) {
        throw err;
      }
      // 其他错误包装一下
      throw new Error(`订单创建异常: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  },

  // 更新订单状态
  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    if (!(await getAPI())) {
      return mockOrderAPI.updateStatus(id, status);
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return convertOrderFromDB(data)
  },

  // 实时订单监听
  subscribeToOrders(callback: (orders: Order[]) => void) {
    if (useSupabase === false) {
      return mockOrderAPI.subscribeToOrders(callback);
    }
    
    return supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const orders = await this.getAll()
          callback(orders)
        }
      )
      .subscribe()
  }
}

// 预约相关 API
export const reservationAPI = {
  // 获取所有预约
  async getAll(): Promise<Reservation[]> {
    if (!(await getAPI())) {
      return mockReservationAPI.getAll();
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 创建预约
  async create(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    if (!(await getAPI())) {
      return mockReservationAPI.create(reservation);
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservation])
      .select()
      .single()
    
    if (error) throw error;
    return data
  },

  // 更新预约状态
  async updateStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    if (!(await getAPI())) {
      return mockReservationAPI.updateStatus(id, status);
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 用户相关 API
export const userAPI = {
  // 获取或创建用户
  async getOrCreate(userData: Omit<User, 'id' | 'totalSpend' | 'orderCount'>): Promise<User> {
    if (!(await getAPI())) {
      return mockUserAPI.getOrCreate(userData);
    }
    
    // 先尝试根据昵称查找用户
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('nickname', userData.nickname)
      .single()
    
    if (existingUser) {
      return {
        id: parseInt(existingUser.id),
        nickname: existingUser.nickname,
        avatar: existingUser.avatar_url,
        role: existingUser.role,
        points: existingUser.points,
        totalSpend: existingUser.total_spend,
        orderCount: existingUser.order_count
      }
    }

    // 创建新用户
    const { data, error } = await supabase
      .from('users')
      .insert([{
        nickname: userData.nickname,
        avatar_url: userData.avatar,
        role: userData.role,
        points: userData.points,
        total_spend: 0,
        order_count: 0
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: parseInt(data.id),
      nickname: data.nickname,
      avatar: data.avatar_url,
      role: data.role,
      points: data.points,
      totalSpend: data.total_spend,
      orderCount: data.order_count
    }
  },

  // 更新用户统计
  async updateStats(userId: number, totalSpend: number): Promise<void> {
    if (!(await getAPI())) {
      return mockUserAPI.updateStats(userId, totalSpend);
    }
    
    // 暂时跳过用户统计更新，因为用户ID类型不匹配
    // TODO: 实现基于数字ID的用户统计更新
    return;
  }
}