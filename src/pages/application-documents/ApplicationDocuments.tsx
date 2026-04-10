import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import type { RootState } from '../../app/store/store';
import {
  getAllApplicationRequirements,
  getUserDocuments,
  matchRequirementsWithDocuments,
  createApplicationWithDocuments,
} from '../../shared/services/applicationDocumentService';
import type { RequirementStatus } from '../../shared/models/applicationModel';
import { recommendDocuments } from '../../shared/services/geminiService';
import { uploadDocument as uploadDocumentService, createDocument as createDocumentService } from '../../shared/services/documentServices';
import { UniversityHeader } from './components/UniversityHeader';
import { RequirementsList } from './components/RequirementsList';
import { PaymentSummary } from './components/PaymentSummary';
import { DiscardChangesModal } from './components/DiscardChangesModal';
import { DocumentRecommendationCard } from './components/DocumentRecommendationCard';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface ApplicationDocumentsState {
  standardRequirements: RequirementStatus[];
  additionalRequirements: RequirementStatus[];
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
}

interface RecommendationData {
  answer: string;
  documents_used: number;
}

export default function ApplicationDocuments() {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toastRef = useRef(null);

  const { profile } = useSelector((state: RootState) => state.auth);

  const [state, setState] = useState<ApplicationDocumentsState>({
    standardRequirements: [],
    additionalRequirements: [],
    isLoading: true,
    isConfirming: false,
    error: null,
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(
    null
  );
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const universityName = (location.state as any)?.universityName || 'Universidad';

  useEffect(() => {
    const loadData = async () => {

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

        const { standard, additional } = await getAllApplicationRequirements(universityId);
        const existingDocs = await getUserDocuments(profile.id);

        const matchedStandard = matchRequirementsWithDocuments(standard, existingDocs);
        const matchedAdditional = matchRequirementsWithDocuments(additional, existingDocs);

        setState((prev) => ({
          ...prev,
          standardRequirements: matchedStandard,
          additionalRequirements: matchedAdditional,
          isLoading: false,
        }));

        try {
          const result = await recommendDocuments(profile.id, universityId);
          if (result?.error) {
            setRecommendationError(result.error);
          } else {
            setRecommendation(result);
          }
        } catch (geminiError) {
          const errorMessage = geminiError instanceof Error ? geminiError.message : 'Error desconocido';
          setRecommendationError(errorMessage);

        } finally {
          setRecommendationLoading(false);
        }
      } catch (error) {
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

  const updateRequirementInState = (
    requirementId: string,
    updateFn: (req: RequirementStatus) => RequirementStatus
  ) => {
    setState((prev) => ({
      ...prev,
      standardRequirements: prev.standardRequirements.map((req) =>
        req.requirementId === requirementId ? updateFn(req) : req
      ),
      additionalRequirements: prev.additionalRequirements.map((req) =>
        req.requirementId === requirementId ? updateFn(req) : req
      ),
    }));
  };

  const findRequirement = (requirementId: string): RequirementStatus | undefined => {
    return (
      state.standardRequirements.find((r) => r.requirementId === requirementId) ||
      state.additionalRequirements.find((r) => r.requirementId === requirementId)
    );
  };

  const handleFileUpload = async (requirementId: string, file: File) => {
    if (!profile?.id) {
      return;
    }

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

      const requirement = findRequirement(requirementId);
      if (!requirement) {
        throw new Error('Requerimiento no encontrado');
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileNameToUpload = `${Date.now()}-${cleanName}`;
      const publicUrl = await uploadDocumentService(profile.id, file, fileNameToUpload);

      const savedDoc = await createDocumentService({
        profile_id: profile.id,
        document_path: publicUrl,
        enrollment_requirement_id: requirement.enrollmentReqId,
      });

      updateRequirementInState(requirementId, (req) => ({
        ...req,
        hasExistingDocument: true,
        existingDocument: {
          id: savedDoc.id,
          profile_id: profile.id,
          document_path: publicUrl,
          enrollment_requirement_id: requirement.enrollmentReqId,
        },
      }));

      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'success',
          summary: 'Documento guardado',
          detail: `${file.name} ha sido guardado en tu perfil`,
          life: 3000,
        });
      }
    } catch (error) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'No se pudo guardar el archivo',
          life: 3000,
        });
      }
    } finally {
      setUploadingRequirementId(null);
    }
  };

  const handleConfirmApplication = async () => {
    if (!universityId || !profile?.id) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isConfirming: true }));

      const allRequirements = [...state.standardRequirements, ...state.additionalRequirements];
      const documentsToLink = allRequirements
      .flatMap((req) =>
        req.hasExistingDocument && req.existingDocument?.id
          ? [{
              document_id: req.existingDocument.id,
              enrollment_requirement_id: req.enrollmentReqId,
            }]
          : []
      );

      await createApplicationWithDocuments(profile.id, universityId, documentsToLink);

      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'success',
          summary: '¡Aplicación enviada!',
          detail: `Tu aplicación a ${universityName} ha sido registrada exitosamente`,
          life: 4000,
        });
      }

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

  const handleBackWithWarning = () => {
    navigate('/universities');
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    navigate('/universities');
  };

  const allRequirements = [...state.standardRequirements, ...state.additionalRequirements];
  const completedCount = allRequirements.filter((r) => r.hasExistingDocument).length;
  const totalCount = allRequirements.length;
  const standardCompleted = state.standardRequirements.filter((r) => r.hasExistingDocument).length;
  const standardTotal = state.standardRequirements.length;
  
  const canConfirm = completedCount === totalCount && totalCount > 0;
  const hasUnsavedChanges = false;

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

  if (state.error && allRequirements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={() => navigate('/universities')}
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
        <UniversityHeader universityName={universityName} onBack={handleBackWithWarning} />

        {!state.isLoading && (
          <div className="mt-6">
            <DocumentRecommendationCard
              answer={recommendation?.answer}
              loading={recommendationLoading}
              error={recommendationError}
              documentsUsed={recommendation?.documents_used}
            />
          </div>
        )}

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 sm:mt-8">
          {/* Columna 1: Lista de Requerimientos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documentos Estándar */}
            <RequirementsList
              title="Documentos Estándar"
              subtitle="Requeridos para todas las universidades"
              requirements={state.standardRequirements}
              onFileUpload={handleFileUpload}
              uploadingRequirementId={uploadingRequirementId}
              completedCount={standardCompleted}
              totalCount={standardTotal}
            />

            {state.additionalRequirements.length > 0 && (
              <RequirementsList
                title="Documentos Adicionales"
                subtitle={`Requeridos por ${universityName}`}
                requirements={state.additionalRequirements}
                onFileUpload={handleFileUpload}
                uploadingRequirementId={uploadingRequirementId}
                completedCount={state.additionalRequirements.filter((r) => r.hasExistingDocument).length}
                totalCount={state.additionalRequirements.length}
              />
            )}
          </div>

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
