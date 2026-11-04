export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

export interface CommentItem {
  id?: string;
  productId: string;
  name: string;
  comment: string;
  rating: number; // 1 to 5
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Timestamp or ISO String
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
}
