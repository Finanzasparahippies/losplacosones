'use client';

import { useState, useEffect, useRef } from 'react';
import { fetcher } from '@/lib/api';

export interface Notification {
  id: number;
  message: string;
  type: 'ORDER' | 'SYSTEM';
  timestamp: Date;
  orderId?: number;
  address?: string;
  lat?: number;
  lng?: number;
}

export function useNotifications(isAdmin: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastOrderId = useRef<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const pollOrders = async () => {
      try {
        const orders = await fetcher('/shop/orders/');
        if (orders.length > 0) {
          const latestOrder = orders[0];
          
          if (lastOrderId.current !== null && latestOrder.id > lastOrderId.current) {
            // New order detected!
            const newNotif: Notification = {
              id: Date.now(),
              message: `¡Nuevo pedido! #${latestOrder.id}`,
              type: 'ORDER',
              timestamp: new Date(),
              orderId: latestOrder.id,
              address: latestOrder.delivery_address,
              lat: latestOrder.latitude,
              lng: latestOrder.longitude
            };
            setNotifications(prev => [newNotif, ...prev]);
            
            // Play a sound if possible
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          }
          
          lastOrderId.current = latestOrder.id;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Initialize lastOrderId
    pollOrders();

    const interval = setInterval(pollOrders, 5000); // Poll every 5 seconds for near real-time
    return () => clearInterval(interval);
  }, [isAdmin]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, removeNotification };
}
