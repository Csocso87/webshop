import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orders } from '../services/api';
import { formatPrice } from '../utils/format';

const Profile = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user && !user.is_admin) {
      orders.getMyOrders().then(res => setMyOrders(res.data));
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Profil</h2>
        <p className="mb-2"><strong>Név:</strong> {user?.name}</p>
        <p className="mb-4"><strong>Email:</strong> {user?.email}</p>
      </div>

      {user && !user.is_admin && (
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Rendeléseim</h3>
          {myOrders.length === 0 ? (
            <p>Még nincs rendelésed.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendelés ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dátum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Végösszeg</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myOrders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4">{order.id}</td>
                      <td className="px-6 py-4">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{formatPrice(order.total_amount)}</td>
                      <td className="px-6 py-4">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;