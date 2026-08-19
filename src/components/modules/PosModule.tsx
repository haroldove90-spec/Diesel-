import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { InventoryItem, POSReceipt } from '../../types';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Receipt,
  FileText,
  User,
  Barcode
} from 'lucide-react';

export const PosModule: React.FC = () => {
  const { 
    inventory, 
    createPosSale, 
    posReceipts, 
    clientContacts,
    updateInventoryStock 
  } = useWorkshop();

  // POS Search & Cart
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<{ item: InventoryItem; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [clientName, setClientName] = useState('Cliente de Mostrador');
  const [clientRfc, setClientRfc] = useState('XAXX010101000');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<POSReceipt | null>(posReceipts[0] || null);
  const [showReceiptModal, setShowReceiptModal] = useState<POSReceipt | null>(null);
  const [quickAlert, setQuickAlert] = useState<string | null>(null);

  const categories = ['Todos', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.engineApplications.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerAlert = (msg: string) => {
    setQuickAlert(msg);
    setTimeout(() => setQuickAlert(null), 3000);
  };

  // Cart operations
  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      triggerAlert(`¡Aviso! ${item.code} sin stock disponible.`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          triggerAlert(`Existencias máximas alcanzadas (${item.stock} pz).`);
          return prev;
        }
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQ = i.quantity + delta;
        if (newQ <= 0) return null;
        if (newQ > i.item.stock) {
          triggerAlert(`Stock máximo de ${i.item.name}: ${i.item.stock} pz`);
          return i;
        }
        return { ...i, quantity: newQ };
      }
      return i;
    }).filter(Boolean) as { item: InventoryItem; quantity: number }[]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCashGiven('');
  };

  // Totals calculations
  const subtotal = cart.reduce((sum, i) => sum + (i.item.salePrice * i.quantity), 0);
  const taxIva = subtotal * 0.16;
  const total = subtotal + taxIva;

  const cashNumber = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashNumber - total);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (paymentMethod === 'Efectivo' && cashNumber < total && cashGiven !== '') {
      triggerAlert('El efectivo entregado es menor al total a cobrar.');
      return;
    }

    const receipt = createPosSale(cart, paymentMethod, clientName);
    setLastReceipt(receipt);
    setShowReceiptModal(receipt);
    clearCart();
    triggerAlert(`¡Venta realizada con éxito! Folio: ${receipt.folio}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top POS Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Módulo Punto de Venta
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                POS Mostrador & Venta de Refacciones
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Emisión de tickets de venta, control de inventario en tiempo real y facturación directa.
            </p>
          </div>
        </div>

        {quickAlert && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-1.5 rounded-lg text-xs font-bold animate-fade-in shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{quickAlert}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Catalog / Scanner (Left) + Cart & Checkout (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Product Catalog & Fast Search (7 Cols) */}
        <div className="lg:col-span-7 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 border-r border-slate-200">
          {/* Search bar & Category filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por clave, nombre, marca (Cummins, Fleetguard, Donaldson)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none shadow-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#002855] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group space-y-2"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.code}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.stock > item.minStock 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.stock > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.stock} pz en stock
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 group-hover:text-blue-900">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-slate-500">{item.brand} • {item.category}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Precio Venta (+IVA)</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      ${item.salePrice.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-[#002855] group-hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Cart & Checkout Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-4 md:p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#002855]">
                  Carrito de Compra ({cart.reduce((s, i) => s + i.quantity, 0)} artículos)
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Client selector */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">
                Cliente para el Ticket / Factura
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre de cliente o empresa..."
                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 font-medium"
                />
                <select
                  onChange={(e) => {
                    const c = clientContacts.find(cl => cl.id === e.target.value);
                    if (c) {
                      setClientName(c.name);
                      setClientRfc(c.rfc);
                    }
                  }}
                  className="bg-white border border-slate-300 rounded-md text-xs px-2 text-slate-700"
                >
                  <option value="">Directorio...</option>
                  {clientContacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">El carrito está vacío.</p>
                  <p className="text-[10px]">Selecciona refacciones del catálogo para agregarlas.</p>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div key={cartItem.item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-900 line-clamp-1">{cartItem.item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {cartItem.item.code} • ${cartItem.item.salePrice.toLocaleString()} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateCartQty(cartItem.item.id, -1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold px-2 text-xs">{cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(cartItem.item.id, 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-blue-900 w-20 text-right">
                        ${(cartItem.item.salePrice * cartItem.quantity).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(cartItem.item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Totals Breakdown */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-200">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Refacciones:</span>
                <span className="font-mono">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA Trasladado (16%):</span>
                <span className="font-mono">${taxIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL A COBRAR:</span>
                <span className="font-mono text-[#002855]">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Forma de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-[#002855] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Given & Change calculator */}
            {paymentMethod === 'Efectivo' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 uppercase block mb-0.5">
                      Efectivo Recibido
                    </label>
                    <input
                      type="number"
                      placeholder="$0.00"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-md p-1.5 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-0.5">
                      Cambio a Entregar
                    </span>
                    <div className="p-1.5 font-mono font-bold text-emerald-900 text-sm">
                      ${changeDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                cart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completar Venta y Generar Ticket</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ticket Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl text-slate-900 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#002855]">
                Comprobante de Venta Mostrador
              </h3>
              <button onClick={() => setShowReceiptModal(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-md font-mono text-xs space-y-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <p className="font-bold text-[#002855] text-sm">TSR SONORA</p>
                <p className="text-[10px] text-slate-500">TRACTOSERVICES AND DIESEL PARTS</p>
                <p className="text-[9px] text-slate-400">RFC: TSR180901HD9 • Hermosillo, Sonora</p>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Folio Ticket:</span>
                <span className="text-slate-900 font-bold">{showReceiptModal.folio}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Fecha:</span>
                <span className="text-slate-900">{showReceiptModal.date}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Cliente:</span>
                <span className="text-slate-900">{showReceiptModal.clientName || 'Cliente Mostrador'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Pago:</span>
                <span className="text-slate-900 font-bold">{showReceiptModal.paymentMethod}</span>
              </div>

              <div className="border-t border-b border-slate-200 py-2 space-y-1">
                {showReceiptModal.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-slate-700">
                    <span>{i.item.name} x{i.quantity}</span>
                    <span>${(i.item.salePrice * i.quantity).toLocaleString('es-MX')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm text-blue-900 pt-1">
                <span>TOTAL:</span>
                <span>${showReceiptModal.total.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="border border-slate-300 hover:bg-slate-100 text-slate-800 py-2 text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="bg-[#002855] text-white py-2 text-xs font-bold uppercase rounded-lg shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
