import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { isUserAppliedToScholarship } from '../../../shared/services/applicationScholarshipService';

interface ApplyScholarshipButtonProps {
  scholarshipId: string;
  scholarshipTitle: string;
  profileId: string;
  variant?: 'primary' | 'secondary';
}

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ApplyScholarshipButton = ({
  scholarshipId,
  scholarshipTitle,
  profileId,
  variant = 'primary',
}: ApplyScholarshipButtonProps) => {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  useEffect(() => {
    const checkApplication = async () => {
      if (!profileId || !scholarshipId) return;

      try {
        setIsChecking(true);
        const applied = await isUserAppliedToScholarship(profileId, scholarshipId);
        setIsAlreadyApplied(applied);
      } catch (error) {
        setIsAlreadyApplied(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkApplication();
  }, [profileId, scholarshipId]);

  const handleApply = () => {
    if (!profileId) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo identificar tu perfil',
        life: 3000,
      });
      return;
    }

    if (isAlreadyApplied) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'Ya aplicaste',
        detail: `Ya tienes una aplicacion para la beca ${scholarshipTitle}`,
        life: 3000,
      });
      return;
    }

    navigate(`/apply-scholarship/${scholarshipId}`, {
      state: { scholarshipTitle },
    });
  };

  const isDisabled = isChecking || isAlreadyApplied;
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses =
    variant === 'primary'
      ? `${
          isAlreadyApplied
            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } w-full`
      : `${
          isAlreadyApplied
            ? 'border border-gray-300 text-gray-600 cursor-not-allowed'
            : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
        }`;

  const getButtonText = () => {
    if (isChecking) return 'Verificando...';
    if (isAlreadyApplied) return 'Ya aplicaste';
    return 'Aplicar a esta beca';
  };

  return (
    <>
      <Toast ref={toastRef} />
      <button onClick={handleApply} disabled={isDisabled} className={`${baseClasses} ${variantClasses}`}>
        {isChecking ? (
          <>
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            {getButtonText()}
          </>
        ) : isAlreadyApplied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            {getButtonText()}
          </>
        ) : (
          getButtonText()
        )}
      </button>
    </>
  );
};
