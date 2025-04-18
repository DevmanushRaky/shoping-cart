export interface Product {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: number
  userId: string
  items: CartItem[]
  total: number
  createdAt: string
}
