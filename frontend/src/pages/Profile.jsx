import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orders } from '../services/api';
import { formatPrice } from '../utils/format';

const Profile = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [details, setDetails] = useState({});

  useEffect(() => {
    if (user && !user.is_admin) orders.getMyOrders().then(res => setMyOrders(res.data));
  }, [user]);

  const toggleDetails = async (orderId) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      if (!details[orderId]) {
        try {
          const res = await orders.getOrderDetails(orderId);
          setDetails(prev => ({ ...prev, [orderId]: res.data }));
        } catch {
          setDetails(prev => ({ ...prev, [orderId]: { items: [] } }));
        }
      }
      newSet.add(orderId);
    }
    setExpandedIds(newSet);
  };

  const getOrderItems = (orderId) => details[orderId]?.items || [];

  const statusConfig = {
    pending: { label: 'Függőben', bg: 'bg-yellow-200', text: 'text-yellow-800' },
    processing: { label: 'Feldolgozás', bg: 'bg-blue-200', text: 'text-blue-800' },
    shipped: { label: 'Szállítva', bg: 'bg-purple-200', text: 'text-purple-800' },
    delivered: { label: 'Kézbesítve', bg: 'bg-green-200', text: 'text-green-800' },
    cancelled: { label: 'Törölve', bg: 'bg-red-200', text: 'text-red-800' }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    if (!config) return <span>{status}</span>;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Profil</h2>
        <p className="mb-2"><strong>Név:</strong> {user?.name}</p>
        <p className="mb-4"><strong>Email:</strong> {user?.email}</p>
      </div>

      {user && !user.is_admin && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h3 className="text-xl font-bold p-6 pb-0">Rendeléseim</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendelés ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dátum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Végösszeg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Részletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Még nincs rendelésed.</td>
                  </tr>
                ) : (
                  myOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td className="px-6 py-4">{order.id}</td>
                        <td className="px-6 py-4">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{formatPrice(order.total_amount)}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleDetails(order.id)} className="text-blue-600 hover:text-blue-800">
                            {expandedIds.has(order.id) ? '▲' : '▼'}
                          </button>
                        </td>
                      </tr>
                      {expandedIds.has(order.id) && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Szállítási adatok</h4>
                                <p><strong>Név:</strong> {details[order.id]?.shipping_name || order.shipping_name || '-'}</p>
                                <p><strong>Cím:</strong> {details[order.id]?.shipping_address || order.shipping_address || '-'}, {details[order.id]?.shipping_city || order.shipping_city || '-'}, {details[order.id]?.shipping_zip || order.shipping_zip || '-'}, {details[order.id]?.shipping_country || order.shipping_country || '-'}</p>
                                <p><strong>Fizetési mód:</strong> {details[order.id]?.payment_method === 'cash_on_delivery' ? 'Utánvét' : (details[order.id]?.payment_method || order.payment_method || '-')}</p>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;