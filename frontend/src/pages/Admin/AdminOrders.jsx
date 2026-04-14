import React, { useEffect, useState } from 'react';
import { orders } from '../../services/api';
import { formatPrice } from '../../utils/format';

const AdminOrders = () => {
  const [orderList, setOrderList] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [details, setDetails] = useState({});

  const fetchOrders = () => orders.adminGetAll().then(res => setOrderList(res.data));
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    await orders.adminUpdateStatus(orderId, status);
    fetchOrders();
  };

  const toggleDetails = async (orderId) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      if (!details[orderId]) {
        try {
          const res = await orders.adminGetOrderDetails(orderId);
          setDetails(prev => ({ ...prev, [orderId]: res.data }));
        } catch (err) {
          console.error('Hiba a részletek betöltésekor', err);
          setDetails(prev => ({ ...prev, [orderId]: { items: [] } }));
        }
      }
      newSet.add(orderId);
    }
    setExpandedIds(newSet);
  };

  // Fizetési mód formázása
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'Utánvét';
      case 'credit_card':
        return 'Bankkártya';
      case 'paypal':
        return 'PayPal';
      default:
        return method || '-';
    }
  };

  // Biztonságos segédfüggvény a tételek lekéréséhez
  const getOrderItems = (orderId) => {
    const orderDetails = details[orderId];
    if (orderDetails && Array.isArray(orderDetails.items)) {
      return orderDetails.items;
    }
    return [];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Rendelések kezelése</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendelés ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Felhasználó</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dátum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Végösszeg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Művelet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Részletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orderList.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="px-6 py-4">{order.id}</td>
                    <td className="px-6 py-4">{order.user_name} ({order.user_email})</td>
                    <td className="px-6 py-4">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{formatPrice(order.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : ''}
                        ${order.status === 'processing' ? 'bg-blue-200 text-blue-800' : ''}
                        ${order.status === 'shipped' ? 'bg-purple-200 text-purple-800' : ''}
                        ${order.status === 'delivered' ? 'bg-green-200 text-green-800' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-200 text-red-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Függőben</option>
                        <option value="processing">Feldolgozás</option>
                        <option value="shipped">Szállítva</option>
                        <option value="delivered">Kézbesítve</option>
                        <option value="cancelled">Törölve</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDetails(order.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedIds.has(order.id) ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedIds.has(order.id) && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Szállítási adatok</h4>
                            <p><strong>Név:</strong> {details[order.id]?.shipping_name || order.shipping_name || '-'}</p>
                            <p><strong>Cím:</strong> {details[order.id]?.shipping_address || order.shipping_address || '-'}, {details[order.id]?.shipping_city || order.shipping_city || '-'}, {details[order.id]?.shipping_zip || order.shipping_zip || '-'}, {details[order.id]?.shipping_country || order.shipping_country || '-'}</p>
                            <p><strong>Fizetési mód:</strong> {formatPaymentMethod(details[order.id]?.payment_method || order.payment_method)}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Termékek</h4>
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left">Termék</th>
                                  <th className="px-4 py-2 text-left">Mennyiség</th>
                                  <th className="px-4 py-2 text-left">Egységár</th>
                                  <th className="px-4 py-2 text-left">Összeg</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getOrderItems(order.id).map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2">{item.quantity}</td>
                                    <td className="px-4 py-2">{formatPrice(item.price)}</td>
                                    <td className="px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;