import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import type { RootState, AppDispatch } from '../../../app/store/store';
import { fetchCheckIfApplied } from '../../../app/store/application/thunks';

interface ApplyButtonProps {
  universityId: string;
  universityName: string;
  profileId: string;
  variant?: 'primary' | 'secondary';
}

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      strokeDasharray="31.4 31.4"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const ApplyButton = ({
  universityId,
  universityName,
  profileId,
  variant = 'primary',
}: ApplyButtonProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const toastRef = useRef(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { checkStatus } = useSelector(
    (state: RootState) => state.application
  );
  const userApplications = useSelector(
    (state: RootState) => state.application.userApplications
  );

  useEffect(() => {
    if (profileId && universityId) {
      setIsChecking(true);
      dispatch(fetchCheckIfApplied({ profileId, universityId }))
        .catch((err) => {
          console.warn('[ApplyButton] Error checking if applied:', err);
        })
        .finally(() => setIsChecking(false));
    }
  }, [profileId, universityId, dispatch]);

  useEffect(() => {
    const applied = userApplications[universityId] ?? false;
    setIsAlreadyApplied(applied);
  }, [userApplications, universityId]);

  const handleApply = async () => {
    if (!profileId) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar tu perfil',
          life: 3000,
        });
      }
      return;
    }

    if (isAlreadyApplied) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'info',
          summary: 'Ya aplicaste',
          detail: `Ya tienes una aplicación a ${universityName}`,
          life: 3000,
        });
      }
      return;
    }

    navigate(`/apply/${universityId}`, {
      state: { universityName },
    });
  };

  const isLoading = checkStatus === 'pending' || isChecking;
  const isDisabled = isLoading || isAlreadyApplied;

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
    if (isLoading) return 'Verificando...';
    if (isAlreadyApplied) return 'Ya aplicaste';
    return 'Aplicar a esta universidad';
  };

  return (
    <>
      <Toast ref={toastRef} />
      <button
        onClick={handleApply}
        disabled={isDisabled}
        className={`${baseClasses} ${variantClasses}`}
      >
        {isLoading ? (
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
