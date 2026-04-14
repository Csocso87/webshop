import React, { useEffect, useState } from 'react';
import { categories } from '../../services/api';

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCats = () => categories.getAll().then(res => setCats(res.data));
  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await categories.update(editingId, { name, description: desc });
      setEditingId(null);
    } else {
      await categories.create({ name, description: desc });
    }
    setName('');
    setDesc('');
    fetchCats();
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDesc(cat.description || '');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Biztosan törlöd ezt a kategóriát?')) {
      await categories.delete(id);
      fetchCats();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Kategóriák kezelése</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            placeholder="Kategória név" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            placeholder="Leírás" 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            {editingId ? 'Frissít' : 'Létrehoz'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setName(''); setDesc(''); }} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition">
              Mégse
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Név</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leírás</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cats.map(cat => (
                <tr key={cat.id}>
                  <td className="px-6 py-4">{cat.id}</td>
                  <td className="px-6 py-4">{cat.name}</td>
                  <td className="px-6 py-4">{cat.description}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 mr-3">Szerkeszt</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">Törlés</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;