import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import GlassCard from '../../components/ui/GlassCard';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
        </div>

      <GlassCard className="p-12 max-w-md w-full text-center space-y-6 relative z-10" delay={0.1}>
        {status === 'verifying' && (
          <>
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
                <p className="text-slate-400">Please wait while we secure your account.</p>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl border border-emerald-500/30 animate-pulse">✓</div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                <p className="text-slate-400">Your account is now active.<br/>Redirecting to login...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-4xl border border-red-500/30">✕</div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-slate-400 mb-6">Invalid or expired verification token.</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30"
                >
                    Go to Login
                </button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
