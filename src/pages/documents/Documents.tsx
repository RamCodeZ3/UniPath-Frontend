import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import type { RootState, AppDispatch } from '../../app/store/store';
import {
  fetchGetDocumentsByProfileId,
  fetchUploadDocument,
  fetchDeleteDocument,
} from '../../app/store/document/thunks';
import { DocumentUploadZone } from './components/DocumentUploadZone';
import { DocumentList } from './components/DocumentList';
import { downloadFile } from '../../shared/utils/downloadHelper';
import { getStandardRequirements } from '../../shared/services/applicationDocumentService';
import type { SB_EnrollmentRequirement } from '../../shared/models/documentModel';
import supabase from '../../config/supabase/supabase';

const MAX_DOCUMENTS = 20;

export default function Documents() {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef(null);
  
  const { documents, status, error } = useSelector((state: RootState) => state.document);
  const { profile } = useSelector((state: RootState) => state.auth);

  const [standardRequirements, setStandardRequirements] = useState<SB_EnrollmentRequirement[]>([]);
  const [loadingStandard, setLoadingStandard] = useState(true);

  const [showDocumentTypeDialog, setShowDocumentTypeDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<SB_EnrollmentRequirement | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchGetDocumentsByProfileId(profile.id));
    }
    
    const loadStandardRequirements = async () => {
      try {
        setLoadingStandard(true);
        const requirements = await getStandardRequirements();
        setStandardRequirements(requirements);
      } catch (err) {
        console.error('Error cargando documentos estándar:', err);
      } finally {
        setLoadingStandard(false);
      }
    };
    
    loadStandardRequirements();
  }, [profile?.id, dispatch]);

  const getDocumentForRequirement = (requirementId: string) => {
    return documents.find(
      (doc) => doc.enrollment_requirement_id?.toLowerCase() === requirementId.toLowerCase()
    );
  };

  // Calcular progreso de documentos estándar
  const standardCompleted = standardRequirements.filter(
    (req) => getDocumentForRequirement(req.id)
  ).length;

  const handleFilesSelected = async (files: File[]) => {
    if (!profile?.id) {
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

    if (documents.length >= MAX_DOCUMENTS) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'warn',
          summary: 'Límite alcanzado',
          detail: `Has alcanzado el máximo de ${MAX_DOCUMENTS} documentos`,
          life: 3000,
        });
      }
      return;
    }

    // Procesar solo el primer archivo (uno por uno)
    if (files.length > 0) {
      setCurrentFile(files[0]);
      setSelectedRequirement(null);
      setShowDocumentTypeDialog(true);
    }
  };

  const handleConfirmDocumentType = async () => {
    if (!selectedRequirement) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'warn',
          summary: 'Selección requerida',
          detail: 'Por favor selecciona el tipo de documento',
          life: 3000,
        });
      }
      return;
    }

    if (!currentFile || !profile?.id) {
      return;
    }

    setIsUploadingDocument(true);

    try {
      const publicUrlResult = await dispatch(
        fetchUploadDocument({
          profileId: profile.id,
          file: currentFile,
          fileName: `${Date.now()}-${currentFile.name}`,
        })
      );

      if (publicUrlResult.payload && typeof publicUrlResult.payload === 'string') {
        const { error: saveError } = await supabase
          .from('documents')
          .insert({
            profile_id: profile.id,
            document_path: publicUrlResult.payload,
            enrollment_requirement_id: selectedRequirement.id,
          });

        if (saveError) {
          throw saveError;
        }

        setTimeout(() => {
          dispatch(fetchGetDocumentsByProfileId(profile.id));
        }, 500);

        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'success',
            summary: 'Documento guardado',
            detail: `${currentFile.name} guardado como "${selectedRequirement.description}"`,
            life: 3000,
          });
        }

        setShowDocumentTypeDialog(false);
        setCurrentFile(null);
        setSelectedRequirement(null);
      } else {
        throw new Error('No se pudo subir el archivo');
      }
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error al subir',
          detail: err instanceof Error ? err.message : `No se pudo subir ${currentFile?.name}`,
          life: 3000,
        });
      }
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleUploadForRequirement = async (requirement: SB_EnrollmentRequirement, file: File) => {
    if (!profile?.id) return;

    setIsUploadingDocument(true);

    try {
      const publicUrlResult = await dispatch(
        fetchUploadDocument({
          profileId: profile.id,
          file: file,
          fileName: `${Date.now()}-${file.name}`,
        })
      );

      if (publicUrlResult.payload && typeof publicUrlResult.payload === 'string') {
        const { error: saveError } = await supabase
          .from('documents')
          .insert({
            profile_id: profile.id,
            document_path: publicUrlResult.payload,
            enrollment_requirement_id: requirement.id,
          });

        if (saveError) {
          throw saveError;
        }

        setTimeout(() => {
          dispatch(fetchGetDocumentsByProfileId(profile.id));
        }, 500);

        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'success',
            summary: 'Documento guardado',
            detail: `${requirement.description} subido exitosamente`,
            life: 3000,
          });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo subir el documento',
          life: 3000,
        });
      }
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (profile?.id) {
      dispatch(fetchDeleteDocument(documentId)).then(() => {
        dispatch(fetchGetDocumentsByProfileId(profile.id));
        
        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'El documento fue eliminado correctamente',
            life: 3000,
          });
        }
      });
    }
  };

  const handleDownloadDocument = (filePath: string, fileName: string) => {
    try {
      downloadFile(filePath, fileName);
      
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'info',
          summary: 'Descarga iniciada',
          detail: `${fileName} está siendo descargado`,
          life: 2000,
        });
      }
    } catch (err) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el archivo',
          life: 3000,
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toast ref={toastRef} />
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mis Documentos</h1>
          <p className="text-gray-600">
            Gestiona los documentos que necesitas para tus aplicaciones a universidades
          </p>
        </div>

        {/* Sección de Documentos Estándar */}
        <section className="mb-6 sm:mb-8 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Documentos Estándar</h2>
              <p className="text-sm text-gray-500">Requeridos para aplicar a cualquier universidad</p>
            </div>
            <div className="text-left sm:text-right">
              <span className={`text-2xl font-bold ${standardCompleted === standardRequirements.length ? 'text-green-600' : 'text-amber-600'}`}>
                {standardCompleted}/{standardRequirements.length}
              </span>
              <p className="text-xs text-gray-500">completados</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                standardCompleted === standardRequirements.length ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${standardRequirements.length > 0 ? (standardCompleted / standardRequirements.length) * 100 : 0}%` }}
            />
          </div>

          {loadingStandard ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {standardRequirements.map((requirement) => {
                const existingDoc = getDocumentForRequirement(requirement.id);
                const isComplete = !!existingDoc;

                return (
                  <div
                    key={requirement.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border ${
                      isComplete
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    {/* Icono de estado */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {isComplete ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>

                    {/* Info del documento */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{requirement.description}</p>
                      {requirement.validity && (
                        <p className="text-xs text-gray-500">Vigencia: {requirement.validity}</p>
                      )}
                      {requirement.accepted_format && (
                        <p className="text-xs text-gray-500">Formatos: {requirement.accepted_format}</p>
                      )}
                    </div>

                    {/* Acción */}
                    {isComplete ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completado
                      </span>
                    ) : (
                      <label className="cursor-pointer self-start sm:self-auto">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadForRequirement(requirement, file);
                            }
                            e.target.value = '';
                          }}
                          disabled={isUploadingDocument}
                        />
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          {isUploadingDocument ? 'Subiendo...' : 'Subir'}
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sección de subida libre de documentos */}
        <section className="mb-6 sm:mb-8 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Subir otros documentos</h2>
            <p className="text-sm text-gray-500">
              Sube documentos adicionales que puedan requerir algunas universidades
            </p>
          </div>
          <DocumentUploadZone
            onFilesSelected={handleFilesSelected}
            isLoading={status === 'pending'}
            error={status === 'failed' ? error : null}
            maxFiles={MAX_DOCUMENTS}
            currentFileCount={documents.length}
          />
        </section>

        {/* Sección de lista de documentos */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Todos mis documentos</h2>
          <DocumentList
            documents={documents}
            isLoading={status === 'pending'}
            error={status === 'failed' ? error : null}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
            isDeleting={status === 'pending'}
          />
        </section>
      </main>

      {/* Dialog para seleccionar tipo de documento */}
      <Dialog
        header="Seleccionar tipo de documento"
        visible={showDocumentTypeDialog}
        onHide={() => setShowDocumentTypeDialog(false)}
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Archivo: <span className="text-blue-600 font-semibold">{currentFile?.name}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el tipo de documento que estás subiendo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de documento *
            </label>
            <Dropdown
              value={selectedRequirement}
              onChange={(e) => setSelectedRequirement(e.value)}
              options={standardRequirements}
              optionLabel="description"
              placeholder="Selecciona el tipo de documento"
              className="w-full"
              filter
              filterPlaceholder="Buscar..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setShowDocumentTypeDialog(false)}
              className="p-button-outlined"
              disabled={isUploadingDocument}
            />
            <Button
              label={isUploadingDocument ? 'Guardando...' : 'Guardar documento'}
              icon="pi pi-save"
              onClick={handleConfirmDocumentType}
              loading={isUploadingDocument}
              disabled={isUploadingDocument || !selectedRequirement}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
