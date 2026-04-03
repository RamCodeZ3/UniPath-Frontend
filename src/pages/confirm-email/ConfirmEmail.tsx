import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

// Iconos SVG
const SuccessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const SparkleIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L19 7L14.74 11.27L21 12L14.74 12.73L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.73L3 12L9.26 11.27L5 7L10.91 8.26L12 2Z" />
  </svg>
);

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [showConfetti, setShowConfetti] = useState(true);

  // TODO: Obtener el email del servicio de auth
  const userEmail = 'usuario@ejemplo.com';

  useEffect(() => {
    // Countdown para redirección automática
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile/create');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Ocultar confetti después de 3 segundos
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, [navigate]);

  const handleContinue = () => {
    navigate('/profile/create');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <SparkleIcon
              key={i}
              className={`absolute w-4 h-4 text-yellow-400 animate-ping`}
              style={{
                top: `${Math.random() * 60 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Success Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <SuccessIcon className="w-10 h-10 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <MailIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Correo verificado!
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-500 mb-6">
            Tu cuenta ha sido verificada exitosamente
          </p>

          {/* Email badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
            <MailIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 font-medium">{userEmail}</span>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-info-circle text-blue-600 text-sm" />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">Siguiente paso</p>
                <p className="text-xs text-blue-600 mt-1">
                  Completa tu perfil para personalizar tu experiencia en UniPath.
                </p>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <Button
            label="Continuar"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleContinue}
            className="btn-primary w-full justify-center"
          />

          {/* Auto redirect message */}
          <p className="text-xs text-gray-400 mt-4">
            Serás redirigido automáticamente en {countdown} segundos
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Tienes problemas? <a href="#" className="text-blue-600 hover:underline">Contacta soporte</a>
        </p>
      </div>
    </div>
  );
}
