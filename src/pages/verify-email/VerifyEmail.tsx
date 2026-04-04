import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { resendVerificationEmail } from '../../shared/services/authService';
import type { RootState } from '../../store/store';

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const storeUserEmail = useSelector((state: RootState) => state.auth.user?.email);
  const userEmail = searchParams.get('email') || storeUserEmail;

  useEffect(() => {
    if (!userEmail) {
      window.location.href = '/';
    }
  }, [userEmail]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setResendError('');
    
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setResendError(err.message || 'Error al reenviar el correo');
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenMailApp = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <MailIcon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-200 animate-ping opacity-25" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifica tu correo
          </h1>
          
          <p className="text-gray-500 mb-6">
            Hemos enviado un enlace de verificación a tu correo electrónico
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6 border border-blue-100">
            <MailIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">{userEmail}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">Pasos a seguir:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  1
                </div>
                <p className="text-sm text-gray-600">Abre tu bandeja de entrada</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  2
                </div>
                <p className="text-sm text-gray-600">Busca el correo de UniPath</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  3
                </div>
                <p className="text-sm text-gray-600">Haz clic en el enlace de verificación</p>
              </div>
            </div>
          </div>

          <Button
            label="Abrir correo"
            icon="pi pi-external-link"
            iconPos="right"
            onClick={handleOpenMailApp}
            className="btn-primary w-full justify-center mb-3"
          />

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              ¿No recibiste el correo?
            </p>
            
            {resendSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-2">
                <i className="pi pi-check-circle" />
                <span>Correo reenviado exitosamente</span>
              </div>
            )}

            {resendError && (
              <div className="text-red-500 text-sm mb-2">
                {resendError}
              </div>
            )}

            {!resendSuccess && (
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshIcon className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Reenviando...' : 'Reenviar correo'}
              </button>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <i className="pi pi-exclamation-triangle text-amber-500 text-sm mt-0.5" />
            <p className="text-xs text-amber-700 text-left">
              Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-400">
            ¿Ingresaste el correo incorrecto?{' '}
            <a href="/" className="text-blue-600 hover:underline">Volver al registro</a>
          </p>
          <p className="text-xs text-gray-400">
            ¿Necesitas ayuda?{' '}
            <a href="#" className="text-blue-600 hover:underline">Contacta soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}
