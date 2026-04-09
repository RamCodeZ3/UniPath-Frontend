import { useState, useEffect, useCallback, useDeferredValue, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import { UniversityCard } from './components/UniversityCard';
import { UniversityFilters } from './components/UniversityFilters';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import {
  getAllUniversities,
  getUniversityWithRequirements,
} from '../../shared/services/universityService';
import type {
  SB_University,
  UniversityFilters as FilterType,
  UniversityWithDetails,
} from '../../shared/models/universityModel';
import type { SB_UniversityOverviews } from '../../shared/models/universityOverviewsModel';

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

const ITEMS_PER_PAGE = 12;

const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const UniversityGallery = () => {
  
  const [allUniversities, setAllUniversities] = useState<SB_University[]>([]);
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const loadAllUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllUniversities();
        setAllUniversities(data);
      } catch (err) {
        setError((err as Error).message || 'Error al cargar las universidades');
      } finally {
        setLoading(false);
      }
    };

    loadAllUniversities();
  }, []);

  const applyFilters = (filterState: FilterType, universityList: SB_University[]) => {
    let result = [...universityList];

    if (filterState.type && typeof filterState.type === 'string' && filterState.type.trim() !== '') {
      const filterType = normalizeText(filterState.type);
      result = result.filter(uni => 
        uni.type && normalizeText(uni.type) === filterType
      );
    }

    if (filterState.modality && filterState.modality.length > 0) {
      const filterModalities = filterState.modality.map(m => normalizeText(m));
      result = result.filter(uni => {
        if (!uni.modality) return false;
        const normalizedUniModality = normalizeText(uni.modality);
        return filterModalities.some(fm => normalizedUniModality.includes(fm));
      });
    }

    if (filterState.accredited !== null && filterState.accredited !== undefined) {
      result = result.filter(uni => uni.accredited === filterState.accredited);
    }

    if (filterState.status && typeof filterState.status === 'string' && filterState.status.trim() !== '') {
      const filterStatus = normalizeText(filterState.status);
      result = result.filter(uni => 
        uni.status && normalizeText(uni.status) === filterStatus
      );
    }

    if (filterState.search) {
      const normalizedSearch = normalizeText(filterState.search);
      result = result.filter(uni => {
        const normalizedName = normalizeText(uni.name || '');
        const normalizedAcronym = normalizeText(uni.acronym || '');
        return normalizedName.includes(normalizedSearch) || normalizedAcronym.includes(normalizedSearch);
      });
    }

    return result;
  };

  const filteredUniversities = useMemo(
    () => applyFilters({ ...filters, search: deferredSearch }, allUniversities),
    [filters.type, filters.modality, filters.status, filters.accredited, deferredSearch, allUniversities]
  );

  const totalItems = filteredUniversities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedUniversities = useMemo(
    () => filteredUniversities.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    ),
    [filteredUniversities, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.type, filters.modality, filters.accredited, filters.status, deferredSearch]);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUniversity(null);
  }, []);

  const handleReviewAdded = useCallback((newReview: SB_UniversityOverviews) => {
    setSelectedUniversity(prev => {
      if (!prev) return null;
      return {
        ...prev,
        overviews: [newReview, ...(prev.overviews || [])]
      };
    });
  }, []);

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Título de página */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Explora universidades
          </h1>
          <p className="text-gray-500 mt-1">
            Encuentra la universidad perfecta para ti
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Desktop (izquierda) */}
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
                  <div className="pt-3">
                    <Button
                      label="Aplicar filtros"
                      icon="pi pi-check"
                      className="w-full"
                      onClick={() => setMobileFiltersOpen(false)}
                    />
                  </div>
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
                      {totalItems}
                    </span>{' '}
                    universidade{totalItems !== 1 ? 's' : ''} encontrada
                    {totalItems !== 1 ? 's' : ''}
                    {totalPages > 1 && (
                      <>
                        {' - '}
                        <span className="font-medium text-gray-900">
                          Página {currentPage} de {totalPages}
                        </span>
                      </>
                    )}
                  </>
                )}
              </p>
              <Button
                icon="pi pi-filter"
                label="Filtros"
                className="lg:hidden"
                outlined
                size="small"
                onClick={() => setMobileFiltersOpen(true)}
              />
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
            {!loading && paginatedUniversities.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedUniversities.map((university) => (
                    <UniversityCard
                      key={university.id}
                      university={university}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>

                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 pb-8 border-b border-gray-200 flex justify-center">
                    <Paginator
                      first={(currentPage - 1) * ITEMS_PER_PAGE}
                      rows={ITEMS_PER_PAGE}
                      totalRecords={totalItems}
                      onPageChange={(e: PaginatorPageChangeEvent) => handlePageChange(e.page + 1)}
                      template="PrevPageLink PageLinks NextPageLink"
                      className="!bg-transparent !border-none"
                    />
                  </div>
                )}
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
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
};


