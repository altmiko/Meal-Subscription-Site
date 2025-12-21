import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [walletLoading, setWalletLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'customer') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const res = await axiosInstance.get("/api/wallet");
      setWallet({
        balance: res.data.walletBalance || 0,
        transactions: res.data.transactions || [],
      });
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    const amount = Number(rechargeAmount);
    if (!amount || amount <= 0) return;

    try {
      await axiosInstance.post("/api/wallet/recharge", { amount, method: "card" });
      setRechargeAmount("");
      await loadWallet();
      alert("Wallet recharged successfully");
    } catch (err) {
      console.error("Recharge failed", err);
      alert("Failed to recharge wallet");
    }
  };

  useEffect(() => {
    if (user) {
      loadWallet();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Wallet & Payments
              </h1>
              <p className="text-gray-600">Manage your wallet and view transactions</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/customer')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-lg font-semibold text-emerald-700 mb-4">
            Current Balance: {wallet.balance} BDT
          </p>
        </div>

        {/* Recharge Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recharge Wallet</h2>
          <form
            onSubmit={handleRecharge}
            className="flex flex-col md:flex-row gap-3 items-start md:items-center"
          >
            <input
              type="number"
              min="1"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full md:w-48"
              placeholder="Recharge amount"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Recharge Wallet
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-3">Recent Transactions</h3>
          {walletLoading ? (
            <p className="text-gray-500">Loading transactions...</p>
          ) : wallet.transactions.length === 0 ? (
            <p className="text-gray-500">No recent transactions.</p>
          ) : (
            <div className="space-y-2">
              {wallet.transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {t.type.replace("_", " ")} ({t.method})
                    </p>
                    <p className="text-gray-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`font-bold ${t.type === "refund" || t.type === "wallet_recharge" || t.type === "referral_reward" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "refund" || t.type === "wallet_recharge" || t.type === "referral_reward" ? "+" : "-"}
                    {t.amount} BDT
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

