import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function DonationSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // ✅ Use ref to prevent double-firing in Strict Mode
    const processedRef = useRef(false);

    const [status, setStatus] = useState('VERIFYING'); // VERIFYING, SUCCESS, ERROR
    const [donationId, setDonationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const confirmDonation = async () => {
            const sessionId = searchParams.get('session_id');
            const ngoId = searchParams.get('ngo_id');
            const amount = searchParams.get('amount');

            // If params are missing, user shouldn't be here
            if (!sessionId || !ngoId) {
                setStatus('ERROR');
                setErrorMessage('Invalid session details.');
                return;
            }

            try {
                const token = localStorage.getItem('token');

                // Confirm with backend
                const response = await axios.post('http://localhost:8080/api/donations/confirm',
                    { ngoId, amount, txnId: sessionId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data && response.data.id) {
                    setDonationId(response.data.id);
                    setStatus('SUCCESS');
                } else {
                    throw new Error("No Donation ID returned");
                }
            } catch (error) {
                console.error("Confirmation failed", error);
                // Even if it fails (e.g. duplicate confirmation), if we have a session_id, 
                // we might want to tell the user to check their profile.
                setStatus('ERROR');
                setErrorMessage('Could not verify donation. It may have already been processed.');
            }
        };

        // Only run if we haven't verified yet
        if (status === 'VERIFYING' && !processedRef.current) {
            processedRef.current = true;
            confirmDonation();
        }
    }, [searchParams]);

    const handleDownload = () => {
        if (!donationId) return;
        // Direct download link
        window.open(`http://localhost:8080/api/donations/receipt/${donationId}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center space-y-6">

                {/* 1. LOADING STATE */}
                {status === 'VERIFYING' && (
                    <div className="py-12">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <h2 className="text-xl font-bold text-slate-700">Verifying Payment...</h2>
                        <p className="text-slate-500 text-sm">Please wait while we generate your receipt.</p>
                    </div>
                )}

                {/* 2. SUCCESS STATE */}
                {status === 'SUCCESS' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                            <CheckCircle size={40} className="text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Donation Successful!</h2>
                            <p className="text-slate-500 mt-2">Thank you for your generosity. Your transaction has been recorded.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleDownload}
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                            >
                                <Download size={20} /> Download Official Receipt
                            </button>
                            <p className="text-[10px] text-slate-400 mt-2">Format: PDF • Size: ~50KB</p>
                        </div>

                        <button onClick={() => navigate('/donations')} className="text-emerald-600 font-medium hover:underline text-sm">
                            Return to Donations
                        </button>
                    </>
                )}

                {/* 3. ERROR STATE */}
                {status === 'ERROR' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={40} className="text-red-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Verification Issue</h2>
                            <p className="text-slate-500 mt-2 text-sm">{errorMessage}</p>
                        </div>

                        <button
                            onClick={() => navigate('/donations')}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-600 transition-all"
                        >
                            <ArrowLeft size={18} /> Back to Donations
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}