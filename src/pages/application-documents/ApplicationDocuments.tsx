import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import type { RootState } from '../../store/store';
import {
  getUniversityRequirements,
  getUserDocuments,
  matchRequirementsWithDocuments,
  confirmApplicationWithDocuments,
  type RequirementStatus,
  type NewDocumentToSave,
} from '../../shared/services/applicationDocumentService';
import { UniversityHeader } from './components/UniversityHeader';
import { RequirementsList } from './components/RequirementsList';
import { PaymentSummary } from './components/PaymentSummary';
import { DiscardChangesModal } from './components/DiscardChangesModal';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface ApplicationDocumentsState {
  requirements: RequirementStatus[];
  newDocumentsToSave: NewDocumentToSave[];
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
}

export default function ApplicationDocuments() {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toastRef = useRef(null);

  // Redux state
  const { profile } = useSelector((state: RootState) => state.auth);

  // Local state
  const [state, setState] = useState<ApplicationDocumentsState>({
    requirements: [],
    newDocumentsToSave: [],
    isLoading: true,
    isConfirming: false,
    error: null,
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(
    null
  );

  const universityName = (location.state as any)?.universityName || 'Universidad';

  // Cargar requerimientos y documentos existentes
  useEffect(() => {
    const loadData = async () => {
      console.log('[ApplicationDocuments] universityId:', universityId);
      console.log('[ApplicationDocuments] profile:', profile);

      if (!universityId || !profile?.id) {
        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo identificar la universidad o tu perfil',
            life: 3000,
          });
        }
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Obtener requerimientos de la universidad
        const requirements = await getUniversityRequirements(universityId);
        console.log('[ApplicationDocuments] Requirements:', requirements);

        // Obtener documentos existentes del usuario
        const existingDocs = await getUserDocuments(profile.id);
        console.log('[ApplicationDocuments] Existing docs:', existingDocs);

        // Hacer matching
        const matchedRequirements = matchRequirementsWithDocuments(
          requirements,
          existingDocs
        );
        console.log('[ApplicationDocuments] Matched requirements:', matchedRequirements);

        setState((prev) => ({
          ...prev,
          requirements: matchedRequirements,
          isLoading: false,
        }));
      } catch (error) {
        console.error('[ApplicationDocuments] Error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));

        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'error',
            summary: 'Error',
            detail: `No se pudo cargar los requerimientos: ${errorMsg}`,
            life: 3000,
          });
        }
      }
    };

    loadData();
  }, [universityId, profile?.id]);

  // Manejar subida de archivo
  const handleFileUpload = async (requirementId: string, file: File) => {
    if (!profile?.id) {
      return;
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'warn',
          summary: 'Tipo de archivo no permitido',
          detail: 'Solo se permiten PDF, JPG, PNG y GIF',
          life: 3000,
        });
      }
      return;
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'warn',
          summary: 'Archivo muy grande',
          detail: `El archivo no debe superar 20MB`,
          life: 3000,
        });
      }
      return;
    }

    try {
      setUploadingRequirementId(requirementId);

      // Encontrar el requerimiento para obtener su enrollment_requirement_id
      const requirement = state.requirements.find((r) => r.requirementId === requirementId);
      if (!requirement) {
        throw new Error('Requerimiento no encontrado');
      }

      // Crear objeto de documento nuevo con la nueva estructura
      const newDoc: NewDocumentToSave = {
        profile_id: profile.id,
        document_path: `${profile.id}/${file.name}`,
        enrollment_requirement_id: requirement.enrollmentReqId, // ID del requerimiento de inscripción
        file: file,
      };

      // Agregar a lista de documentos a guardar
      setState((prev) => ({
        ...prev,
        newDocumentsToSave: [...prev.newDocumentsToSave, newDoc],
      }));

      // Actualizar estado del requerimiento
      setState((prev) => ({
        ...prev,
        requirements: prev.requirements.map((req) =>
          req.requirementId === requirementId
            ? {
                ...req,
                hasExistingDocument: true,
                existingDocument: {
                  id: 'temp-' + Date.now(),
                  profile_id: profile.id,
                  document_path: newDoc.document_path,
                  enrollment_requirement_id: requirement.enrollmentReqId,
                },
              }
            : req
        ),
      }));

      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'success',
          summary: 'Archivo seleccionado',
          detail: `${file.name} será guardado al confirmar`,
          life: 3000,
        });
      }
    } catch (error) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar el archivo',
          life: 3000,
        });
      }
    } finally {
      setUploadingRequirementId(null);
    }
  };

  // Manejar confirmación de aplicación
  const handleConfirmApplication = async () => {
    if (!universityId || !profile?.id) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isConfirming: true }));

      // Confirmar aplicación con documentos
      await confirmApplicationWithDocuments(
        profile.id,
        universityId,
        state.newDocumentsToSave
      );

      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'success',
          summary: '¡Éxito!',
          detail: `¡Tu aplicación a ${universityName} ha sido registrada!`,
          life: 4000,
        });
      }

      // Navegar de vuelta
      setTimeout(() => {
        navigate('/universities', { replace: true });
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        isConfirming: false,
        error: errorMsg,
      }));

      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo completar la aplicación: ${errorMsg}`,
          life: 4000,
        });
      }
    }
  };

  // Manejar ir atrás con validación
  const handleBackWithWarning = () => {
    if (state.newDocumentsToSave.length > 0) {
      setShowDiscardModal(true);
    } else {
      navigate('/universities');
    }
  };

  // Descartar cambios y ir atrás
  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    navigate('/universities');
  };

  // Calcular completados
  const completedCount = state.requirements.filter((r) => r.hasExistingDocument).length;
  const totalCount = state.requirements.length;
  const canConfirm = completedCount === totalCount && totalCount > 0;
  const hasUnsavedChanges = state.newDocumentsToSave.length > 0;

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando requerimientos...</p>
        </div>
      </div>
    );
  }

  if (state.error && state.requirements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={() => navigate('/university-gallery')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toast ref={toastRef} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <UniversityHeader universityName={universityName} onBack={handleBackWithWarning} />

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Columna 1: Lista de Requerimientos */}
          <div className="lg:col-span-2">
            <RequirementsList
              requirements={state.requirements}
              onFileUpload={handleFileUpload}
              uploadingRequirementId={uploadingRequirementId}
            />
          </div>

          {/* Columna 2: Resumen de Pago */}
          <div className="lg:col-span-1">
            <PaymentSummary
              completedCount={completedCount}
              totalCount={totalCount}
              hasUnsavedChanges={hasUnsavedChanges}
              canConfirm={canConfirm}
              isConfirming={state.isConfirming}
              onConfirm={handleConfirmApplication}
              onBack={handleBackWithWarning}
            />
          </div>
        </div>
      </main>

      {/* Modal de Descartar Cambios */}
      <DiscardChangesModal
        visible={showDiscardModal}
        onConfirm={handleDiscardChanges}
        onCancel={() => setShowDiscardModal(false)}
      />
    </div>
  );
}
