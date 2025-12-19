import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChefHat, ClipboardList, UtensilsCrossed, Bell, Plus, Trash2, LogOut, 
  Home, Calendar, User as UserIcon, ShoppingCart, MessageSquare, Search, 
  ChevronLeft, Minus, X, Sun, Moon, Sparkles, Send, Check, Loader2,
  CreditCard, Wallet, ArrowRight, Camera, UploadCloud, Image as ImageIcon,
  Database, Settings
} from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Dish, Order, User, UserRole, CartItem, Reservation, DishCategory } from './types';
import { MOCK_DISHES } from './constants';
import { FloatingCart } from './components/FloatingCart';
import { DatabaseManager } from './components/DatabaseManager';
import { useDatabase } from './hooks/useDatabase';

// --- Shared UI Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = ({ className = '', variant = 'primary', ...props }) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30",
        secondary: "bg-primary-light text-primary-dark hover:bg-green-200",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200 dark:shadow-none"
    };
    return (
        <button 
            className={`px-4 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
            {...props}
        />
    );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow dark:text-white"
    {...props}
  />
);

const NavBar: React.FC<{ user: User; darkMode: boolean; toggleDarkMode: () => void }> = ({ user, darkMode, toggleDarkMode }) => (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date().getHours() < 12 ? '早上好' : '晚上好'}</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
            {user.nickname} {user.role === 'chef' && <ChefHat size={16} className="text-primary" />}
            </span>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" />
        </div>
    </div>
);

const NavLink: React.FC<{ to: string; icon: React.FC<any>; label: string; badge?: number }> = ({ to, icon: Icon, label, badge }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`flex flex-col items-center gap-1 transition-colors w-16 group relative`}>
            {badge ? (
                <div className="absolute top-0 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                    {badge > 9 ? '9+' : badge}
                </div>
            ) : null}
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                 <Icon size={24} className={isActive ? "text-primary fill-primary/20" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"} />
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
        </Link>
    );
};

// --- Modals ---

const AddDishModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (d: Omit<Dish, 'id'>) => Promise<void> }> = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        name: '',
        price: '',
        category: DishCategory.MEAT,
        image: '',
        description: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 z-10 animate-fade-in-up shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">上架新菜品</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="dark:text-white" /></button>
                </div>
                
                <div className="space-y-4">
                    {/* Image Upload Area */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 rounded-2xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                    >
                        {form.image ? (
                            <img src={form.image} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                                <Camera size={32} className="mb-2" />
                                <span className="text-xs font-bold">点击上传图片</span>
                            </div>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">菜品名称</label>
                        <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="例如: 宫保鸡丁" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">价格 (¥)</label>
                            <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">分类</label>
                            <select 
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow dark:text-white appearance-none"
                                value={form.category} 
                                onChange={e => setForm({...form, category: e.target.value as DishCategory})}
                            >
                                {Object.values(DishCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">描述</label>
                        <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="简单的口味描述..." />
                    </div>

                    <Button onClick={async () => {
                        if (!form.name || !form.price) return;
                        try {
                            await onAdd({
                                name: form.name,
                                price: parseFloat(form.price),
                                category: form.category as DishCategory,
                                image: form.image || `https://source.unsplash.com/random/300x300/?food`,
                                description: form.description,
                                sales: 0,
                                isSoldOut: false,
                                spiciness: 0
                            });
                            onClose();
                            setForm({ name: '', price: '', category: DishCategory.MEAT, image: '', description: '' });
                        } catch (error) {
                            console.error('添加菜品失败:', error);
                            alert('添加菜品失败，请重试');
                        }
                    }} className="w-full py-3 mt-4">确认上架</Button>
                </div>
            </div>
        </div>
    );
};

