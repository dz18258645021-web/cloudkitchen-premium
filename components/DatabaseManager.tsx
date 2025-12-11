import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { dishAPI, orderAPI, reservationAPI } from '../lib/database';
import { MOCK_DISHES } from '../constants';

interface DatabaseManagerProps {
  onClose: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    dishes: 0,
    orders: 0,
    reservations: 0
  });

  const loadStats = async () => {
    try {
      const [dishes, orders, reservations] = await Promise.all([
        dishAPI.getAll(),
        orderAPI.getAll(),
        reservationAPI.getAll()
      ]);
      
      setStats({
        dishes: dishes.length,
        orders: orders.length,
        reservations: reservations.length
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const initializeDatabase = async () => {
    setIsLoading(true);
    setStatus('loading');
    setMessage('正在初始化数据库...');

    try {
      // 检查是否已有菜品数据
      const existingDishes = await dishAPI.getAll();
      
      if (existingDishes.length === 0) {
        // 导入示例菜品数据
        setMessage('正在导入示例菜品数据...');
        for (const dish of MOCK_DISHES) {
          await dishAPI.create({
            name: dish.name,
            price: dish.price,
            category: dish.category,
            image: dish.image,
            description: dish.description,
            spiciness: dish.spiciness || 0,
            isSoldOut: dish.isSoldOut,
            sales: dish.sales
          });
        }
      }

      setStatus('success');
      setMessage('数据库初始化成功！');
      await loadStats();
    } catch (error) {
      setStatus('error');
      setMessage(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setStatus('loading');
    setMessage('正在测试数据库连接...');

    try {
      await dishAPI.getAll();
      setStatus('success');
      setMessage('数据库连接正常！');
      await loadStats();
    } catch (error) {
      setStatus('error');
      setMessage(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="text-primary" size={24} />
            <h2 className="text-xl font-bold dark:text-white">数据库管理</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            ×
          </button>
        </div>

        {/* 数据库统计 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary">{stats.dishes}</div>
            <div className="text-xs text-gray-500">菜品</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.orders}</div>
            <div className="text-xs text-gray-500">订单</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-500">{stats.reservations}</div>
            <div className="text-xs text-gray-500">预约</div>
          </div>
        </div>

        {/* 状态显示 */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
            status === 'loading' ? 'bg-blue-50 text-blue-700' :
            status === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {status === 'loading' && <Loader2 className="animate-spin" size={20} />}
            {status === 'success' && <CheckCircle size={20} />}
            {status === 'error' && <AlertCircle size={20} />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            测试连接
          </button>
          
          <button
            onClick={initializeDatabase}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Database size={18} />
            初始化数据库
          </button>
        </div>

        {/* 配置说明 */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">配置说明</h3>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>1. 在 Supabase 创建新项目</p>
            <p>2. 在 SQL 编辑器中运行 scripts/init-database.sql</p>
            <p>3. 更新 .env.local 中的数据库配置</p>
            <p>4. 点击"测试连接"验证配置</p>
          </div>
        </div>
      </div>
    </div>
  );
};