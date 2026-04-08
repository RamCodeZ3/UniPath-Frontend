import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchCreateApplication, fetchCheckIfApplied } from '../../../store/application/thunks';
import { resetApplyStatus } from '../../../store/application/applicationSlice';

interface ApplyButtonProps {
  universityId: string;
  universityName: string;
  profileId: string;
  onApplySuccess?: () => void;
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
  onApplySuccess,
  variant = 'primary',
}: ApplyButtonProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [showError, setShowError] = useState(false);

  const { applyStatus, checkStatus, error: reduxError } = useSelector(
    (state: RootState) => state.application
  );
  const userApplications = useSelector(
    (state: RootState) => state.application.userApplications
  );

  // Verificar si ya aplicó al montar
  useEffect(() => {
    if (profileId && universityId) {
      dispatch(fetchCheckIfApplied({ profileId, universityId }));
    }
  }, [profileId, universityId, dispatch]);

  // Actualizar estado de aplicación basado en Redux
  useEffect(() => {
    const applied = userApplications[universityId] ?? false;
    setIsAlreadyApplied(applied);
  }, [userApplications, universityId]);

  // Mostrar error en toast si falla la aplicación
  useEffect(() => {
    if (applyStatus === 'failed' && reduxError) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: reduxError,
          life: 4000,
        });
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  }, [applyStatus, reduxError]);

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

    try {
      // Crear aplicación - await the dispatch
      const result = await dispatch(
        fetchCreateApplication({
          profileId,
          universityId,
        })
      );

      // Verificar si fue exitoso usando el tipo de acción exacto
      if (result.type === 'application/fetchCreateApplication/fulfilled') {
        // Éxito - actualizar estado local inmediatamente
        setIsAlreadyApplied(true);
        setShowError(false);
        
        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'success',
            summary: '¡Éxito!',
            detail: `¡Aplicación registrada exitosamente a ${universityName}!`,
            life: 4000,
          });
        }

        // Llamar callback si existe
        if (onApplySuccess) {
          onApplySuccess();
        }

        // Resetear el estado de Redux inmediatamente
        dispatch(resetApplyStatus());
      } else if (result.type === 'application/fetchCreateApplication/rejected') {
        // Error - obtener el mensaje del payload
        const errorMessage = (result.payload as string) || 'No se pudo registrar la aplicación';
        
        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000,
          });
        }
        // Resetear el estado de Redux después de mostrar el error
        setShowError(true);
        setTimeout(() => {
          dispatch(resetApplyStatus());
          setShowError(false);
        }, 2000);
      }
    } catch (error) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error inesperado',
          detail: 'Ocurrió un error al procesar tu solicitud',
          life: 3000,
        });
      }
      // Resetear el estado
      dispatch(resetApplyStatus());
    }
  };

  const isLoading = applyStatus === 'pending' || checkStatus === 'pending';
  const isDisabled = isLoading || isAlreadyApplied;

  // Clases base
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  // Clases por variante
  const variantClasses =
    variant === 'primary'
      ? `${
          showError
            ? 'bg-red-600 text-white hover:bg-red-700'
            : isAlreadyApplied
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        } w-full`
      : `${
          showError
            ? 'border border-red-600 text-red-600 hover:bg-red-50'
            : isAlreadyApplied
              ? 'border border-gray-300 text-gray-600 cursor-not-allowed'
              : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
        }`;

  const getButtonText = () => {
    if (isLoading) return 'Registrando...';
    if (isAlreadyApplied) return 'Ya aplicaste';
    if (showError) return 'Ocurrió un error';
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
