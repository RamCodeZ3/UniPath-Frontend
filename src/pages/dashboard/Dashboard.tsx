import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { signOut } from '../../shared/services/authService';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <LogoIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UniPath</span>
            </div>
            <Button
              label="Cerrar sesión"
              icon="pi pi-sign-out"
              text
              severity="secondary"
              onClick={handleSignOut}
            />
          </div>
        </div>
      </header>

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido a UniPath
          </h1>
          <p className="text-gray-500">
            Tu guía para encontrar la universidad perfecta
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          <div
            onClick={() => navigate('/universities')}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <BuildingIcon className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Explorar universidades
            </h3>
            <p className="text-sm text-gray-500">
              Descubre y filtra universidades según tus preferencias
            </p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Ver galería
              <i className="pi pi-arrow-right ml-2 text-xs" />
            </div>
          </div>

          {/* Placeholder cards para futuras funcionalidades */}
          {/* 
            TODO: UI/UX - Integrar DocumentRecommender cuando esté lista la página de documentos
            
            Importar:
            import DocumentRecommender from '../../shared/components/DocumentRecommender';
            
            Uso (requiere profileId y universityId):
            <DocumentRecommender 
              profileId={profile?.id} 
              universityId={selectedUniversityId} 
            />
            
            También se puede usar con Redux:
            import { useDispatch, useSelector } from 'react-redux';
            import { fetchRecommendDocuments } from '../../store/document/thunks';
            import type { RootState } from '../../store/store';
            
            const dispatch = useDispatch();
            const { recommendation, recommendationStatus } = useSelector((state: RootState) => state.document);
            dispatch(fetchRecommendDocuments({ profileId, universityId }));
          */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 opacity-50">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <i className="pi pi-file text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mis documentos
            </h3>
            <p className="text-sm text-gray-500">
              Próximamente
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 opacity-50">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <i className="pi pi-heart text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Favoritos
            </h3>
            <p className="text-sm text-gray-500">
              Próximamente
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}