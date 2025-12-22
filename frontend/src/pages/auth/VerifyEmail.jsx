import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-4">
        {status === 'verifying' && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-bold text-gray-800">Verifying Email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
            <h2 className="text-xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-500">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">✕</div>
            <h2 className="text-xl font-bold text-gray-800">Verification Failed</h2>
            <p className="text-gray-500">Invalid or expired token.</p>
            <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Go to Login</button>
          </>
        )}
      </div>
    </div>
  );
}
