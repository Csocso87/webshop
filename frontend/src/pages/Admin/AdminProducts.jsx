import React, { useEffect, useState, useRef } from 'react';
import { products, categories } from '../../services/api';
import { formatPrice } from '../../utils/format';
import ImageUploader from '../../components/ImageUploader';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminProducts = () => {
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [quillKey, setQuillKey] = useState(Date.now()); // Kulcs a ReactQuill újrarendereléséhez

  const fetchProducts = () => products.getAll().then(res => {
    const productData = res.data.data || res.data;
    setProductList(productData);
  });
  const fetchCategories = () => categories.getAll().then(res => setCategoryList(res.data));
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleDescriptionChange = (value) => setForm({ ...form, description: value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' });
    setImageFile(null);
    setGalleryImages([]);
    setQuillKey(Date.now()); // Frissítjük a Quill kulcsát, hogy újrarendelődjön
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasImage = form.image_url && form.image_url.startsWith('data:');
    const hasGalleryImages = galleryImages.length > 0;
    if (!hasImage && !hasGalleryImages) {
      toast.error('Legalább egy képet fel kell tölteni!');
      return;
    }

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
        toast.success('Termék frissítve');
        setEditingId(null);
      } else {
        const response = await products.create(productData);
        if (response.data && response.data.id) {
          toast.success('Termék létrehozva!');
        } else {
          toast.error(response.data?.error || 'Ismeretlen hiba a termék létrehozásakor');
          return;
        }
      }
      resetForm(); // Kiürítjük a formot
      await fetchProducts(); // Frissítjük a terméklistát
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Hiba a mentés során';
      toast.error(errorMsg);
    }
  };

  const handleEdit = async (p) => {
    setEditingId(p.id);
    setImageFile(null);
    try {
      const res = await products.getById(p.id);
      const productData = res.data;
      setForm({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || '',
        stock: productData.stock || '',
        image_url: productData.image_url || '',
        category_id: productData.category_id || ''
      });
      setGalleryImages(productData.images || []);
      setQuillKey(Date.now()); // Opcionális: a Quill újrarendelése a meglévő tartalommal (nem szükséges, mert a value frissül)
    } catch (err) {
      console.error('Hiba a termékadatok betöltésekor', err);
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        stock: p.stock || '',
        image_url: p.image_url || '',
        category_id: p.category_id || ''
      });
      setGalleryImages([]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Biztosan törlöd ezt a terméket?')) {
      await products.delete(id);
      toast.success('Termék törölve');
      if (editingId === id) handleCancel();
      fetchProducts();
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Termékek kezelése</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Termék név" value={form.name} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <input name="price" type="number" step="1" placeholder="Ár (Ft)" value={form.price} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <input name="stock" type="number" placeholder="Készlet" value={form.stock} onChange={handleChange} required className="border border-gray-300 rounded-lg px-4 py-2" />
          <select name="category_id" value={form.category_id} onChange={handleChange} className="border border-gray-300 rounded-lg px-4 py-2">
            <option value="">Válassz kategóriát</option>
            {categoryList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        {form.image_url && !form.image_url.startsWith('data:') && (
          <div className="mt-2">Jelenlegi kép: <img src={form.image_url} alt="current" className="w-12 h-12 object-cover inline" /></div>
        )}
        {form.image_url && form.image_url.startsWith('data:') && (
          <div className="mt-2">Új kép előnézet: <img src={form.image_url} alt="preview" className="w-12 h-12 object-cover inline" /></div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Leírás</label>
          <ReactQuill
            key={quillKey}
            theme="snow"
            value={form.description}
            onChange={handleDescriptionChange}
            placeholder="Termék leírása (formázható)"
            className="bg-white rounded-lg"
            modules={quillModules}
          />
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
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Név</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ár</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Készlet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategória</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
              </tr>
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