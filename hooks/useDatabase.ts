import { useState, useEffect, useCallback } from 'react';
import { dishAPI, orderAPI, reservationAPI, userAPI } from '../lib/database';
import { Dish, Order, Reservation, User, CartItem } from '../types';

export const useDatabase = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载所有数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dishesData, ordersData, reservationsData] = await Promise.all([
        dishAPI.getAll(),
        orderAPI.getAll(),
        reservationAPI.getAll()
      ]);
      
      setDishes(dishesData);
      setOrders(ordersData);
      setReservations(reservationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化数据加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 设置实时订单监听
  useEffect(() => {
    const subscription = orderAPI.subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 菜品操作
  const addDish = useCallback(async (dish: Omit<Dish, 'id'>) => {
    try {
      const newDish = await dishAPI.create(dish);
      setDishes(prev => [newDish, ...prev]);
      return newDish;
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加菜品失败');
      throw err;
    }
  }, []);

  const updateDish = useCallback(async (id: number, updates: Partial<Dish>) => {
    try {
      const updatedDish = await dishAPI.update(id, updates);
      setDishes(prev => prev.map(d => d.id === id ? updatedDish : d));
      return updatedDish;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新菜品失败');
      throw err;
    }
  }, []);

  const deleteDish = useCallback(async (id: number) => {
    try {
      await dishAPI.delete(id);
      setDishes(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除菜品失败');
      throw err;
    }
  }, []);

  // 订单操作
  const createOrder = useCallback(async (orderData: {
    userId: number;
    userName: string;
    items: CartItem[];
    totalAmount: number;
  }) => {
    try {
      const newOrder = await orderAPI.create({
        ...orderData,
        status: 'pending',
        createdAt: Date.now()
      });
      
      // 更新菜品销量
      for (const item of orderData.items) {
        await dishAPI.updateSales(item.id, item.quantity);
      }
      
      // 更新用户统计
      await userAPI.updateStats(orderData.userId, orderData.totalAmount);
      
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败');
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新订单状态失败');
      throw err;
    }
  }, []);

  // 预约操作
  const createReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
    try {
      const newReservation = await reservationAPI.create(reservation);
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建预约失败');
      throw err;
    }
  }, []);

  const updateReservationStatus = useCallback(async (id: string, status: Reservation['status']) => {
    try {
      const updatedReservation = await reservationAPI.updateStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? updatedReservation : r));
      return updatedReservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新预约状态失败');
      throw err;
    }
  }, []);

  // 用户操作
  const getOrCreateUser = useCallback(async (userData: Omit<User, 'id' | 'totalSpend' | 'orderCount'>) => {
    try {
      return await userAPI.getOrCreate(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '用户操作失败');
      throw err;
    }
  }, []);

  return {
    // 数据
    dishes,
    orders,
    reservations,
    loading,
    error,
    
    // 操作
    loadData,
    addDish,
    updateDish,
    deleteDish,
    createOrder,
    updateOrderStatus,
    createReservation,
    updateReservationStatus,
    getOrCreateUser,
    
    // 清除错误
    clearError: () => setError(null)
  };
};