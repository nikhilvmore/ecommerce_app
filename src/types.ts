export interface User {
  id: number;
  username: string;
  role: 'merchant' | 'customer';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  merchantId: number;
}
