import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  updateWorkOrderData: (orderId: string, data: any) => void;

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

  // Sync with Supabase on mount
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        // Fetch Orders
        const { data: dbOrders, error: errOrders } = await supabase.from('service_orders').select('*');
        if (!errOrders && dbOrders && dbOrders.length > 0) {
          const parsed: ServiceOrder[] = dbOrders.map(row => ({
            id: row.id,
            trackingToken: row.tracking_token,
            vehicle: typeof row.vehicle === 'string' ? JSON.parse(row.vehicle) : row.vehicle,
            faultReason: row.fault_reason,
            checklist: typeof row.checklist === 'string' ? JSON.parse(row.checklist) : row.checklist,
            assignedTechnicianId: row.assigned_technician_id,
            assignedTechnicianName: row.assigned_technician_name,
            status: row.status,
            parts: typeof row.parts === 'string' ? JSON.parse(row.parts) : (row.parts || []),
            labor: typeof row.labor === 'string' ? JSON.parse(row.labor) : (row.labor || []),
            evidences: typeof row.evidences === 'string' ? JSON.parse(row.evidences) : (row.evidences || []),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            estimatedCost: Number(row.estimated_cost) || 0,
            clientApproved: row.client_approved,
            paymentStatus: row.payment_status,
            paymentMethod: row.payment_method,
            warrantyDetails: row.warranty_details,
            techNotes: row.tech_notes,
            notes: row.notes
          }));
          setOrders(parsed);
        }

        // Fetch Inventory
        const { data: dbInv, error: errInv } = await supabase.from('inventory_items').select('*');
        if (!errInv && dbInv && dbInv.length > 0) {
          const parsedInv: InventoryItem[] = dbInv.map(row => ({
            id: row.id,
            code: row.code,
            name: row.name,
            category: row.category,
            brand: row.brand,
            costPrice: Number(row.cost_price),
            salePrice: Number(row.sale_price),
            engineApplications: row.engine_applications,
            stock: Number(row.stock),
            minStock: Number(row.min_stock),
            unit: row.unit || 'pz'
          }));
          setInventory(parsedInv);
        }

        // Fetch Warehouse Requests
        const { data: dbReqs, error: errReqs } = await supabase.from('warehouse_requests').select('*');
        if (!errReqs && dbReqs && dbReqs.length > 0) {
          const parsedReqs: WarehouseRequest[] = dbReqs.map(row => ({
            id: row.id,
            osId: row.os_id,
            vehicleInfo: row.vehicle_info,
            technicianName: row.technician_name,
            itemCode: row.item_code,
            itemName: row.item_name,
            quantity: Number(row.quantity),
            status: row.status,
            requestedAt: row.requested_at
          }));
          setWarehouseRequests(parsedReqs);
        }

        // Fetch Users
        const { data: dbUsers, error: errUsers } = await supabase.from('users_app').select('*');
        if (!errUsers && dbUsers && dbUsers.length > 0) {
          const parsedUsers: User[] = dbUsers.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            status: row.status,
            specialty: row.specialty,
            phone: row.phone
          }));
          setUsers(parsedUsers);
        }

        // Fetch Expenses
        const { data: dbExp, error: errExp } = await supabase.from('expenses').select('*');
        if (!errExp && dbExp && dbExp.length > 0) {
          const parsedExp: Expense[] = dbExp.map(row => ({
            id: row.id,
            date: row.date,
            concept: row.concept,
            category: row.category,
            amount: Number(row.amount),
            supplier: row.supplier,
            receiptNumber: row.receipt_number
          }));
          setExpenses(parsedExp);
        }

        // Fetch POS Receipts
        const { data: dbPos, error: errPos } = await supabase.from('pos_receipts').select('*');
        if (!errPos && dbPos && dbPos.length > 0) {
          const parsedPos: POSReceipt[] = dbPos.map(row => ({
            id: row.id,
            folio: row.folio,
            date: row.date,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
            subtotal: Number(row.subtotal),
            tax: Number(row.tax),
            total: Number(row.total),
            paymentMethod: row.payment_method,
            clientName: row.client_name
          }));
          setPosReceipts(parsedPos);
        }
      } catch (e) {
        console.log('Supabase sync notice: Using offline/local initial state until tables are migrated.');
      }
    };

    fetchSupabaseData();
  }, []);

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

    // Save to Supabase
    supabase.from('service_orders').insert([{
      id: createdOrder.id,
      tracking_token: createdOrder.trackingToken,
      vehicle: JSON.stringify(createdOrder.vehicle),
      fault_reason: createdOrder.faultReason,
      checklist: JSON.stringify(createdOrder.checklist),
      assigned_technician_id: createdOrder.assignedTechnicianId,
      assigned_technician_name: createdOrder.assignedTechnicianName,
      status: createdOrder.status,
      parts: JSON.stringify(createdOrder.parts),
      labor: JSON.stringify(createdOrder.labor),
      evidences: JSON.stringify(createdOrder.evidences),
      created_at: createdOrder.createdAt,
      updated_at: createdOrder.updatedAt,
      estimated_cost: createdOrder.estimatedCost,
      client_approved: createdOrder.clientApproved,
      payment_status: createdOrder.paymentStatus
    }]).then(({ error }) => {
      if (error) console.log('Supabase order insert error:', error.message);
    });

    return createdOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OSStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus, updatedAt: now };
        supabase.from('service_orders').update({
          status: newStatus,
          updated_at: now
        }).eq('id', orderId).then();
        return updated;
      }
      return o;
    }));
  };

  const updateOrderTechNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        supabase.from('service_orders').update({ tech_notes: notes }).eq('id', orderId).then();
        return { ...o, techNotes: notes };
      }
      return o;
    }));
  };

  const updateOrderBudgetApproval = (orderId: string, approved: boolean) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedParts = o.parts.map(p => ({ ...p, status: approved ? ('aprobado_cliente' as const) : ('rechazado_cliente' as const) }));
        const updatedLabor = o.labor.map(l => ({ ...l, status: approved ? ('aprobado_cliente' as const) : ('rechazado_cliente' as const) }));
        const updated = {
          ...o,
          clientApproved: approved,
          updatedAt: now,
          parts: updatedParts,
          labor: updatedLabor
        };
        supabase.from('service_orders').update({
          client_approved: approved,
          updated_at: now,
          parts: JSON.stringify(updatedParts),
          labor: JSON.stringify(updatedLabor)
        }).eq('id', orderId).then();
        return updated;
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

        supabase.from('service_orders').update({
          parts: JSON.stringify(updatedParts),
          estimated_cost: updatedOrder.estimatedCost
        }).eq('id', orderId).then();

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

        supabase.from('service_orders').update({
          labor: JSON.stringify(updatedLabor),
          estimated_cost: updatedOrder.estimatedCost
        }).eq('id', orderId).then();

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
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedEvs = [newEv, ...o.evidences];
        supabase.from('service_orders').update({
          evidences: JSON.stringify(updatedEvs)
        }).eq('id', orderId).then();
        return { ...o, evidences: updatedEvs };
      }
      return o;
    }));
  };

  const liquidateOrderPayment = (orderId: string, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const warranty = 'Garantía oficial de 90 días o 15,000 KM en mano de obra y refacciones aplicadas.';
        supabase.from('service_orders').update({
          status: 'Finalizada',
          payment_status: 'liquidado',
          payment_method: method,
          warranty_details: warranty
        }).eq('id', orderId).then();

        return {
          ...o,
          status: 'Finalizada',
          paymentStatus: 'liquidado',
          paymentMethod: method,
          warrantyDetails: warranty
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

  const updateWorkOrderData = (orderId: string, data: any) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, workOrderData: data };
        supabase.from('service_orders').update({
          notes: JSON.stringify(data)
        }).eq('id', orderId).then();
        return updated;
      }
      return o;
    }));
  };

  // Inventory & Warehouse
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    setInventory(prev => [newItem, ...prev]);

    supabase.from('inventory_items').insert([{
      id: newItem.id,
      code: newItem.code,
      name: newItem.name,
      category: newItem.category,
      brand: newItem.brand,
      cost_price: newItem.costPrice,
      sale_price: newItem.salePrice,
      engine_applications: newItem.engineApplications,
      stock: newItem.stock,
      min_stock: newItem.minStock,
      unit: newItem.unit
    }]).then();
  };

  const updateInventoryStock = (itemId: string, deltaQuantity: number) => {
    setInventory(prev => prev.map(i => {
      if (i.id === itemId) {
        const newStock = Math.max(0, i.stock + deltaQuantity);
        supabase.from('inventory_items').update({ stock: newStock }).eq('id', itemId).then();
        return { ...i, stock: newStock };
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

    supabase.from('warehouse_requests').insert([{
      id: newReq.id,
      os_id: newReq.osId,
      vehicle_info: newReq.vehicleInfo,
      technician_name: newReq.technicianName,
      item_code: newReq.itemCode,
      item_name: newReq.itemName,
      quantity: newReq.quantity,
      status: newReq.status,
      requested_at: newReq.requestedAt
    }]).then();

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
    supabase.from('warehouse_requests').update({ status: 'surtido' }).eq('id', requestId).then();

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
        supabase.from('service_orders').update({ parts: JSON.stringify(updatedParts) }).eq('id', targetReq.osId).then();
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

    supabase.from('pos_receipts').insert([{
      id: newReceipt.id,
      folio: newReceipt.folio,
      date: newReceipt.date,
      items: JSON.stringify(newReceipt.items),
      subtotal: newReceipt.subtotal,
      tax: newReceipt.tax,
      total: newReceipt.total,
      payment_method: newReceipt.paymentMethod,
      client_name: newReceipt.clientName
    }]).then();

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

    supabase.from('expenses').insert([{
      id: newExp.id,
      date: newExp.date,
      concept: newExp.concept,
      category: newExp.category,
      amount: newExp.amount,
      supplier: newExp.supplier,
      receipt_number: newExp.receiptNumber
    }]).then();

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

    supabase.from('users_app').insert([{
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      specialty: newUser.specialty,
      phone: newUser.phone
    }]).then();
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'activo' ? 'inactivo' : 'activo';
        supabase.from('users_app').update({ status: newStatus }).eq('id', userId).then();
        return { ...u, status: newStatus as 'activo' | 'inactivo' };
      }
      return u;
    }));
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
      updateWorkOrderData,
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

