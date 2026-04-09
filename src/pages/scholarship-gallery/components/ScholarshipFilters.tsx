import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

interface ScholarshipFiltersState {
  search: string;
  status: '' | 'open' | 'closed';
  coversTuition: boolean | null;
}

interface ScholarshipFiltersProps {
  filters: ScholarshipFiltersState;
  onFilterChange: (filters: ScholarshipFiltersState) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Abiertas', value: 'open' },
  { label: 'Cerradas', value: 'closed' },
] as const;

const TUITION_OPTIONS = [
  { label: 'Todos', value: null },
  { label: 'Con cobertura de matricula', value: true },
  { label: 'Sin cobertura de matricula', value: false },
] as const;

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const ScholarshipFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  loading = false,
}: ScholarshipFiltersProps) => {
  const hasActiveFilters =
    Boolean(filters.search) || filters.status !== '' || filters.coversTuition !== null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <FilterIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            label="Limpiar"
            text
            size="small"
            onClick={onClearFilters}
            disabled={loading}
            className="text-gray-500 hover:text-blue-600 p-0"
          />
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
        <IconField iconPosition="left">
          <InputIcon className="flex items-center">
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </InputIcon>
          <InputText
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Nombre de beca u oferente..."
            className="w-full p-2.5 text-sm"
          />
        </IconField>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <Dropdown
          value={filters.status}
          options={STATUS_OPTIONS as unknown as Array<{ label: string; value: string }>}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.value as ScholarshipFiltersState['status'] })
          }
          placeholder="Seleccionar estado"
          className="w-full"
          disabled={loading}
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cobertura</label>
        <Dropdown
          value={filters.coversTuition}
          options={TUITION_OPTIONS as unknown as Array<{ label: string; value: boolean | null }>}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              coversTuition: e.value as ScholarshipFiltersState['coversTuition'],
            })
          }
          placeholder="Seleccionar cobertura"
          className="w-full"
          disabled={loading}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <i className="pi pi-info-circle" />
            <span>Filtros activos aplicados</span>
          </div>
        </div>
      )}
    </div>
  );
};

export type { ScholarshipFiltersState };
