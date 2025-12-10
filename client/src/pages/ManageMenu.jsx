import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function ManageMenu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/api/restaurants/${id}/menu`);
            setItems(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim() || form.price === '') {
            setError('Name and price are required');
            return;
        }
        const priceNum = Number(form.price);
        if (Number.isNaN(priceNum)) return setError('Price must be a number');

        setSaving(true);
        try {
            await axiosInstance.post(`/api/restaurants/${id}/menu`, {
                name: form.name.trim(),
                description: form.description.trim(),
                price: priceNum,
            });
            setForm({ name: '', description: '', price: '' });
            loadItems();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to add');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return;
        try {
            await axiosInstance.delete(`/api/restaurants/${id}/menu/${id}`);
            setItems((s) => s.filter((i) => i._id !== id));
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    };

    const startEdit = (item) => {
        const name = prompt('Edit name', item.name);
        if (name === null) return;
        const desc = prompt('Edit description', item.description || '');
        if (desc === null) return;
        const price = prompt('Edit price', String(item.price));
        if (price === null) return;
        const priceNum = Number(price);
        if (Number.isNaN(priceNum)) return alert('Invalid price');

        axiosInstance.put(`/api/menu/${item._id}`, { name, description: desc, price: priceNum })
            .then(() => loadItems())
            .catch(() => alert('Update failed'));
    };

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">Manage Menu</h1>

                    <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3">
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Item name" className="p-3 border rounded" />
                        <input name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" className="p-3 border rounded" />
                        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="p-3 border rounded" />
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 text-white rounded">
                                {saving ? 'Adding...' : 'Add Item'}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Back</button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Current Items</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : items.length === 0 ? (
                        <div className="text-gray-500">No items yet</div>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((it) => (
                                <li key={it._id} className="flex items-center justify-between border p-3 rounded">
                                    <div>
                                        <div className="font-semibold">{it.name}</div>
                                        <div className="text-sm text-gray-600">{it.description}</div>
                                        <div className="text-sm font-medium mt-1">${it.price.toFixed(2)}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(it)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                                        <button onClick={() => handleDelete(it._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}