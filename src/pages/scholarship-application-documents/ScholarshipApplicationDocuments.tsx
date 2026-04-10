import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import type { AppDispatch } from '../../store/store';
import { fetchUploadDocument, fetchAddDocument } from '../../store/document/thunks';
import type { RootState } from '../../store/store';
import type {
  ScholarshipRequirementStatus,
} from '../../shared/models/scholarshipsModel';
import {
  createScholarshipApplicationWithDocuments,
  getScholarshipRequirements,
  getUserDocuments,
  isUserAppliedToScholarship,
  matchRequirementsWithDocuments,
} from '../../shared/services/applicationScholarshipService';
import { ScholarshipHeader } from './components/ScholarshipHeader';
import { ScholarshipRequirementsList } from './components/ScholarshipRequirementsList';
import { ScholarshipSummary } from './components/ScholarshipSummary';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface ScholarshipApplicationState {
  requirements: ScholarshipRequirementStatus[];
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
}

export default function ScholarshipApplicationDocuments() {
  const { scholarshipId } = useParams<{ scholarshipId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toastRef = useRef<Toast>(null);
  const { profile } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [state, setState] = useState<ScholarshipApplicationState>({
    requirements: [],
    isLoading: true,
    isConfirming: false,
    error: null,
  });
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(null);

  const scholarshipTitle = (location.state as { scholarshipTitle?: string } | null)?.scholarshipTitle ||
    'Beca';

  useEffect(() => {
    const loadData = async () => {
      if (!scholarshipId || !profile?.id) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo identificar la beca o tu perfil',
          life: 3000,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const alreadyApplied = await isUserAppliedToScholarship(profile.id, scholarshipId);
        if (alreadyApplied) {
          toastRef.current?.show({
            severity: 'info',
            summary: 'Ya aplicaste',
            detail: 'Ya tienes una postulacion registrada para esta beca',
            life: 3500,
          });
          navigate('/scholarships', { replace: true });
          return;
        }

        const [requirements, existingDocs] = await Promise.all([
          getScholarshipRequirements(scholarshipId),
          getUserDocuments(profile.id),
        ]);

        const matched = matchRequirementsWithDocuments(requirements, existingDocs);

        setState((prev) => ({
          ...prev,
          requirements: matched,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));

        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudieron cargar los requisitos: ${message}`,
          life: 4000,
        });
      }
    };

    loadData();
  }, [scholarshipId, profile?.id, navigate]);

  const updateRequirementInState = (
    requirementId: string,
    updateFn: (req: ScholarshipRequirementStatus) => ScholarshipRequirementStatus
  ) => {
    setState((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) =>
        req.requirementId === requirementId ? updateFn(req) : req
      ),
    }));
  };

  const findRequirement = (requirementId: string): ScholarshipRequirementStatus | undefined => {
    return state.requirements.find((req) => req.requirementId === requirementId);
  };

  const handleFileUpload = async (requirementId: string, file: File) => {
    if (!profile?.id) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Tipo de archivo no permitido',
        detail: 'Solo se permiten PDF, JPG, PNG y GIF',
        life: 3000,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Archivo muy grande',
        detail: 'El archivo no debe superar 20MB',
        life: 3000,
      });
      return;
    }

    try {
      setUploadingRequirementId(requirementId);

      const requirement = findRequirement(requirementId);
      if (!requirement) {
        throw new Error('Requisito no encontrado');
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileNameToUpload = `${Date.now()}-${cleanName}`;

      const publicUrl = await dispatch(
        fetchUploadDocument({ profileId: profile.id, file, fileName: fileNameToUpload })
      ).unwrap();

      const savedDoc = await dispatch(
        fetchAddDocument({
          profile_id: profile.id,
          document_path: publicUrl,
          enrollment_requirement_id: requirement.enrollmentReqId,
        })
      ).unwrap();

      updateRequirementInState(requirementId, (req) => ({
        ...req,
        hasExistingDocument: true,
        existingDocument: {
          id: savedDoc.id!,
          profile_id: profile.id,
          document_path: publicUrl,
          enrollment_requirement_id: requirement.enrollmentReqId,
        },
      }));

      toastRef.current?.show({
        severity: 'success',
        summary: 'Documento guardado',
        detail: `${file.name} se guardo en tu perfil`,
        life: 3000,
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo guardar el archivo',
        life: 3000,
      });
    } finally {
      setUploadingRequirementId(null);
    }
  };

  const handleConfirm = async () => {
    if (!scholarshipId || !profile?.id) return;

    try {
      setState((prev) => ({ ...prev, isConfirming: true, error: null }));

      const documentsToLink = state.requirements
        .filter((req) => req.hasExistingDocument && req.existingDocument?.id)
        .map((req) => ({
          document_id: req.existingDocument!.id,
          enrollment_requirement_id: req.enrollmentReqId,
        }));

      await createScholarshipApplicationWithDocuments(profile.id, scholarshipId, documentsToLink);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Postulacion enviada',
        detail: `Tu postulacion a ${scholarshipTitle} fue registrada correctamente`,
        life: 4000,
      });

      setTimeout(() => {
        navigate('/scholarships', { replace: true });
      }, 1800);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        isConfirming: false,
        error: message,
      }));

      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudo completar la postulacion: ${message}`,
        life: 4000,
      });
    }
  };

  const handleBack = () => navigate('/scholarships');

  const mandatoryRequirements = state.requirements.filter((req) => req.isMandatory);
  const completedCount = mandatoryRequirements.filter((req) => req.hasExistingDocument).length;
  const totalCount = mandatoryRequirements.length;
  const canConfirm = completedCount === totalCount && totalCount > 0;

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando requisitos de beca...</p>
        </div>
      </div>
    );
  }

  if (state.error && state.requirements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={handleBack}
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
        <ScholarshipHeader scholarshipTitle={scholarshipTitle} onBack={handleBack} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <ScholarshipRequirementsList
              requirements={state.requirements}
              onFileUpload={handleFileUpload}
              uploadingRequirementId={uploadingRequirementId}
            />
          </div>

          <div className="lg:col-span-1">
            <ScholarshipSummary
              completedCount={completedCount}
              totalCount={totalCount}
              canConfirm={canConfirm}
              isConfirming={state.isConfirming}
              onConfirm={handleConfirm}
              onBack={handleBack}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
