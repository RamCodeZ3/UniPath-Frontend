import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import { ScholarshipCard } from './components/ScholarshipCard';
import { ScholarshipFilters, type ScholarshipFiltersState } from './components/ScholarshipFilters';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import type { SB_Scholarship, ScholarshipRequirement } from '../../shared/models/scholarshipsModel';
import { getAllScholarships, getScholarshipById } from '../../shared/services/scholarshipService';
import { getScholarshipRequirements } from '../../shared/services/applicationScholarshipService';

const EmptyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5z" />
    <path d="M6 10.5V15a6 6 0 0 0 12 0v-4.5" />
  </svg>
);

const initialFilters: ScholarshipFiltersState = {
  search: '',
  status: '',
  coversTuition: null,
};

const ITEMS_PER_PAGE = 12;

const normalizeText = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export const ScholarshipGallery = () => {
  const [allScholarships, setAllScholarships] = useState<SB_Scholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<SB_Scholarship | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<ScholarshipRequirement[]>([]);
  const [filters, setFilters] = useState<ScholarshipFiltersState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const loadScholarships = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllScholarships();
        setAllScholarships(data);
      } catch (err) {
        setError((err as Error).message || 'No se pudieron cargar las becas');
      } finally {
        setLoading(false);
      }
    };

    loadScholarships();
  }, []);

  const filteredScholarships = useMemo(() => {
    return allScholarships.filter((scholarship) => {
      if (filters.status && scholarship.status !== filters.status) return false;
      if (filters.coversTuition !== null && scholarship.covers_tuition !== filters.coversTuition) {
        return false;
      }

      if (deferredSearch) {
        const search = normalizeText(deferredSearch);
        const title = normalizeText(scholarship.title || '');
        const offeredBy = normalizeText(scholarship.offered_by || '');
        if (!title.includes(search) && !offeredBy.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [allScholarships, deferredSearch, filters.status, filters.coversTuition]);

  const totalItems = filteredScholarships.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedScholarships = useMemo(
    () =>
      filteredScholarships.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredScholarships, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.coversTuition, deferredSearch]);

  const handleCardClick = useCallback(async (scholarship: SB_Scholarship) => {
    setModalVisible(true);
    setModalLoading(true);
    setSelectedScholarship(scholarship);
    setSelectedRequirements([]);

    try {
      const [scholarshipDetail, requirements] = await Promise.all([
        getScholarshipById(scholarship.id),
        getScholarshipRequirements(scholarship.id),
      ]);

      if (scholarshipDetail) {
        setSelectedScholarship(scholarshipDetail);
      }
      setSelectedRequirements(requirements);
    } catch (err) {
      console.error('Error loading scholarship detail:', err);
    } finally {
      setModalLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explora becas</h1>
          <p className="text-gray-500 mt-1">Encuentra oportunidades para impulsar tu carrera</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <ScholarshipFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={() => setFilters(initialFilters)}
              loading={loading}
            />
          </aside>

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
                  <ScholarshipFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={() => setFilters(initialFilters)}
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

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? (
                  'Cargando...'
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{totalItems}</span> beca
                    {totalItems !== 1 ? 's' : ''} encontrada{totalItems !== 1 ? 's' : ''}
                    {totalPages > 1 && (
                      <>
                        {' - '}
                        <span className="font-medium text-gray-900">
                          Pagina {currentPage} de {totalPages}
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <i className="pi pi-exclamation-circle" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-200" />
                      <div className="w-20 h-6 rounded-full bg-gray-200" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full" />
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredScholarships.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <EmptyIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron becas</h3>
                <p className="text-gray-500 mb-4">Intenta ajustar los filtros de busqueda</p>
                <Button
                  label="Limpiar filtros"
                  icon="pi pi-filter-slash"
                  outlined
                  onClick={() => setFilters(initialFilters)}
                />
              </div>
            )}

            {!loading && paginatedScholarships.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedScholarships.map((scholarship) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>

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

      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        requirements={selectedRequirements}
        visible={modalVisible}
        onHide={() => {
          setModalVisible(false);
          setSelectedScholarship(null);
          setSelectedRequirements([]);
        }}
        loading={modalLoading}
      />
    </div>
  );
};
