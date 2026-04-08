import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { getAllUniversities } from '../../shared/services/universityService';
import { UniversityLogoUpload } from '../university-gallery/components/UniversityLogoUpload';
import type { SB_University } from '../../shared/models/universityModel';

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
  </svg>
);

export const UniversityLogoAdmin = () => {
  const [universities, setUniversities] = useState<SB_University[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<SB_University | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'with_logo' | 'without_logo'>('all');

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await getAllUniversities();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter((uni) => {
    if (filter === 'with_logo') return !!uni.logo_url;
    if (filter === 'without_logo') return !uni.logo_url;
    return true;
  });

  const stats = {
    total: universities.length,
    withLogo: universities.filter((u) => !!u.logo_url).length,
    withoutLogo: universities.filter((u) => !u.logo_url).length,
  };

  const handleUploadSuccess = (logoUrl: string) => {
    setShowUploadDialog(false);
    setSelectedUniversity(null);
    loadUniversities();
  };

  const openUploadDialog = (university: SB_University) => {
    setSelectedUniversity(university);
    setShowUploadDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Logos</h1>
          <p className="mt-2 text-gray-600">
            Sube los logos de las universidades una sola vez
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <i className="pi pi-building text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Con Logo</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.withLogo}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="pi pi-check-circle text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sin Logo</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.withoutLogo}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <i className="pi pi-image text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
            <Button
              label={`Todas (${stats.total})`}
              size="small"
              severity={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            />
            <Button
              label={`Con Logo (${stats.withLogo})`}
              size="small"
              severity={filter === 'with_logo' ? 'success' : 'secondary'}
              onClick={() => setFilter('with_logo')}
            />
            <Button
              label={`Sin Logo (${stats.withoutLogo})`}
              size="small"
              severity={filter === 'without_logo' ? 'warning' : 'secondary'}
              onClick={() => setFilter('without_logo')}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="pi pi-spin pi-spinner text-4xl text-blue-600" />
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="pi pi-inbox text-4xl mb-3 block text-gray-300" />
              <p>No hay universidades que mostrar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUniversities.map((university) => (
                <div
                  key={university.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {university.logo_url ? (
                        <img
                          src={university.logo_url}
                          alt={university.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BuildingIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{university.name}</h3>
                      {university.acronym && (
                        <span className="text-sm text-gray-500">{university.acronym}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {university.logo_url ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Logo asignado
                        </span>
                        <Button
                          icon="pi pi-pencil"
                          severity="secondary"
                          size="small"
                          outlined
                          onClick={() => openUploadDialog(university)}
                          tooltip="Cambiar logo"
                          tooltipOptions={{ position: 'top' }}
                        />
                      </div>
                    ) : (
                      <Button
                        label="Subir Logo"
                        icon="pi pi-upload"
                        size="small"
                        onClick={() => openUploadDialog(university)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        header="Subir Logo"
        visible={showUploadDialog}
        onHide={() => {
          setShowUploadDialog(false);
          setSelectedUniversity(null);
        }}
        style={{ width: '450px' }}
        modal
        dismissableMask
      >
        {selectedUniversity && (
          <UniversityLogoUpload
            universityId={selectedUniversity.id}
            universityName={selectedUniversity.name}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
        )}
      </Dialog>
    </div>
  );
};
