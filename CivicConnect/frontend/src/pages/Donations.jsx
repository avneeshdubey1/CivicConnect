import { useEffect, useState } from 'react';
import axios from 'axios';
import { Heart, Loader2 } from 'lucide-react';

export default function Donations() {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState({}); // Track loading state per NGO

    useEffect(() => {
        const fetchNgos = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/donations/ngos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgos(res.data);
        };
        fetchNgos();
    }, []);

    const handleDonate = async (ngoId) => {
        const amount = prompt("Enter donation amount (₹):", "500");
        if (!amount || isNaN(amount) || amount <= 0) return;

        setLoading(prev => ({ ...prev, [ngoId]: true }));

        try {
            const token = localStorage.getItem('token');
            // Call backend to get Stripe URL
            const res = await axios.post('http://localhost:8080/api/donations/create-checkout-session', 
                { ngoId, amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // REDIRECT TO STRIPE
            window.location.href = res.data.url; 
        } catch (error) {
            alert("Payment initialization failed.");
            setLoading(prev => ({ ...prev, [ngoId]: false }));
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Make a Real Impact</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">Support verified organizations. 100% secure payments via Stripe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ngos.map((ngo) => (
                    <div key={ngo.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="h-40 bg-slate-50 relative p-6 flex items-center justify-center border-b border-slate-100">
                            <img src={ngo.logoUrl} alt={ngo.name} className="max-h-24 max-w-full object-contain mix-blend-multiply filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                            <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 shadow-sm">
                                {ngo.category}
                            </div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="font-bold text-xl text-slate-900 mb-2">{ngo.name}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{ngo.description}</p>
                            
                            <button 
                                onClick={() => handleDonate(ngo.id)}
                                disabled={loading[ngo.id]}
                                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:shadow-emerald-200"
                            >
                                {loading[ngo.id] ? <Loader2 className="animate-spin" size={18} /> : <><Heart size={18} className="fill-current" /> Donate</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}