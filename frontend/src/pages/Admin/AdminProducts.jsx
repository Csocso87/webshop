import React, { useEffect, useState } from 'react';
import { products, categories } from '../../services/api';
import { formatPrice } from '../../utils/format';
import ImageUploader from '../../components/ImageUploader';

const AdminProducts = () => {
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const fetchProducts = () => products.getAll().then(res => setProductList(res.data));
  const fetchCategories = () => categories.getAll().then(res => setCategoryList(res.data));
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', stock: '', category_id: '' });
    setGalleryImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...form,
      gallery: galleryImages.map(img => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order
      }))
    };

    try {
      if (editingId) {
        await products.update(editingId, productData);
        alert('Termék frissítve');
        setEditingId(null);
      } else {
        const response = await products.create(productData);
        if (response.data && response.data.id) {
          alert('Termék létrehozva galériával!');
        } else {
          alert('Termék létrehozva, de galéria nem menthető?');
        }
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Hiba a mentés során');
    }
  };

  const handleEdit = async (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category_id: p.category_id || ''
    });
    try {
      const res = await products.getById(p.id);
      const images = res.data.images || [];
      setGalleryImages(images.map(img => ({ ...img, is_temp: false })));
    } catch (err) {
      console.error('Hiba a képek betöltésekor', err);
      setGalleryImages([]);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Biztosan törlöd ezt a terméket?')) {
      await products.delete(id);
      if (editingId === id) handleCancel();
      fetchProducts();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Termékek kezelése</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Termék név" value={form.name} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <textarea name="description" placeholder="Leírás" value={form.description} onChange={handleChange} className="border border-gray-300 rounded-lg px-4 py-2" />
          <input name="price" type="number" step="1" placeholder="Ár (Ft)" value={form.price} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <input name="stock" type="number" placeholder="Készlet" value={form.stock} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <select name="category_id" value={form.category_id} onChange={handleChange} className="border border-gray-300 rounded-lg px-4 py-2">
            <option value="">Válassz kategóriát</option>
            {categoryList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <ImageUploader onImagesChange={setGalleryImages} initialImages={galleryImages} />

        <div className="flex gap-3 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            {editingId ? 'Frissít' : 'Létrehoz'}
          </button>
          {editingId && <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition">Mégse</button>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th>ID</th><th>Név</th><th>Ár</th><th>Készlet</th><th>Kategória</th><th>Műveletek</th></tr>
            </thead>
            <tbody>
              {productList.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.id}</td>
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">{p.stock}</td>
                  <td className="px-6 py-4">{p.category_name}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 mr-3">Szerkeszt</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Törlés</button>
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

export default AdminProducts;