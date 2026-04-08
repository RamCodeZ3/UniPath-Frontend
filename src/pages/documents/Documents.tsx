import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import type { RootState, AppDispatch } from '../../store/store';
import {
  fetchGetDocumentsByProfileId,
  fetchUploadDocument,
  fetchAddDocument,
  fetchDeleteDocument,
} from '../../store/document/thunks';
import { DocumentUploadZone } from './components/DocumentUploadZone';
import { DocumentList } from './components/DocumentList';
import { downloadFile } from '../../shared/utils/downloadHelper';
import type { SB_Documents } from '../../shared/models/documentModel';

const MAX_DOCUMENTS = 10;

export default function Documents() {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef(null);
  
  // Redux state
  const { documents, status, error } = useSelector((state: RootState) => state.document);
  const { profile } = useSelector((state: RootState) => state.auth);

  // Estado para modal de tipo de documento
  const [showDocumentTypeDialog, setShowDocumentTypeDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Al montar: cargar documentos del usuario
  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchGetDocumentsByProfileId(profile.id));
    }
  }, [profile?.id, dispatch]);

  // Mostrar toasts para cambios de estado
  useEffect(() => {
    if (status === 'success' && error === null) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Operación completada',
          life: 3000,
        });
      }
    }
  }, [status, error]);

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

    // Verificar límite de documentos
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
      setDocumentType('');
      setShowDocumentTypeDialog(true);
    }
  };

  const handleConfirmDocumentType = async () => {
    if (!documentType.trim()) {
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'warn',
          summary: 'Campo requerido',
          detail: 'Por favor ingresa el tipo de documento',
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
      // 1. Subir archivo a storage
      const publicUrlResult = await dispatch(
        fetchUploadDocument({
          profileId: profile.id,
          file: currentFile,
          fileName: currentFile.name,
        })
      );

      if (publicUrlResult.payload && typeof publicUrlResult.payload === 'string') {
        // 2. Crear registro en BD con el nombre original del archivo y tipo personalizado
        const newDocumentRecord: Omit<SB_Documents, 'id' | 'created_at'> = {
          profile_id: profile.id,
          document_name: currentFile.name,
          type: documentType,
          document_path: `${profile.id}/${currentFile.name}`,
        };

        const addResult = await dispatch(fetchAddDocument(newDocumentRecord));

        // Verificar si el documento se guardó correctamente
        if (addResult.type === 'document/fetchAddDocument/fulfilled') {
          // 3. Recargar lista después de guardar
          setTimeout(() => {
            dispatch(fetchGetDocumentsByProfileId(profile.id));
          }, 500);

          // 4. Mostrar éxito
           const toastRef_current = toastRef.current as any;
           if (toastRef_current) {
             toastRef_current.show({
               severity: 'success',
               summary: 'Documento cargado',
               detail: `${currentFile.name} fue clasificado como "${documentType}" exitosamente`,
               life: 3000,
             });
           }

          // Cerrar diálogo y resetear
          setShowDocumentTypeDialog(false);
          setCurrentFile(null);
          setDocumentType('');
        } else if (addResult.type === 'document/fetchAddDocument/rejected') {
          // Error al guardar en BD
          const errorMsg = (addResult.payload as string) || 'Error desconocido';
          const toastRef_current = toastRef.current as any;
          if (toastRef_current) {
            toastRef_current.show({
              severity: 'error',
              summary: 'Error al guardar',
              detail: `No se pudo guardar el documento: ${errorMsg}`,
              life: 3000,
            });
          }
        }
      } else {
        // El upload falló
        const toastRef_current = toastRef.current as any;
        if (toastRef_current) {
          toastRef_current.show({
            severity: 'error',
            summary: 'Error al subir',
            detail: `No se pudo subir ${currentFile.name} al almacenamiento`,
            life: 3000,
          });
        }
      }
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      const toastRef_current = toastRef.current as any;
      if (toastRef_current) {
        toastRef_current.show({
          severity: 'error',
          summary: 'Error al subir',
          detail: `No se pudo subir ${currentFile?.name}`,
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
        // Recargar lista después de eliminar
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
      // Construir la URL pública de Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents_users/${filePath}`;
      
      downloadFile(publicUrl, fileName);
      
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
    <div className="bg-gray-50">
      <Toast ref={toastRef} />
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Documentos</h1>
          <p className="text-gray-600">
            Gestiona los documentos que necesitas para tus aplicaciones a universidades
          </p>
        </div>

        {/* Sección de subida de documentos */}
        <section className="mb-8 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Subir documentos</h2>
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              ⚠️ Debes ingresar archivo por archivo para especificar su tipo (ejemplo: Foto 2x2, Cédula, Certificado de bachiller, etc)
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos cargados</h2>
          <DocumentList
            documents={documents}
            isLoading={status === 'pending'}
            error={status === 'failed' ? error : null}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
            isDeleting={status === 'pending'}
          />
        </section>

        {/* Sección de recomendación de documentos */}
        <section className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Análisis de documentos</h2>
          {profile?.id ? (
            <div className="text-gray-600 text-sm">
              <p className="mb-2">
                El análisis de documentos con IA requiere que selecciones una universidad específica desde la galería de universidades.
              </p>
              <p className="text-gray-500">
                Una vez hayas seleccionado una universidad en la página de universidades, podrás obtener recomendaciones personalizadas de documentos.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Cargando información de tu perfil...
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Dialog para ingresar tipo de documento */}
      <Dialog
        header="Especificar tipo de documento"
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
              ¿Qué tipo de documento es? (ej: Foto 2x2, Cédula, Certificado de bachiller, Pasaporte, etc)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de documento *
            </label>
            <InputText
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="Ej: Cédula, Foto 2x2, Certificado..."
              className="w-full"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isUploadingDocument) {
                  handleConfirmDocumentType();
                }
              }}
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
              disabled={isUploadingDocument || !documentType.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
