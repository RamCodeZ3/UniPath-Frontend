import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import type { UniversityFilters as FilterType, UniversityModality } from '../../../shared/models/universityModel';
import {
  UNIVERSITY_TYPE_OPTIONS,
  UNIVERSITY_MODALITY_OPTIONS,
} from '../../../shared/models/universityModel';

interface UniversityFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

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

export const UniversityFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  loading = false,
}: UniversityFiltersProps) => {
  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value as FilterType['type'] });
  };

  const handleModalityChange = (modality: UniversityModality, checked: boolean) => {
    const currentModalities = filters.modality || [];
    const newModalities = checked
      ? [...currentModalities, modality]
      : currentModalities.filter((m) => m !== modality);
    onFilterChange({ ...filters, modality: newModalities });
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const hasActiveFilters =
    filters.type ||
    (filters.modality && filters.modality.length > 0) ||
    filters.status ||
    filters.search;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      {/* Header */}
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

      {/* Búsqueda */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <IconField iconPosition="left">
          <InputIcon className="flex items-center">
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </InputIcon>
          <InputText
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nombre o siglas..."
            className="w-full p-2.5 text-sm"
          />
        </IconField>
      </div>

      {/* Tipo de universidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de universidad
        </label>
        <Dropdown
          value={filters.type || ''}
          options={[...UNIVERSITY_TYPE_OPTIONS]}
          onChange={(e) => handleTypeChange(e.value)}
          placeholder="Seleccionar tipo"
          className="w-full"
          disabled={loading}
        />
      </div>

      {/* Modalidad (checkboxes) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Modalidad
        </label>
        <div className="space-y-3">
          {UNIVERSITY_MODALITY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <Checkbox
                inputId={`modality-${option.value}`}
                checked={(filters.modality || []).includes(option.value)}
                onChange={(e) => handleModalityChange(option.value, e.checked ?? false)}
                disabled={loading}
              />
              <label
                htmlFor={`modality-${option.value}`}
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Estado */}
    {/*}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <Dropdown
          value={filters.status || ''}
          options={[...UNIVERSITY_STATUS_OPTIONS]}
          onChange={(e) => handleStatusChange(e.value)}
          placeholder="Seleccionar estado"
          className="w-full"
          disabled={loading}
        />
      </div> */}

      {/* Indicador de filtros activos */}
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


