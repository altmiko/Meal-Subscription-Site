import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function ManageMenu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', description: '', price: '', image: '', isAvailable: true });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const res = await axiosInstance.get(`/api/restaurants/${id}/menu`);
                if (!mounted) return;
                setItems(res.data?.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => (mounted = false);
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = async () => {
        if (!form.name || !form.price) return;
        setSaving(true);
        try {
            const payload = { ...form, price: parseFloat(form.price) };
            const res = await axiosInstance.post(`/api/restaurants/${id}/menu`, payload);
            setItems((s) => [...s, res.data.data]);
            setForm({ name: '', description: '', price: '', image: '', isAvailable: true });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Delete this item?')) return;
        try {
            await axiosInstance.delete(`/api/restaurants/${id}/menu/${itemId}`);
            setItems((s) => s.filter((i) => i._id !== itemId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">← Back</button>

                <h2 className="text-2xl font-bold mb-4">Manage Menu</h2>

                <div className="bg-white p-4 rounded-xl shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Item name" className="p-2 border rounded" />
                        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="p-2 border rounded" />
                        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className="p-2 border rounded" />
                    </div>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full mt-3 p-2 border rounded" />
                    <div className="flex gap-3 mt-3">
                        <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-emerald-500 text-white rounded">{saving ? 'Saving...' : 'Add Item'}</button>
                        <button onClick={() => navigate(`/restaurant/${id}`)} className="px-4 py-2 bg-gray-200 rounded">View Menu</button>
                    </div>
                </div>

                {loading ? <div>Loading...</div> : (
                    <div className="grid gap-3">
                        {items.map((it) => (
                            <div key={it._id} className="bg-white p-3 rounded-xl shadow flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{it.name} <span className="text-sm text-gray-500"> ${it.price.toFixed(2)}</span></div>
                                    <div className="text-sm text-gray-600">{it.description}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/restaurant/${id}/menu/${it._id}/edit`)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                                    <button onClick={() => handleDelete(it._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}