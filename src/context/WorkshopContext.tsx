import React, { createContext, useContext, useState } from 'react';
import {
  RoleType,
  ServiceOrder,
  InventoryItem,
  WarehouseRequest,
  User,
  CashCut,
  Expense,
  POSReceipt,
  OSStatus,
  OSPart,
  OSLabor,
  OSEvidence
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_WAREHOUSE_REQUESTS,
  INITIAL_USERS,
  INITIAL_CASH_CUT,
  INITIAL_EXPENSES,
  INITIAL_POS_RECEIPTS
} from '../data/mockData';

interface WorkshopContextType {
  currentRole: RoleType | null;
  setCurrentRole: (role: RoleType | null) => void;
  
  // Orders
  orders: ServiceOrder[];
  addOrder: (newOrder: Omit<ServiceOrder, 'id' | 'trackingToken' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => ServiceOrder;
  updateOrderStatus: (orderId: string, newStatus: OSStatus) => void;
  updateOrderTechNotes: (orderId: string, notes: string) => void;
  updateOrderBudgetApproval: (orderId: string, approved: boolean) => void;
  addOrderPart: (orderId: string, part: Omit<OSPart, 'id'>) => void;
  addOrderLabor: (orderId: string, labor: Omit<OSLabor, 'id'>) => void;
  addOrderEvidence: (orderId: string, evidence: Omit<OSEvidence, 'id' | 'date'>) => void;
  liquidateOrderPayment: (orderId: string, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (itemId: string, deltaQuantity: number) => void;

  // Warehouse Requests
  warehouseRequests: WarehouseRequest[];
  addWarehouseRequest: (osId: string, itemCode: string, itemName: string, quantity: number, techName: string) => void;
  dispatchWarehouseRequest: (requestId: string) => void;

  // POS & Finance
  posReceipts: POSReceipt[];
  createPosSale: (cartItems: { item: InventoryItem; quantity: number }[], paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia', clientName?: string) => POSReceipt;
  cashCut: CashCut;
  closeCashCut: (actualCash: number, notes: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;

  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'status'>) => void;
  toggleUserStatus: (userId: string) => void;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null); // Null = Home Role Selector
  const [orders, setOrders] = useState<ServiceOrder[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [warehouseRequests, setWarehouseRequests] = useState<WarehouseRequest[]>(INITIAL_WAREHOUSE_REQUESTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cashCut, setCashCut] = useState<CashCut>(INITIAL_CASH_CUT);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [posReceipts, setPosReceipts] = useState<POSReceipt[]>(INITIAL_POS_RECEIPTS);

  // Helper to recalculate order total
  const recalculateOrderCost = (order: ServiceOrder): number => {
    const partsTotal = order.parts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const laborTotal = order.labor.reduce((sum, l) => sum + (l.hours * l.hourlyRate), 0);
    return partsTotal + laborTotal;
  };

  const addOrder = (newOrderData: Omit<ServiceOrder, 'id' | 'trackingToken' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => {
    const nextNum = 9283 + orders.length;
    const osId = `OS-${nextNum}`;
    const trackingToken = `${osId}-TRK`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const createdOrder: ServiceOrder = {
      ...newOrderData,
      id: osId,
      trackingToken,
      createdAt: now,
      updatedAt: now,
      paymentStatus: 'pendiente',
      estimatedCost: 0,
      clientApproved: null
    };

    createdOrder.estimatedCost = recalculateOrderCost(createdOrder);

    setOrders(prev => [createdOrder, ...prev]);
    return createdOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OSStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus, updatedAt: now };
      }
      return o;
    }));
  };

  const updateOrderTechNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, techNotes: notes } : o));
  };

  const updateOrderBudgetApproval = (orderId: string, approved: boolean) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          clientApproved: approved,
          updatedAt: now,
          parts: o.parts.map(p => ({ ...p, status: approved ? 'aprobado_cliente' : 'rechazado_cliente' })),
          labor: o.labor.map(l => ({ ...l, status: approved ? 'aprobado_cliente' : 'rechazado_cliente' }))
        };
      }
      return o;
    }));
  };

  const addOrderPart = (orderId: string, part: Omit<OSPart, 'id'>) => {
    const newPartId = `p-${Date.now()}`;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedParts = [...o.parts, { ...part, id: newPartId }];
        const updatedOrder = { ...o, parts: updatedParts };
        updatedOrder.estimatedCost = recalculateOrderCost(updatedOrder);
        return updatedOrder;
      }
      return o;
    }));
  };

  const addOrderLabor = (orderId: string, labor: Omit<OSLabor, 'id'>) => {
    const newLaborId = `l-${Date.now()}`;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedLabor = [...o.labor, { ...labor, id: newLaborId }];
        const updatedOrder = { ...o, labor: updatedLabor };
        updatedOrder.estimatedCost = recalculateOrderCost(updatedOrder);
        return updatedOrder;
      }
      return o;
    }));
  };

  const addOrderEvidence = (orderId: string, evidence: Omit<OSEvidence, 'id' | 'date'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newEv: OSEvidence = {
      ...evidence,
      id: `ev-${Date.now()}`,
      date: now
    };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, evidences: [newEv, ...o.evidences] } : o));
  };

  const liquidateOrderPayment = (orderId: string, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Finalizada',
          paymentStatus: 'liquidado',
          paymentMethod: method,
          warrantyDetails: 'Garantía oficial de 90 días o 15,000 KM en mano de obra y refacciones aplicadas.'
        };
      }
      return o;
    }));

    // Update cash cut income
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const amount = targetOrder.estimatedCost;
      setCashCut(prev => {
        const isCash = method === 'Efectivo';
        const isCard = method === 'Tarjeta';
        const isTransfer = method === 'Transferencia';

        const cashSales = prev.cashSales + (isCash ? amount : 0);
        const cardSales = prev.cardSales + (isCard ? amount : 0);
        const transferSales = prev.transferSales + (isTransfer ? amount : 0);
        const totalIncome = prev.totalIncome + amount;
        const calculatedCash = prev.initialCash + cashSales - prev.expensesTotal;

        return {
          ...prev,
          cashSales,
          cardSales,
          transferSales,
          totalIncome,
          calculatedCash,
          actualCash: calculatedCash
        };
      });
    }
  };

  // Inventory & Warehouse
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryStock = (itemId: string, deltaQuantity: number) => {
    setInventory(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, stock: Math.max(0, i.stock + deltaQuantity) };
      }
      return i;
    }));
  };

  const addWarehouseRequest = (osId: string, itemCode: string, itemName: string, quantity: number, techName: string) => {
    const targetOS = orders.find(o => o.id === osId);
    const vehicleInfo = targetOS ? `${targetOS.vehicle.brand} ${targetOS.vehicle.model} (${targetOS.vehicle.plates})` : osId;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newReq: WarehouseRequest = {
      id: `req-${Date.now()}`,
      osId,
      vehicleInfo,
      technicianName: techName,
      itemCode,
      itemName,
      quantity,
      status: 'pendiente',
      requestedAt: now
    };

    setWarehouseRequests(prev => [newReq, ...prev]);

    // Add requested part to OS parts as 'solicitado'
    const matchingInv = inventory.find(i => i.code === itemCode);
    const unitPrice = matchingInv ? matchingInv.salePrice : 0;

    addOrderPart(osId, {
      code: itemCode,
      name: itemName,
      quantity,
      unitPrice,
      status: 'solicitado'
    });
  };

  const dispatchWarehouseRequest = (requestId: string) => {
    const targetReq = warehouseRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    // Mark request as surtido
    setWarehouseRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'surtido' } : r));

    // Deduct stock from inventory
    const matchingInv = inventory.find(i => i.code === targetReq.itemCode);
    if (matchingInv) {
      updateInventoryStock(matchingInv.id, -targetReq.quantity);
    }

    // Update OS part status to 'despachado'
    setOrders(prev => prev.map(o => {
      if (o.id === targetReq.osId) {
        const updatedParts = o.parts.map(p => {
          if (p.code === targetReq.itemCode && p.status === 'solicitado') {
            return { ...p, status: 'despachado' as const };
          }
          return p;
        });
        return { ...o, parts: updatedParts };
      }
      return o;
    }));
  };

  // POS Sales
  const createPosSale = (
    cartItems: { item: InventoryItem; quantity: number }[],
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia',
    clientName: string = 'Cliente de Mostrador'
  ): POSReceipt => {
    const subtotal = cartItems.reduce((sum, ci) => sum + (ci.item.salePrice * ci.quantity), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    const folio = `TICK-${1000 + posReceipts.length + 1}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newReceipt: POSReceipt = {
      id: `pos-${Date.now()}`,
      folio,
      date: now,
      items: cartItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      clientName
    };

    setPosReceipts(prev => [newReceipt, ...prev]);

    // Deduct stock for each cart item
    cartItems.forEach(ci => {
      updateInventoryStock(ci.item.id, -ci.quantity);
    });

    // Update cash cut totals
    setCashCut(prev => {
      const isCash = paymentMethod === 'Efectivo';
      const isCard = paymentMethod === 'Tarjeta';
      const isTransfer = paymentMethod === 'Transferencia';

      const cashSales = prev.cashSales + (isCash ? total : 0);
      const cardSales = prev.cardSales + (isCard ? total : 0);
      const transferSales = prev.transferSales + (isTransfer ? total : 0);
      const totalIncome = prev.totalIncome + total;
      const calculatedCash = prev.initialCash + cashSales - prev.expensesTotal;

      return {
        ...prev,
        cashSales,
        cardSales,
        transferSales,
        totalIncome,
        calculatedCash,
        actualCash: calculatedCash
      };
    });

    return newReceipt;
  };

  // Finance & Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'date'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      date: now
    };

    setExpenses(prev => [newExp, ...prev]);

    // Update Cash Cut expenses
    setCashCut(prev => {
      const expensesTotal = prev.expensesTotal + newExp.amount;
      const calculatedCash = prev.initialCash + prev.cashSales - expensesTotal;
      return {
        ...prev,
        expensesTotal,
        calculatedCash,
        actualCash: calculatedCash
      };
    });
  };

  const closeCashCut = (actualCash: number, notes: string) => {
    setCashCut(prev => {
      const diff = actualCash - prev.calculatedCash;
      return {
        ...prev,
        actualCash,
        difference: diff,
        status: 'cerrado',
        notes
      };
    });
  };

  // Users
  const addUser = (userData: Omit<User, 'id' | 'status'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'activo'
    };
    setUsers(prev => [...prev, newUser]);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'activo' ? 'inactivo' : 'activo' } : u));
  };

  return (
    <WorkshopContext.Provider value={{
      currentRole,
      setCurrentRole,
      orders,
      addOrder,
      updateOrderStatus,
      updateOrderTechNotes,
      updateOrderBudgetApproval,
      addOrderPart,
      addOrderLabor,
      addOrderEvidence,
      liquidateOrderPayment,
      inventory,
      addInventoryItem,
      updateInventoryStock,
      warehouseRequests,
      addWarehouseRequest,
      dispatchWarehouseRequest,
      posReceipts,
      createPosSale,
      cashCut,
      closeCashCut,
      expenses,
      addExpense,
      users,
      addUser,
      toggleUserStatus
    }}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
