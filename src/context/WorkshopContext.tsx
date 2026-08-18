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
  OSEvidence,
  Appointment,
  BillingOrder,
  InvoiceRecord,
  ToolItem,
  ToolAssignmentLog,
  PurchaseOrder,
  ClientContact,
  SupplierContact,
  BankAccount,
  FinancialMovement
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_WAREHOUSE_REQUESTS,
  INITIAL_USERS,
  INITIAL_CASH_CUT,
  INITIAL_EXPENSES,
  INITIAL_POS_RECEIPTS,
  INITIAL_APPOINTMENTS,
  INITIAL_BILLING_ORDERS,
  INITIAL_INVOICES,
  INITIAL_TOOLS,
  INITIAL_TOOL_LOGS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_CLIENT_CONTACTS,
  INITIAL_SUPPLIER_CONTACTS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_FINANCIAL_MOVEMENTS
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

  // 1. Appointments (Citas)
  appointments: Appointment[];
  addAppointment: (appData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status'], bayAssigned?: string) => void;
  convertAppointmentToOS: (appointmentId: string, assignedTechId?: string, assignedTechName?: string) => ServiceOrder | null;

  // 3. Billing, Cash & Invoicing (Facturación y Caja)
  billingOrders: BillingOrder[];
  invoices: InvoiceRecord[];
  payBillingOrder: (billingOrderId: string, method: 'Efectivo' | 'Tarjeta' | 'Transferencia', bankAccountId?: string) => void;
  dispatchWarehouseTicket: (billingOrderId: string) => void;
  createInvoiceFromBillingOrder: (billingOrderId: string, fiscalData: { rfc: string; regimenFiscal: string; usoCfdi: string; clientName: string; email: string; paymentForm: InvoiceRecord['paymentForm'] }) => InvoiceRecord;
  sendInvoiceEmail: (invoiceId: string, targetEmail: string) => void;

  // 5. Inventory, Warehouse & Tools
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryStock: (itemId: string, deltaQuantity: number) => void;
  tools: ToolItem[];
  toolLogs: ToolAssignmentLog[];
  addTool: (tool: Omit<ToolItem, 'id'>) => void;
  assignToolToTechnician: (toolId: string, technicianId: string, technicianName: string, notes?: string) => void;
  returnToolFromTechnician: (toolId: string, condition: ToolItem['condition'], returnNotes?: string) => void;

  // Warehouse Requests
  warehouseRequests: WarehouseRequest[];
  addWarehouseRequest: (osId: string, itemCode: string, itemName: string, quantity: number, techName: string) => void;
  dispatchWarehouseRequest: (requestId: string) => void;

  // 6. Purchases & Suppliers (Compras y Proveedores)
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'date' | 'status'>) => PurchaseOrder;
  receivePurchaseOrder: (poId: string, bankAccountId?: string) => void;
  addDirectExpensePurchase: (data: { supplierId: string; supplierName: string; supplierEmail: string; expenseCategory: PurchaseOrder['expenseCategory']; items: PurchaseOrder['items']; subtotal: number; taxIva: number; total: number; paymentMethod: PurchaseOrder['paymentMethod']; bankAccountId?: string; notes?: string }) => PurchaseOrder;

  // 7. Contacts (Directorio Clientes y Proveedores)
  clientContacts: ClientContact[];
  supplierContacts: SupplierContact[];
  addClientContact: (client: Omit<ClientContact, 'id' | 'createdAt' | 'totalOrdersCount'>) => void;
  updateClientContact: (id: string, client: Partial<ClientContact>) => void;
  addSupplierContact: (supplier: Omit<SupplierContact, 'id'>) => void;
  updateSupplierContact: (id: string, supplier: Partial<SupplierContact>) => void;

  // 8. Banks & Finance (Bancos y Finanzas)
  bankAccounts: BankAccount[];
  financialMovements: FinancialMovement[];
  addBankAccount: (acc: Omit<BankAccount, 'id'>) => void;
  addFinancialMovement: (mov: Omit<FinancialMovement, 'id' | 'date'>) => void;

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
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [warehouseRequests, setWarehouseRequests] = useState<WarehouseRequest[]>(INITIAL_WAREHOUSE_REQUESTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cashCut, setCashCut] = useState<CashCut>(INITIAL_CASH_CUT);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [posReceipts, setPosReceipts] = useState<POSReceipt[]>(INITIAL_POS_RECEIPTS);

  // 8 Modules state
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [billingOrders, setBillingOrders] = useState<BillingOrder[]>(INITIAL_BILLING_ORDERS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [toolLogs, setToolLogs] = useState<ToolAssignmentLog[]>(INITIAL_TOOL_LOGS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [clientContacts, setClientContacts] = useState<ClientContact[]>(INITIAL_CLIENT_CONTACTS);
  const [supplierContacts, setSupplierContacts] = useState<SupplierContact[]>(INITIAL_SUPPLIER_CONTACTS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [financialMovements, setFinancialMovements] = useState<FinancialMovement[]>(INITIAL_FINANCIAL_MOVEMENTS);

  // Sync with Supabase on mount
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
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

    // Save to Supabase if available
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

        // If status became "Listo para Entrega" or "Finalizada", ensure a BillingOrder exists
        if (newStatus === 'Listo para Entrega' || newStatus === 'Finalizada') {
          createBillingOrderForTallerOrder(updated);
        }

        return updated;
      }
      return o;
    }));
  };

  const createBillingOrderForTallerOrder = (os: ServiceOrder) => {
    setBillingOrders(prev => {
      if (prev.some(b => b.referenceId === os.id)) return prev;
      const subtotal = os.estimatedCost;
      const taxIva = subtotal * 0.16;
      const total = subtotal + taxIva;
      const newBilling: BillingOrder = {
        id: `COB-${1090 + prev.length + 1}`,
        sourceType: 'Taller',
        referenceId: os.id,
        clientName: os.vehicle.clientName,
        clientEmail: `${os.vehicle.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@ejemplo.com`,
        subtotal,
        taxIva,
        total,
        status: os.paymentStatus === 'liquidado' ? 'Pagado' : 'Pendiente de Pago',
        paymentMethod: os.paymentMethod,
        paidAt: os.paymentStatus === 'liquidado' ? os.updatedAt : undefined,
        dispatchedInWarehouse: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        itemsSummary: `Servicio de Taller ${os.vehicle.brand} ${os.vehicle.model} (${os.vehicle.plates}) - ${os.faultReason.slice(0, 45)}...`
      };
      return [newBilling, ...prev];
    });
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
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const warranty = 'Garantía oficial de 90 días o 15,000 KM en mano de obra y refacciones aplicadas.';

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
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

    // Update or create Billing Order
    setBillingOrders(prev => {
      const existing = prev.find(b => b.referenceId === orderId);
      if (existing) {
        return prev.map(b => b.referenceId === orderId ? { ...b, status: 'Pagado', paymentMethod: method, paidAt: now } : b);
      } else {
        const subtotal = targetOrder.estimatedCost;
        const taxIva = subtotal * 0.16;
        const newBill: BillingOrder = {
          id: `COB-${1090 + prev.length + 1}`,
          sourceType: 'Taller',
          referenceId: orderId,
          clientName: targetOrder.vehicle.clientName,
          subtotal,
          taxIva,
          total: subtotal + taxIva,
          status: 'Pagado',
          paymentMethod: method,
          paidAt: now,
          dispatchedInWarehouse: true,
          createdAt: now,
          itemsSummary: `Liquidación de Taller ${targetOrder.vehicle.brand} ${targetOrder.vehicle.model}`
        };
        return [newBill, ...prev];
      }
    });

    // Add Financial Movement
    const primaryAccount = method === 'Efectivo' ? bankAccounts.find(a => a.type === 'Caja Efectivo') : bankAccounts.find(a => a.type === 'Banco');
    const targetAcc = primaryAccount || bankAccounts[0];
    const totalAmount = targetOrder.estimatedCost * 1.16;

    if (targetAcc) {
      addFinancialMovement({
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'Ingreso',
        concept: `Liquidación de Taller ${orderId} (${targetOrder.vehicle.clientName})`,
        category: 'Cobro Taller',
        amount: totalAmount,
        reference: method === 'Efectivo' ? 'CAJA-DIRECTA' : 'SPEI-COBRO',
        relatedOrderId: orderId
      });
    }

    // Cash cut
    setCashCut(prev => {
      const isCash = method === 'Efectivo';
      const isCard = method === 'Tarjeta';
      const isTransfer = method === 'Transferencia';
      const cashSales = prev.cashSales + (isCash ? totalAmount : 0);
      const cardSales = prev.cardSales + (isCard ? totalAmount : 0);
      const transferSales = prev.transferSales + (isTransfer ? totalAmount : 0);
      const totalIncome = prev.totalIncome + totalAmount;
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

  // 1. APPOINTMENTS (CITAS)
  const addAppointment = (appData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment => {
    const nextNum = 1000 + appointments.length + 1;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newApp: Appointment = {
      ...appData,
      id: `APT-${nextNum}`,
      status: 'Pendiente',
      createdAt: now
    };
    setAppointments(prev => [newApp, ...prev]);
    return newApp;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], bayAssigned?: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, bayAssigned: bayAssigned || a.bayAssigned } : a));
  };

  const convertAppointmentToOS = (appointmentId: string, assignedTechId: string = 'tech-1', assignedTechName: string = 'Ricardo M.'): ServiceOrder | null => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    const createdOS = addOrder({
      vehicle: {
        plates: apt.vehiclePlates,
        vin: `VIN-${apt.vehiclePlates}-TEMP`,
        brand: apt.vehicleBrandModel.split(' ')[0] || 'Kenworth',
        model: apt.vehicleBrandModel.split(' ').slice(1).join(' ') || 'T680',
        mileageOrHours: '0 KM / Check-in',
        year: apt.vehicleYear,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone
      },
      faultReason: `${apt.serviceType}: ${apt.serviceReason}`,
      checklist: [
        { id: '1', name: 'Nivel de Aceite Motor 15W40', status: 'ok' },
        { id: '2', name: 'Presión Neumática y Fugas', status: 'ok' },
        { id: '3', name: 'Códigos ECM / Diagnóstico Escáner', status: 'fail', notes: 'Revisión por motivo de cita' },
        { id: '4', name: 'Nivel y Calentador Urea DEF', status: 'ok' }
      ],
      assignedTechnicianId: assignedTechId,
      assignedTechnicianName: assignedTechName,
      status: 'Diagnóstico',
      parts: [],
      labor: [{ id: 'l-init', description: `Diagnóstico y Evaluación Inicial ${apt.serviceType}`, hours: 2, hourlyRate: 850, status: 'pendiente' }],
      evidences: [],
      estimatedCost: 1700,
      clientApproved: null,
      notes: `Cita origen: ${apt.id} (${apt.source}) agendada para ${apt.preferredDate} ${apt.preferredTime}`
    });

    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'Convertida', convertedOrderId: createdOS.id } : a));
    return createdOS;
  };

  // 3. BILLING, CASH & CFDI
  const payBillingOrder = (billingOrderId: string, method: 'Efectivo' | 'Tarjeta' | 'Transferencia', bankAccountId?: string) => {
    const targetOrder = billingOrders.find(b => b.id === billingOrderId);
    if (!targetOrder) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const voucherNum = targetOrder.sourceType === 'Mostrador' ? `VALE-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    setBillingOrders(prev => prev.map(b => {
      if (b.id === billingOrderId) {
        return {
          ...b,
          status: 'Pagado',
          paymentMethod: method,
          paidAt: now,
          warehouseVoucherNumber: voucherNum,
          dispatchedInWarehouse: targetOrder.sourceType === 'Mostrador' ? false : true
        };
      }
      return b;
    }));

    // Financial movement
    const targetAcc = bankAccounts.find(a => a.id === bankAccountId) || (method === 'Efectivo' ? bankAccounts.find(a => a.type === 'Caja Efectivo') : bankAccounts.find(a => a.type === 'Banco')) || bankAccounts[0];
    if (targetAcc) {
      addFinancialMovement({
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'Ingreso',
        concept: `Cobro en Caja ${billingOrderId} (${targetOrder.sourceType} - ${targetOrder.clientName})`,
        category: targetOrder.sourceType === 'Mostrador' ? 'Cobro Mostrador' : 'Cobro Taller',
        amount: targetOrder.total,
        reference: method === 'Efectivo' ? 'EFECTIVO-CAJA' : 'SPEI-BANCO',
        relatedOrderId: targetOrder.referenceId
      });
    }
  };

  const dispatchWarehouseTicket = (billingOrderId: string) => {
    setBillingOrders(prev => prev.map(b => b.id === billingOrderId ? { ...b, dispatchedInWarehouse: true } : b));
  };

  const createInvoiceFromBillingOrder = (
    billingOrderId: string,
    fiscalData: { rfc: string; regimenFiscal: string; usoCfdi: string; clientName: string; email: string; paymentForm: InvoiceRecord['paymentForm'] }
  ): InvoiceRecord => {
    const targetOrder = billingOrders.find(b => b.id === billingOrderId);
    const folioNum = 4020 + invoices.length;
    const uuid = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4C91-912A-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const subtotal = targetOrder ? targetOrder.subtotal : 1000;
    const taxIva = targetOrder ? targetOrder.taxIva : subtotal * 0.16;
    const total = targetOrder ? targetOrder.total : subtotal + taxIva;

    const xmlData = `<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Serie="FAC" Folio="${folioNum}" Fecha="${now}" SubTotal="${subtotal.toFixed(2)}" Total="${total.toFixed(2)}" TipoDeComprobante="I" MetodoPago="PUE" FormaPago="${fiscalData.paymentForm.slice(0, 2)}" xmlns:cfdi="http://www.sat.gob.mx/cfd/4"><cfdi:Emisor Rfc="TSR180901HD9" Nombre="TRACTOSERVICES AND DIESEL PARTS TSR SONORA SA DE CV" RegimenFiscal="601"/><cfdi:Receptor Rfc="${fiscalData.rfc}" Nombre="${fiscalData.clientName}" DomicilioFiscalReceptor="83000" RegimenFiscalReceptor="${fiscalData.regimenFiscal.slice(0, 3)}" UsoCFDI="${fiscalData.usoCfdi.slice(0, 3)}"/><cfdi:Impuestos TotalImpuestosTrasladados="${taxIva.toFixed(2)}"><cfdi:Traslados><cfdi:Traslado Base="${subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${taxIva.toFixed(2)}"/></cfdi:Traslados></cfdi:Impuestos></cfdi:Comprobante>`;

    const newInvoice: InvoiceRecord = {
      id: `inv-cfdi-${Date.now()}`,
      folio: `FAC-${folioNum}`,
      uuid,
      orderReferenceId: targetOrder ? targetOrder.referenceId : billingOrderId,
      clientName: fiscalData.clientName,
      rfc: fiscalData.rfc,
      regimenFiscal: fiscalData.regimenFiscal,
      usoCfdi: fiscalData.usoCfdi,
      email: fiscalData.email,
      subtotal,
      taxIva,
      total,
      paymentMethod: targetOrder?.paymentMethod || 'Transferencia',
      paymentForm: fiscalData.paymentForm,
      date: now,
      xmlData,
      sentByEmail: false
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Mark billing order as facturado
    if (targetOrder) {
      setBillingOrders(prev => prev.map(b => b.id === billingOrderId ? { ...b, status: 'Facturado', invoiceId: newInvoice.folio, clientRfc: fiscalData.rfc } : b));
    }

    return newInvoice;
  };

  const sendInvoiceEmail = (invoiceId: string, targetEmail: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, sentByEmail: true, emailSentAt: now, email: targetEmail } : inv));
  };

  // 5. TOOLS (CONTROL DE HERRAMIENTA)
  const addTool = (toolData: Omit<ToolItem, 'id'>) => {
    const newTool: ToolItem = {
      ...toolData,
      id: `tool-${Date.now()}`
    };
    setTools(prev => [newTool, ...prev]);
  };

  const assignToolToTechnician = (toolId: string, technicianId: string, technicianName: string, notes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetTool = tools.find(t => t.id === toolId);
    if (!targetTool) return;

    setTools(prev => prev.map(t => t.id === toolId ? {
      ...t,
      status: 'Asignada',
      currentTechnicianId: technicianId,
      currentTechnicianName: technicianName,
      assignedDate: now,
      notes: notes || t.notes
    } : t));

    const newLog: ToolAssignmentLog = {
      id: `tlog-${Date.now()}`,
      toolId,
      toolCode: targetTool.code,
      toolName: targetTool.name,
      technicianId,
      technicianName,
      assignedDate: now,
      status: 'Activa',
      responsibilitySigned: true,
      observations: notes || 'Entrega autorizada por almacén'
    };

    setToolLogs(prev => [newLog, ...prev]);
  };

  const returnToolFromTechnician = (toolId: string, condition: ToolItem['condition'], returnNotes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setTools(prev => prev.map(t => t.id === toolId ? {
      ...t,
      status: 'Disponible',
      currentTechnicianId: undefined,
      currentTechnicianName: undefined,
      assignedDate: undefined,
      condition,
      notes: returnNotes || t.notes
    } : t));

    setToolLogs(prev => prev.map(l => l.toolId === toolId && l.status === 'Activa' ? {
      ...l,
      returnDate: now,
      status: 'Devuelta',
      returnCondition: condition,
      observations: returnNotes ? `${l.observations || ''} | Devolución: ${returnNotes}` : l.observations
    } : l));
  };

  // 6. PURCHASES (COMPRAS Y PROVEEDORES)
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'date' | 'status'>): PurchaseOrder => {
    const nextNum = 8020 + purchaseOrders.length + 1;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 10);
    const newPO: PurchaseOrder = {
      ...poData,
      id: `OC-${nextNum}`,
      date: now,
      status: 'Enviada a Proveedor',
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  };

  const receivePurchaseOrder = (poId: string, bankAccountId?: string) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Update status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Recibida en Almacén', receivedAt: now } : p));

    // Increase stock for each item in inventory
    targetPO.items.forEach(it => {
      const matchingInv = inventory.find(inv => inv.code === it.partCode);
      if (matchingInv) {
        updateInventoryStock(matchingInv.id, it.quantity);
      }
    });

    // Add financial movement (Egreso)
    const targetAcc = bankAccounts.find(a => a.id === bankAccountId) || bankAccounts[0];
    if (targetAcc) {
      addFinancialMovement({
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'Egreso',
        concept: `Recepción y Pago de Compra ${poId} (${targetPO.supplierName})`,
        category: 'Compra Refacciones',
        amount: targetPO.total,
        reference: targetPO.paymentMethod === 'Transferencia' ? 'SPEI-PAGO-PROV' : 'PAGO-DIRECTO',
        relatedPurchaseId: poId
      });
    }
  };

  const addDirectExpensePurchase = (data: {
    supplierId: string;
    supplierName: string;
    supplierEmail: string;
    expenseCategory: PurchaseOrder['expenseCategory'];
    items: PurchaseOrder['items'];
    subtotal: number;
    taxIva: number;
    total: number;
    paymentMethod: PurchaseOrder['paymentMethod'];
    bankAccountId?: string;
    notes?: string;
  }): PurchaseOrder => {
    const nextNum = 8020 + purchaseOrders.length + 1;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 10);
    const newPO: PurchaseOrder = {
      id: `OC-${nextNum}`,
      date: now,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierEmail: data.supplierEmail,
      status: 'Recibida en Almacén',
      isDirectExpense: true,
      expenseCategory: data.expenseCategory,
      paymentMethod: data.paymentMethod,
      bankAccountId: data.bankAccountId,
      items: data.items,
      subtotal: data.subtotal,
      taxIva: data.taxIva,
      total: data.total,
      notes: data.notes,
      receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Financial movement
    const targetAcc = bankAccounts.find(a => a.id === data.bankAccountId) || bankAccounts[0];
    if (targetAcc) {
      addFinancialMovement({
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'Egreso',
        concept: `Gasto/Compra Directa ${newPO.id}: ${data.notes || data.supplierName}`,
        category: data.expenseCategory === 'Refacciones Almacén' ? 'Compra Refacciones' : (data.expenseCategory === 'Herramientas' ? 'Herramientas' : 'Gasto Operativo'),
        amount: data.total,
        reference: 'COMPRA-DIRECTA',
        relatedPurchaseId: newPO.id
      });
    }

    return newPO;
  };

  // 7. CONTACTS (DIRECTORIO)
  const addClientContact = (client: Omit<ClientContact, 'id' | 'createdAt' | 'totalOrdersCount'>) => {
    const newClient: ClientContact = {
      ...client,
      id: `cli-${Date.now()}`,
      totalOrdersCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 10)
    };
    setClientContacts(prev => [newClient, ...prev]);
  };

  const updateClientContact = (id: string, client: Partial<ClientContact>) => {
    setClientContacts(prev => prev.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const addSupplierContact = (supplier: Omit<SupplierContact, 'id'>) => {
    const newSupplier: SupplierContact = {
      ...supplier,
      id: `prov-${Date.now()}`
    };
    setSupplierContacts(prev => [newSupplier, ...prev]);
  };

  const updateSupplierContact = (id: string, supplier: Partial<SupplierContact>) => {
    setSupplierContacts(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  // 8. BANKS & FINANCE (BANCOS Y FINANZAS)
  const addBankAccount = (acc: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = {
      ...acc,
      id: `bank-${Date.now()}`
    };
    setBankAccounts(prev => [...prev, newAcc]);
  };

  const addFinancialMovement = (mov: Omit<FinancialMovement, 'id' | 'date'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMov: FinancialMovement = {
      ...mov,
      id: `mov-${Date.now()}`,
      date: now
    };

    setFinancialMovements(prev => [newMov, ...prev]);

    // Update target account currentBalance
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === mov.accountId) {
        const delta = mov.type === 'Ingreso' ? mov.amount : -mov.amount;
        return {
          ...acc,
          currentBalance: acc.currentBalance + delta
        };
      }
      return acc;
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

    setWarehouseRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'surtido' } : r));
    supabase.from('warehouse_requests').update({ status: 'surtido' }).eq('id', requestId).then();

    const matchingInv = inventory.find(i => i.code === targetReq.itemCode);
    if (matchingInv) {
      updateInventoryStock(matchingInv.id, -targetReq.quantity);
    }

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

    // Create a BillingOrder for POS so it appears in Billing / Caja module
    const newBilling: BillingOrder = {
      id: `COB-${1090 + billingOrders.length + 1}`,
      sourceType: 'Mostrador',
      referenceId: folio,
      clientName,
      subtotal,
      taxIva: tax,
      total,
      status: 'Pagado',
      paymentMethod,
      paidAt: now,
      dispatchedInWarehouse: false,
      warehouseVoucherNumber: `VALE-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: now,
      itemsSummary: cartItems.map(c => `${c.quantity}x ${c.item.name}`).join(', ')
    };
    setBillingOrders(prev => [newBilling, ...prev]);

    // Financial movement
    const targetAcc = paymentMethod === 'Efectivo' ? bankAccounts.find(a => a.type === 'Caja Efectivo') : bankAccounts.find(a => a.type === 'Banco');
    if (targetAcc) {
      addFinancialMovement({
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        type: 'Ingreso',
        concept: `Venta Mostrador ${folio} (${clientName})`,
        category: 'Cobro Mostrador',
        amount: total,
        reference: paymentMethod === 'Efectivo' ? 'EFECTIVO-CAJA' : 'SPEI-MOSTRADOR',
        relatedOrderId: folio
      });
    }

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
      appointments,
      addAppointment,
      updateAppointmentStatus,
      convertAppointmentToOS,
      billingOrders,
      invoices,
      payBillingOrder,
      dispatchWarehouseTicket,
      createInvoiceFromBillingOrder,
      sendInvoiceEmail,
      inventory,
      addInventoryItem,
      updateInventoryStock,
      tools,
      toolLogs,
      addTool,
      assignToolToTechnician,
      returnToolFromTechnician,
      purchaseOrders,
      addPurchaseOrder,
      receivePurchaseOrder,
      addDirectExpensePurchase,
      clientContacts,
      supplierContacts,
      addClientContact,
      updateClientContact,
      addSupplierContact,
      updateSupplierContact,
      bankAccounts,
      financialMovements,
      addBankAccount,
      addFinancialMovement,
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

