import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { InventoryItem, POSReceipt } from '../../types';
import { HerramientasModule } from '../modules/HerramientasModule';
import { ComprasModule } from '../modules/ComprasModule';
import { ContactosModule } from '../modules/ContactosModule';
import { 
  Boxes, 
  ShoppingCart, 
  SendToBack, 
  Search, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Check, 
  Printer 
} from 'lucide-react';

interface AlmacenViewProps {
  activeTab: string;
}

export const AlmacenView: React.FC<AlmacenViewProps> = ({ activeTab }) => {
  const { 
    inventory, 
    addInventoryItem, 
    updateInventoryStock, 
    warehouseRequests, 
    dispatchWarehouseRequest, 
    createPosSale, 
    posReceipts 
  } = useWorkshop();

  // Inventory Search & Filter
  const [invSearch, setInvSearch] = useState('');
  const [showAddInvModal, setShowAddInvModal] = useState(false);

  // New Item State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mantenimiento');
  const [brand, setBrand] = useState('Donaldson');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [engineApps, setEngineApps] = useState('');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('5');

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState<{ item: InventoryItem; quantity: number }[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [posClientName, setPosClientName] = useState('Cliente de Mostrador');
  const [lastReceipt, setLastReceipt] = useState<POSReceipt | null>(null);

  // Filtered inventory
  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(invSearch.toLowerCase()) ||
    i.code.toLowerCase().includes(invSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(invSearch.toLowerCase()) ||
    i.engineApplications.toLowerCase().includes(invSearch.toLowerCase())
  );

  // Filtered POS Items
  const posAvailableItems = inventory.filter(i => 
    i.stock > 0 && (
      i.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      i.code.toLowerCase().includes(posSearch.toLowerCase())
    )
  );

  const handleCreateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    addInventoryItem({
      code,
      name,
      category,
      brand,
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      engineApplications: engineApps || 'Universal Diesel',
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 2,
      unit: 'pz'
    });

    setCode('');
    setName('');
    setCostPrice('');
    setSalePrice('');
    setEngineApps('');
    setShowAddInvModal(false);
  };

  // Cart operations
  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev;
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const handlePosCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const receipt = createPosSale(cart, posPaymentMethod, posClientName);
    setLastReceipt(receipt);
    setCart([]);
  };

  const pendingRequests = warehouseRequests.filter(r => r.status === 'pendiente');

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto min-h-0 space-y-6">
      {/* MODULE 1: CONTROL DE INVENTARIO Y KARDEX */}
      {activeTab === 'inventario' && (
        <div className="space-y-6">
          {/* Header Bar with Search & Add Item */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="Buscar por código, nombre, categoría o motor..."
                className="w-full bg-white border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowAddInvModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#002855] hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold uppercase rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Alta de Refacción</span>
            </button>
          </div>

          {/* Low Stock Banner Alert */}
          {inventory.some(i => i.stock <= i.minStock) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Atención: Existen artículos con existencia igual o inferior al stock mínimo.</span>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Descripción de Refacción</th>
                    <th className="p-3">Categoría / Marca</th>
                    <th className="p-3">Aplicación de Motor</th>
                    <th className="p-3 font-mono">P. Costo</th>
                    <th className="p-3 font-mono">P. Venta</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-right">Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{item.code}</td>
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-600">{item.category} • {item.brand}</td>
                        <td className="p-3 text-slate-600 text-[11px]">{item.engineApplications}</td>
                        <td className="p-3 font-mono text-slate-600">${item.costPrice.toLocaleString('es-MX')}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">${item.salePrice.toLocaleString('es-MX')}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => updateInventoryStock(item.id, 1)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono rounded text-xs font-bold border border-slate-300"
                            >
                              +
                            </button>
                            <button
                              onClick={() => updateInventoryStock(item.id, -1)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono rounded text-xs font-bold border border-slate-300"
                            >
                              -
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Item Modal */}
          {showAddInvModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl text-slate-900">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#002855]">Alta de Refacción Diesel</h3>
                  <button onClick={() => setShowAddInvModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <form onSubmit={handleCreateInventoryItem} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Código / Clave</label>
                      <input
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="FLE-FF5776"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md"
                      >
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Motor / Inyección">Motor / Inyección</option>
                        <option value="Motor / Turbo">Motor / Turbo</option>
                        <option value="Frenos y Suspensión">Frenos y Suspensión</option>
                        <option value="Lubricantes">Lubricantes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Nombre / Descripción</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Filtro Separador de Combustible"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Aplicación de Motor</label>
                    <input
                      type="text"
                      value={engineApps}
                      onChange={(e) => setEngineApps(e.target.value)}
                      placeholder="Cummins ISX / Detroit DD15"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Precio Costo ($)</label>
                      <input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="450"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Precio Venta ($)</label>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="850"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Stock Inicial</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Stock Mínimo Alerta</label>
                      <input
                        type="number"
                        value={minStock}
                        onChange={(e) => setMinStock(e.target.value)}
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#002855] text-white py-2 text-xs font-bold uppercase rounded-md mt-2 shadow-sm"
                  >
                    Guardar en Catálogo
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: PUNTO DE VENTA (MOSTRADOR) */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Catalog Search & Selection */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span>Venta Directa de Mostrador</span>
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="Buscar clave o descripción para agregar a venta..."
                className="w-full bg-white border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 rounded-md"
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {posAvailableItems.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Clave: {item.code} • Stock: {item.stock} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-800">${item.salePrice.toLocaleString('es-MX')}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-[#002855] hover:bg-blue-900 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Cart */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] border-b border-slate-200 pb-2">
                Ticket de Compra ({cart.length} Artículos)
              </h2>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-4 text-center">Carrito de venta vacío.</p>
                ) : (
                  cart.map((ci) => (
                    <div key={ci.item.id} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-md text-xs">
                      <div>
                        <p className="text-slate-900 font-bold">{ci.item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">x{ci.quantity} @ ${ci.item.salePrice}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-800 font-bold">${(ci.quantity * ci.item.salePrice).toLocaleString('es-MX')}</span>
                        <button onClick={() => removeFromCart(ci.item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <form onSubmit={handlePosCheckout} className="space-y-3 pt-3 border-t border-slate-200">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Nombre Cliente de Mostrador</label>
                    <input
                      type="text"
                      value={posClientName}
                      onChange={(e) => setPosClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Método de Pago</label>
                    <select
                      value={posPaymentMethod}
                      onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 rounded-md"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta de Débito / Crédito</option>
                      <option value="Transferencia">Transferencia Spei</option>
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-900">${cart.reduce((s, c) => s + (c.item.salePrice * c.quantity), 0).toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>IVA (16%):</span>
                      <span className="font-mono text-slate-900">${(cart.reduce((s, c) => s + (c.item.salePrice * c.quantity), 0) * 0.16).toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between text-[#002855] font-bold text-sm pt-1 border-t border-blue-200">
                      <span>TOTAL:</span>
                      <span className="font-mono font-bold">${(cart.reduce((s, c) => s + (c.item.salePrice * c.quantity), 0) * 1.16).toLocaleString('es-MX')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#002855] hover:bg-blue-900 text-white py-2.5 text-xs font-bold uppercase rounded-md shadow-sm"
                  >
                    Cobrar e Imprimir Ticket
                  </button>
                </form>
              )}
            </div>

            {lastReceipt && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <p className="text-emerald-800 font-bold uppercase">✓ Ticket {lastReceipt.folio} Generado</p>
                <p className="text-slate-700">Cobro Registrado: <strong className="font-mono text-slate-900">${lastReceipt.total.toLocaleString('es-MX')} MXN</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE: CONTROL Y PRÉSTAMO DE HERRAMIENTAS */}
      {activeTab === 'herramientas' && (
        <HerramientasModule />
      )}

      {/* MODULE: ÓRDENES DE COMPRA Y REABASTECIMIENTO */}
      {activeTab === 'compras' && (
        <ComprasModule />
      )}

      {/* MODULE: DIRECTORIO DE PROVEEDORES */}
      {activeTab === 'proveedores' && (
        <ContactosModule initialTab="proveedores" />
      )}

      {/* MODULE 3: SURTIDO A TALLER */}
      {activeTab === 'surtido' && (
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] flex items-center gap-2">
            <SendToBack className="w-4 h-4 text-blue-600" />
            <span>Surtido y Despacho de Refacciones para Taller</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 ? (
              <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-xs shadow-sm">
                No hay solicitudes pendientes de despacho para mecánicos en este momento.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-mono text-blue-700 font-bold text-xs">{req.osId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{req.requestedAt}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">{req.itemName}</p>
                    <p className="text-[11px] text-slate-600 font-mono">Clave: {req.itemCode} • Cantidad Solicitada: <strong className="text-blue-800">{req.quantity} pz</strong></p>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <p>Mecánico Solicitante: <strong className="text-slate-900">{req.technicianName}</strong></p>
                    <p>Unidad: {req.vehicleInfo}</p>
                  </div>

                  <button
                    onClick={() => dispatchWarehouseRequest(req.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    Despachar y Descontar de Inventario
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