const CartModal: React.FC<{ isOpen: boolean; onClose: () => void; cart: CartItem[]; updateQuantity: (id: number, delta: number) => void; onCheckout: () => void }> = ({ isOpen, onClose, cart, updateQuantity, onCheckout }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-fade-in-up max-h-[80vh] flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">购物车 ({cart.reduce((a,b) => a+b.quantity, 0)})</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 no-scrollbar">
                    {cart.length === 0 ? <div className="text-center text-gray-400 py-8">空空如也</div> : cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                                <div>
                                    <h4 className="font-bold dark:text-white">{item.name}</h4>
                                    <span className="text-primary font-bold">¥{item.price}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-full px-2 py-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-full hover:bg-white dark:hover:bg-gray-600 dark:text-white transition-colors"><Minus size={14} /></button>
                                <span className="font-bold w-4 text-center dark:text-white text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-primary text-white rounded-full shadow-sm"><Plus size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500 text-sm">合计</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">¥{cart.reduce((a,b)=>a+b.price*b.quantity,0).toFixed(2)}</span>
                    </div>
                    <Button disabled={cart.length === 0} onClick={onCheckout} className="w-full py-4 text-lg">去结算</Button>
                </div>
            </div>
        </div>
    );
};

const AiAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void; cart: CartItem[]; menu: Dish[] }> = ({ isOpen, onClose, menu }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const menuText = menu.map(d => `- ${d.name} (${d.category}): ¥${d.price}`).join('\n');
             chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are a friendly restaurant AI assistant. Here is the menu:\n${menuText}\nRecommend dishes based on user preferences. Keep answers short and appetizing.`
                }
             });
             setMessages([{role: 'model', text: '你好！我是您的专属点餐顾问，今天想吃点什么口味的菜品呢？'}]);
        }
    }, [isOpen, menu]);

    const handleSend = async () => {
        if (!input.trim() || loading || !chatRef.current) return;
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);
        try {
            const response = await chatRef.current.sendMessage({ message: userText });
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: '抱歉，我稍微有点走神，请再说一次。' }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
             <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden h-[600px] flex flex-col z-10 animate-fade-in-up">
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} />
                        <span className="font-bold">AI 点餐顾问</span>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-tl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                         <div className="flex justify-start">
                             <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-sm flex gap-2 items-center text-xs text-gray-500">
                                 <Loader2 size={14} className="animate-spin" />
                                 思考中...
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex gap-2">
                    <input 
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none dark:text-white"
                        placeholder="推荐一道不辣的荤菜..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={loading} className="bg-primary text-white p-2 rounded-full disabled:opacity-50">
                        <ArrowRight size={20} />
                    </button>
                </div>
             </div>
        </div>
    );
};

const FloatingAi: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="fixed bottom-32 right-4 z-40 bg-gradient-to-tr from-primary to-emerald-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform animate-bounce-slow"
    >
        <Sparkles size={24} />
    </button>
);

// --- Pages ---

const LoginScreen: React.FC<{ onLogin: (role: UserRole, name: string) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleChefLogin = () => {
    if (pin === '1234') {
        onLogin('chef', '主厨大人');
    } else {
        setError('访问密码错误 (提示: 1234)');
    }
  };

  return (
    <div className="min-h-screen bg-[#006241] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#004f32] to-[#006241] z-0" />
      
      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        <div className="text-center mb-10">
            <div className="bg-white/10 backdrop-blur-md w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
                <ChefHat size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">CloudKitchen</h1>
            <p className="text-white/70 text-sm font-light">尊享云端餐饮体验</p>
        </div>

        {!role ? (
            <div className="space-y-4">
                <button 
                    onClick={() => setRole('guest')}
                    className="w-full bg-white p-6 rounded-3xl shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full text-primary">
                            <UserIcon size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800">我是顾客</h3>
                            <p className="text-xs text-gray-500">点餐、预约、享受美食</p>
                        </div>
                    </div>
                    <ChevronLeft className="text-gray-300 group-hover:text-primary transition-colors rotate-180" />
                </button>

                <button 
                     onClick={() => setRole('chef')}
                     className="w-full bg-[#004f32] border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-full text-white">
                            <ChefHat size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-white">我是员工</h3>
                            <p className="text-xs text-white/50">后厨管理、订单处理</p>
                        </div>
                    </div>
                    <ChevronLeft className="text-white/30 group-hover:text-white transition-colors rotate-180" />
                </button>
            </div>
        ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl animate-fade-in-up">
                <button onClick={() => { setRole(null); setError(''); }} className="flex items-center gap-1 text-gray-400 text-xs mb-6 hover:text-gray-600">
                    <ChevronLeft size={14} /> 返回身份选择
                </button>

                <h2 className="text-xl font-bold mb-6 text-gray-800">
                    {role === 'guest' ? '欢迎光临' : '员工通道'}
                </h2>

                {role === 'guest' ? (
                    <div className="space-y-4">
                        <div>
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">您的称呼</label>
                             <Input 
                                placeholder="请输入昵称" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                autoFocus
                             />
                        </div>
                        <Button className="w-full py-4 mt-2" onClick={() => onLogin('guest', name || '美食家')}>
                            开启美食之旅
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">访问密码</label>
                             <Input 
                                type="password" 
                                placeholder="" 
                                value={pin} 
                                onChange={e => { setPin(e.target.value); setError(''); }}
                                maxLength={4}
                                className="font-bold"
                             />
                             {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                        </div>
                        <Button className="w-full py-4 mt-2" onClick={handleChefLogin}>
                            进入工作台
                        </Button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

const MenuView: React.FC<{ dishes: Dish[]; cart: CartItem[]; addToCart: (d: Dish) => void }> = ({ dishes, cart, addToCart }) => {
    const [category, setCategory] = useState<DishCategory | 'ALL'>('ALL');
    const filtered = category === 'ALL' ? dishes : dishes.filter(d => d.category === category);
    
    return (
        <div className="pb-32 animate-fade-in">
            <div className="px-6 py-4 overflow-x-auto flex gap-3 no-scrollbar sticky top-[73px] z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm transition-colors">
                <button 
                    onClick={() => setCategory('ALL')}
                    className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${category === 'ALL' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm'}`}
                >
                    全部
                </button>
                {Object.values(DishCategory).map(c => (
                     <button 
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${category === c ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <div className="px-6 space-y-6">
                {filtered.map(dish => {
                    const count = cart.find(c => c.id === dish.id)?.quantity || 0;
                    return (
                    <div key={dish.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm flex gap-4 transition-colors">
                        <img src={dish.image} alt={dish.name} className="w-28 h-28 rounded-2xl object-cover bg-gray-100" />
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">{dish.name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2">{dish.description || '主厨精心烹饪的美味佳肴，选用上等食材...'}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-xl dark:text-white">¥{dish.price}</span>
                                <div className="flex items-center gap-2">
                                    {count > 0 && <span className="text-sm font-bold dark:text-white">x{count}</span>}
                                    <button 
                                        onClick={() => addToCart(dish)}
                                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
};

const ReservationView: React.FC<{ reservations: Reservation[]; addReservation: (r: Omit<Reservation, 'id'>) => Promise<void> }> = ({ reservations, addReservation }) => {
    const [form, setForm] = useState({ date: '', time: '', guests: 2, name: '' });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if(!form.date || !form.time) return;
        try {
            const newRes: Omit<Reservation, 'id'> = {
                ...form,
                status: 'confirmed'
            };
            await addReservation(newRes);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setForm({ date: '', time: '', guests: 2, name: '' });
        } catch (error) {
            console.error('创建预约失败:', error);
            alert('预约失败，请重试');
        }
    };

    return (
        <div className="p-6 pb-24 animate-fade-in-up">
             <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-primary/30">
                <h2 className="text-2xl font-bold mb-2">在线预订</h2>
                <p className="opacity-90 text-sm">提前预约，尊享优先就餐体验</p>
             </div>
             
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">姓名</label>
                    <Input placeholder="预订人姓名" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">日期</label>
                    <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                    </div>
                    <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">时间</label>
                    <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">人数: {form.guests}人</label>
                    <input 
                        type="range" min="1" max="20" 
                        value={form.guests} 
                        onChange={e => setForm({...form, guests: parseInt(e.target.value)})}
                        className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <Button onClick={handleSubmit} className="w-full py-3 mt-2">
                    确认预订
                </Button>
                </div>
             </div>

             {success && (
                <div className="fixed top-24 left-6 right-6 bg-primary text-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
                <Check size={20} />
                <span>预订成功！</span>
                </div>
            )}

             <h3 className="font-bold mb-4 px-2 dark:text-white">我的预约</h3>
             {reservations.length === 0 ? <p className="text-gray-400 text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">暂无预约</p> : (
                 <div className="space-y-4">
                     {reservations.map(r => (
                         <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                             <div>
                                <div className="font-bold dark:text-white text-lg">{r.date} {r.time}</div>
                                <div className="text-gray-500 text-sm">{r.guests} 位宾客 • {r.name}</div>
                             </div>
                             <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">已确认</span>
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );
};

const ChefReservationList: React.FC<{ reservations: Reservation[] }> = ({ reservations }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">预订管理</h2>
        {reservations.length === 0 ? <p className="text-gray-400 text-center py-8">今日暂无预订</p> : reservations.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex justify-between items-center mb-2">
                    <div className="font-bold dark:text-white text-lg">{r.name}</div>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">已确认</span>
                 </div>
                 <div className="text-gray-500 text-sm flex gap-4">
                     <span>📅 {r.date}</span>
                     <span>⏰ {r.time}</span>
                     <span>👥 {r.guests}人</span>
                 </div>
            </div>
        ))}
    </div>
);

const OrderListView: React.FC<{ history: Order[]; onUpdateStatus?: (id: string, status: Order['status']) => void }> = ({ history, onUpdateStatus }) => (
    <div className="p-6 pb-24">
         <h2 className="text-2xl font-bold mb-6 dark:text-white">订单记录</h2>
         {history.length === 0 && <p className="text-gray-400 text-center py-10">暂无历史订单</p>}
         <div className="space-y-4">
             {history.map(order => (
                 <div key={order.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex justify-between items-center mb-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                         <div className="flex flex-col">
                            <span className="font-bold text-lg dark:text-white">{order.userName}</span>
                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                         </div>
                         <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                             order.status === 'pending' ? 'bg-red-100 text-red-600' :
                             order.status === 'cooking' ? 'bg-orange-100 text-orange-600' :
                             order.status === 'ready' ? 'bg-green-100 text-green-600' :
                             'bg-gray-100 text-gray-600'
                         }`}>
                             {order.status === 'pending' ? '待接单' : order.status === 'cooking' ? '制作中' : order.status === 'ready' ? '待取餐' : '已完成'}
                         </span>
                     </div>
                     <div className="space-y-2 mb-4">
                         {order.items.map((item,i) => (
                             <div key={i} className="flex justify-between text-sm dark:text-gray-300">
                                 <div className="flex items-center gap-2">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 rounded text-xs font-bold">x{item.quantity}</span>
                                    <span>{item.name}</span>
                                 </div>
                                 <span>¥{item.price * item.quantity}</span>
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-between items-center font-bold dark:text-white mb-4">
                         <span>合计</span>
                         <span className="text-lg">¥{order.totalAmount.toFixed(2)}</span>
                     </div>
                     
                     {/* Chef Actions */}
                     {onUpdateStatus && order.status !== 'completed' && (
                         <div className="grid grid-cols-1 gap-2">
                             {order.status === 'pending' && (
                                 <Button onClick={() => onUpdateStatus(order.id, 'cooking')} className="w-full py-2 text-sm bg-primary">
                                     接单 / 开始制作
                                 </Button>
                             )}
                             {order.status === 'cooking' && (
                                 <Button onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full py-2 text-sm bg-orange-500 hover:bg-orange-600">
                                     制作完成 / 通知取餐
                                 </Button>
                             )}
                             {order.status === 'ready' && (
                                 <Button onClick={() => onUpdateStatus(order.id, 'completed')} className="w-full py-2 text-sm bg-green-600 hover:bg-green-700">
                                     确认已送达
                                 </Button>
                             )}
                         </div>
                     )}
                 </div>
             ))}
         </div>
    </div>
);

const CheckoutView: React.FC<{ cart: CartItem[]; onBack: () => void; onConfirm: () => void }> = ({ cart, onBack, onConfirm }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onConfirm(); 
            }, 2000);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center text-white animate-fade-in-up">
                <div className="bg-white/20 p-6 rounded-full mb-6 animate-bounce">
                    <Check size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-2">支付成功!</h2>
                <p className="opacity-80">后厨正在为您准备美食...</p>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold dark:text-white">确认订单</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-primary" /> 就餐方式
                </h3>
                <div className="flex gap-4">
                    <button className="flex-1 bg-primary/10 border border-primary text-primary py-3 rounded-xl font-bold text-sm">堂食</button>
                    <button className="flex-1 bg-gray-50 dark:bg-gray-700 border border-transparent text-gray-500 dark:text-gray-300 py-3 rounded-xl font-bold text-sm">打包</button>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl space-y-4 mb-6">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                                <h4 className="font-bold dark:text-white text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-400">x{item.quantity}</p>
                            </div>
                        </div>
                        <span className="font-bold dark:text-white">¥{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                    <Wallet size={18} className="text-primary" /> 支付方式
                </h3>
                <div className="flex items-center justify-between p-3 border border-primary bg-primary/5 rounded-xl mb-2">
                    <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#09BB07] rounded-lg flex items-center justify-center text-white">
                            <CreditCard size={18} />
                            </div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">微信支付</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-4 border-primary"></div>
                </div>
            </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400">总计金额</span>
                <span className="text-3xl font-black dark:text-white">¥{cart.reduce((a,b)=>a+b.price*b.quantity,0).toFixed(2)}</span>
            </div>
            <Button onClick={handlePay} disabled={isProcessing} className="w-full py-4 text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : '立即支付'}
            </Button>
        </div>
    </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  
  // 使用数据库 Hook
  const {
    dishes,
    orders,
    reservations,
    loading: dbLoading,
    error: dbError,
    addDish,
    updateDish,
    deleteDish,
    createOrder,
    updateOrderStatus,
    createReservation,
    updateReservationStatus,
    getOrCreateUser,
    clearError
  } = useDatabase();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogin = async (role: UserRole, nickname: string) => {
    try {
      const userData = {
        nickname,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
        role,
        points: 100
      };
      
      const user = await getOrCreateUser(userData);
      setUser(user);
    } catch (error) {
      console.error('登录失败:', error);
      // 如果数据库连接失败，使用本地数据
      setUser({
        id: Date.now(),
        nickname,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
        role,
        points: 100,
        totalSpend: 0,
        orderCount: 0
      });
    }
  };

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) {
        return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    if(cart.length === 0) return;
    setShowCheckout(true);
    setIsCartOpen(false);
  };

  const confirmOrder = async () => {
    if (!user) return;
    
    try {
      const orderData = {
        userId: user.id,
        userName: user.nickname,
        items: cart,
        totalAmount: cart.reduce((a,b) => a + b.price * b.quantity, 0)
      };
      
      await createOrder(orderData);
      setCart([]);
      setShowCheckout(false);
    } catch (error) {
      console.error('创建订单失败:', error);
      // 如果数据库操作失败，显示错误信息
      alert('订单创建失败，请重试');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态失败，请重试');
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (showCheckout) {
      return <CheckoutView cart={cart} onBack={() => setShowCheckout(false)} onConfirm={confirmOrder} />;
  }

  return (
    <HashRouter>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20`}>
        <NavBar user={user} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        
        <Routes>
          <Route path="/" element={
             user.role === 'chef' ? (
                 <div className="p-6 pb-24 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">菜单管理</h2>
                        <div className="flex gap-2">
                            {/* <Button onClick={() => setShowDatabaseManager(true)} variant="outline" className="py-2 px-4 rounded-full text-sm">
                                <Database size={16} /> 数据库
                            </Button> */}
                            <Button onClick={() => setIsAddDishOpen(true)} className="py-2 px-4 rounded-full text-sm">
                                <Plus size={16} /> 上架新菜
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {dishes.map(d => (
                            <div key={d.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex gap-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <img src={d.image} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                                <div className="flex-1">
                                    <h3 className="font-bold dark:text-white">{d.name}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{d.description}</p>
                                    <div className="flex justify-between mt-2 items-center">
                                        <span className="text-primary font-bold">¥{d.price}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">销量 {d.sales}</span>
                                            <button 
                                                onClick={async () => {
                                                    if (confirm('确定要删除这道菜品吗？')) {
                                                        try {
                                                            await deleteDish(d.id);
                                                        } catch (error) {
                                                            console.error('删除菜品失败:', error);
                                                            alert('删除失败，请重试');
                                                        }
                                                    }
                                                }}
                                                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             ) : (
                <MenuView dishes={dishes} cart={cart} addToCart={addToCart} />
             )
          } />
          <Route path="/orders" element={
              user.role === 'chef' ? (
                <div className="p-6">
                     <h2 className="text-2xl font-bold mb-6 dark:text-white">厨师订单看板</h2>
                     <OrderListView history={orders} onUpdateStatus={handleUpdateOrderStatus} />
                </div>
              ) : <OrderListView history={orders} />
          } />
          <Route path="/reservations" element={
              user.role === 'chef' ? <ChefReservationList reservations={reservations} /> : <ReservationView reservations={reservations} addReservation={createReservation} />
          } />
          <Route path="/profile" element={
              <div className="p-6 text-center animate-fade-in-up">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                    <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-50 dark:border-gray-700 shadow-xl" />
                    <h2 className="text-2xl font-bold dark:text-white mb-1">{user.nickname}</h2>
                    <p className="text-primary font-bold mb-8 bg-primary/10 inline-block px-4 py-1 rounded-full text-sm">
                        {user.role === 'guest' ? '尊贵会员' : '金牌大厨'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">积分</div>
                            <div className="text-xl font-black dark:text-white">{user.points}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">订单</div>
                            <div className="text-xl font-black dark:text-white">{orders.filter(o => o.userId === user.id).length}</div>
                        </div>
                    </div>

                    <Button variant="danger" onClick={() => setUser(null)} className="w-full py-4">
                        <LogOut size={18} /> 退出登录
                    </Button>
                  </div>
              </div>
          } />
        </Routes>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-2 pb-safe flex justify-around items-center z-30">
           <NavLink to="/" icon={user.role === 'chef' ? ClipboardList : Home} label={user.role === 'chef' ? '菜单' : '首页'} />
           <NavLink 
                to="/orders" 
                icon={UtensilsCrossed} 
                label="订单" 
                badge={user.role === 'chef' ? pendingOrdersCount : 0} 
           />
           <NavLink to="/reservations" icon={Calendar} label="预约" />
           <NavLink to="/profile" icon={UserIcon} label="我的" />
        </div>

        {/* Floating Elements for Guest */}
        {user.role === 'guest' && !showCheckout && (
            <>
                <FloatingCart 
                    count={cart.reduce((a,b) => a+b.quantity, 0)} 
                    total={cart.reduce((a,b) => a+b.price*b.quantity, 0)}
                    onViewCart={() => setIsCartOpen(true)}
                    onCheckout={handleCheckout}
                />
                <FloatingAi onClick={() => setIsAiOpen(true)} />
            </>
        )}

        {/* Global Modals */}
        <CartModal 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart} 
            updateQuantity={updateCartQuantity}
            onCheckout={handleCheckout}
        />
        <AiAssistantModal 
            isOpen={isAiOpen} 
            onClose={() => setIsAiOpen(false)} 
            cart={cart}
            menu={dishes}
        />
        <AddDishModal 
            isOpen={isAddDishOpen} 
            onClose={() => setIsAddDishOpen(false)} 
            onAdd={addDish} 
        />
        
        {/* 数据库管理器 */}
        {showDatabaseManager && (
            <DatabaseManager onClose={() => setShowDatabaseManager(false)} />
        )}
        
        {/* 数据库错误提示 */}
        {dbError && (
            <div className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-xl shadow-xl flex items-center justify-between">
                <span className="text-sm">{dbError}</span>
                <button onClick={clearError} className="ml-4 text-white hover:text-gray-200">
                    <X size={16} />
                </button>
            </div>
        )}
        
        {/* 数据加载指示器 */}
        {dbLoading && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">加载中...</span>
            </div>
        )}
      </div>
    </HashRouter>
  );
};

export default App;