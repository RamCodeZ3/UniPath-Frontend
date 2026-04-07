/**
 * Página de Documentos
 * 
 * 
 * 
 * Funcionalidades disponibles:
 * - DocumentRecommender: Componente para analizar documentos con IA
 * - Redux: Estado de documentos y recomendaciones disponible en store
 * 
 * Imports listos para usar:
 * import DocumentRecommender from '../../shared/components/DocumentRecommender';
 * import { useSelector, useDispatch } from 'react-redux';
 * import { fetchRecommendDocuments } from '../../store/document/thunks';
 * import type { RootState } from '../../store/store';
 */

export default function Documents() {
    return (
        <div className="bg-gray-50">
            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* TODO: UI/UX - Diseñar layout de documentos */}
                
                {/* Sección de subida de documentos */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Subir documentos
                    </h2>
                    {/* TODO: Agregar componente de upload */}
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                            Zona de subida de documentos - Por diseñar
                        </p>
                    </div>
                </section>

                {/* Sección de lista de documentos */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Documentos cargados
                    </h2>
                    {/* TODO: Agregar lista de documentos */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-gray-500">
                            Lista de documentos - Por diseñar
                        </p>
                    </div>
                </section>

                {/* Sección de recomendación de documentos */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Análisis de documentos
                    </h2>
                    {/* 
                        TODO: Integrar DocumentRecommender cuando se tenga universityId
                        
                        Ejemplo de uso:
                        <DocumentRecommender 
                            profileId={profile.id} 
                            universityId={selectedUniversityId} 
                        />
                    */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-gray-500">
                            Análisis con IA - Requiere seleccionar una universidad
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
