export enum OrderStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export type Order = {
  id: string;
  productIds: string[];
  userId: string;
  currency: string;
  totalItems: number;
  totalPrice: number;
  paid: boolean;
  paymentTransaction: string | null;
  status: OrderStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemWithName = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
};

export type OrderWithItems = Order & {
  OrderItems: {
    productId: string;
    quantity: number;
    price: number;
  }[];
};

export type OrderWithItemNames = Order & {
  OrderItems: OrderItemWithName[];
};
