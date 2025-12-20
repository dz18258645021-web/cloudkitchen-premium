import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sgkvrdqptqabfpeqonwp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_wH3Pa7V2Tcl4FeED8BxtkA_PFCCe6kC'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表结构定义
export interface DatabaseDish {
  id: number
  name: string
  price: number
  category: string
  image_url: string
  description?: string
  spiciness: number
  is_sold_out: boolean
  sales: number
  created_at: string
  updated_at: string
}

export interface DatabaseOrder {
  id: string
  user_id: string | null // 可以是字符串或 null
  user_name: string
  items: any[] // JSON 格式的订单项
  total_amount: number
  status: 'pending' | 'cooking' | 'ready' | 'completed'
  created_at: string
  updated_at: string
}

export interface DatabaseReservation {
  id: string
  name: string
  date: string
  time: string
  guests: number
  status: 'confirmed' | 'cancelled'
  created_at: string
}

export interface DatabaseUser {
  id: string
  nickname: string
  avatar_url: string
  role: 'guest' | 'chef'
  points: number
  total_spend: number
  order_count: number
  created_at: string
}