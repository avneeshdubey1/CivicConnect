import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Download, Loader2, X } from 'lucide-react';

// 👇 REPLACE THIS WITH YOUR ACTUAL PUBLISHABLE KEY (Starts with pk_test_...)
const stripePromise = loadStripe("pk_test_51SjV6JBq8V4jtLK4DOO7wqjdrDHHaEdgyF1VoGITMlKRbplE1xXoO8JfKJiG2YhE1TKdrPhfKdHA2jxHcjHpnMOD00vDgkG1Mv");

const CheckoutForm = ({ ngo, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [successId, setSuccessId] = useState(null); // Stores ID for receipt
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) return;

        try {
            // 1. Get Client Secret from Backend
            const token = localStorage.getItem('token');
            const { data: { clientSecret } } = await axios.post('http://localhost:8080/api/donations/create-payment-intent', 
                { amount: parseFloat(amount) }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Confirm Payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            // 3. Save to Backend if Successful
            if (result.paymentIntent.status === 'succeeded') {
                const confirmResponse = await axios.post('http://localhost:8080/api/donations/confirm', 
                    { 
                        ngoId: ngo.id, 
                        amount: parseFloat(amount), 
                        txnId: result.paymentIntent.id 
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessId(confirmResponse.data.id);
            }

        } catch (err) {
            setError(err.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    // VIEW: Success Screen with Receipt Download
    if (successId) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">🎉</div>
                <h3 className="text-xl font-bold text-slate-800">Donation Successful!</h3>
                <p className="text-slate-500 text-sm">Thank you for supporting {ngo.name}.</p>
                
                <a 
                    href={`http://localhost:8080/api/donations/receipt/${successId}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-medium"
                >
                    <Download size={18} /> Download Receipt (PDF)
                </a>
                
                <button onClick={onClose} className="block w-full text-slate-400 text-sm mt-4 hover:text-slate-600">Close</button>
            </div>
        );
    }

    // VIEW: Payment Form
    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount (₹)</label>
                <input 
                    type="number" 
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 500"
                    required 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Card Details</label>
                <div className="p-3 border border-slate-200 rounded-lg">
                    <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
                </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

            <button 
                type="submit" 
                disabled={!stripe || loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Processing...' : `Donate ₹${amount || '0'}`}
            </button>
        </form>
    );
};

export default function DonationModal({ ngo, onClose }) {
    if (!ngo) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">Donate to {ngo.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm ngo={ngo} onClose={onClose} />
                    </Elements>
                </div>
                <div className="p-3 bg-slate-50 text-center text-[10px] text-slate-400 border-t border-slate-100">
                    Secured by Stripe &bull; 100% Secure Transaction
                </div>
            </div>
        </div>
    );
}