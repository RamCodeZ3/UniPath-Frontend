import { useState, useEffect, useCallback, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { UniversityCard } from './components/UniversityCard';
import { UniversityFilters } from './components/UniversityFilters';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import {
  getUniversitiesWithFilters,
  getUniversityWithRequirements,
} from '../../shared/services/universityService';
import { signOut } from '../../shared/services/authService';
import type {
  SB_University,
  UniversityFilters as FilterType,
  UniversityWithDetails,
} from '../../shared/models/universityModel';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const EmptyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
    <path d="M12 11v.01M12 14v3" />
  </svg>
);

const initialFilters: FilterType = {
  type: '',
  modality: [],
  accredited: null,
  status: '',
  search: '',
};

export const UniversityGallery = () => {
  const navigate = useNavigate();
  
  // Estados
  const [universities, setUniversities] = useState<SB_University[]>([]);
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Diferir el valor de búsqueda para no bloquear el input
  const deferredSearch = useDeferredValue(filters.search);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const universitiesData = await getUniversitiesWithFilters({});
        setUniversities(universitiesData);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las universidades');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Aplicar filtros
  const fetchFilteredUniversities = useCallback(async (newFilters: FilterType) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUniversitiesWithFilters({
        type: newFilters.type || undefined,
        modality: newFilters.modality?.length ? newFilters.modality : undefined,
        status: newFilters.status || undefined,
        search: newFilters.search || undefined,
      });

      setUniversities(data);
    } catch (err) {
      setError((err as Error).message || 'Error al filtrar universidades');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler para cambio de filtros (sin búsqueda)
  const handleFilterChange = useCallback(
    (newFilters: FilterType) => {
      setFilters(newFilters);
      // Solo hacer fetch inmediato si cambió algo que no sea search
      if (
        newFilters.type !== filters.type ||
        newFilters.status !== filters.status ||
        JSON.stringify(newFilters.modality) !== JSON.stringify(filters.modality)
      ) {
        fetchFilteredUniversities(newFilters);
      }
    },
    [fetchFilteredUniversities, filters]
  );

  // Efecto para búsqueda diferida
  useEffect(() => {
    if (deferredSearch !== undefined) {
      fetchFilteredUniversities({ ...filters, search: deferredSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch]);

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    fetchFilteredUniversities(initialFilters);
  }, [fetchFilteredUniversities]);

  // Universidades filtradas
  const filteredUniversities = universities;

  // Abrir modal con detalle
  const handleCardClick = useCallback(async (university: SB_University) => {
    setModalVisible(true);
    setModalLoading(true);
    setSelectedUniversity(university as UniversityWithDetails);

    try {
      const detailedUniversity = await getUniversityWithRequirements(university.id);
      if (detailedUniversity) {
        setSelectedUniversity(detailedUniversity);
      }
    } catch (err) {
      console.error('Error loading university details:', err);
    } finally {
      setModalLoading(false);
    }
  }, []);

  // Cerrar modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUniversity(null);
  }, []);

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <LogoIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UniPath</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Botón filtros móvil */}
              <Button
                icon="pi pi-filter"
                className="lg:hidden"
                outlined
                severity="secondary"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                badge={
                  (filters.type ? 1 : 0) +
                  (filters.modality?.length || 0) +
                  (filters.status ? 1 : 0)
                    ? String(
                        (filters.type ? 1 : 0) +
                          (filters.modality?.length || 0) +
                          (filters.status ? 1 : 0)
                      )
                    : undefined
                }
              />
              <Button
                label="Cerrar sesión"
                icon="pi pi-sign-out"
                text
                severity="secondary"
                onClick={handleSignOut}
                className="hidden sm:flex"
              />
              <Button
                icon="pi pi-sign-out"
                text
                severity="secondary"
                onClick={handleSignOut}
                className="sm:hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de página */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Explora universidades
          </h1>
          <p className="text-gray-500 mt-1">
            Encuentra la universidad perfecta para ti
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <UniversityFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </aside>

          {/* Filtros móvil - Overlay */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filtros</h3>
                  <Button
                    icon="pi pi-times"
                    text
                    rounded
                    severity="secondary"
                    onClick={() => setMobileFiltersOpen(false)}
                  />
                </div>
                <div className="p-4">
                  <UniversityFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal - Galería */}
          <div className="flex-1">
            {/* Contador de resultados */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? (
                  'Cargando...'
                ) : (
                  <>
                    <span className="font-medium text-gray-900">
                      {filteredUniversities.length}
                    </span>{' '}
                    universidad{filteredUniversities.length !== 1 ? 'es' : ''} encontrada
                    {filteredUniversities.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <i className="pi pi-exclamation-circle" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-200" />
                      <div className="w-20 h-6 rounded-full bg-gray-200" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredUniversities.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <EmptyIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron universidades
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button
                  label="Limpiar filtros"
                  icon="pi pi-filter-slash"
                  outlined
                  onClick={handleClearFilters}
                />
              </div>
            )}

            {/* Grid de universidades */}
            {!loading && filteredUniversities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUniversities.map((university) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de detalle */}
      <UniversityDetailModal
        university={selectedUniversity}
        visible={modalVisible}
        onHide={handleCloseModal}
        loading={modalLoading}
      />
    </div>
  );
};


