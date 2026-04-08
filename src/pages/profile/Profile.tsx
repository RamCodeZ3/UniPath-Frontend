import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import type { RootState } from '../../store/store';
import { signOut } from '../../shared/services/authService';
import { updateProfile } from '../../shared/services/profileService';
import { setProfile } from '../../store/auth/authSlice';

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const InfoItem = ({ icon, label, value, onEdit }: { icon: React.ReactNode, label: string, value: string | null | undefined, onEdit?: () => void }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm group">
    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-base font-semibold text-gray-900 truncate">{value || 'No especificado'}</p>
    </div>
    {onEdit && (
      <button 
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 transition-all"
      >
        <i className="pi pi-pencil text-sm" />
      </button>
    )}
  </div>
);

export default function Profile() {
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state: RootState) => state.auth);
  const userName = profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuario';

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string, label: string, value: any } | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatBirthdate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'No especificada';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const genreLabels: Record<string, string> = {
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro',
    prefiero_no_decir: 'Prefiero no decirlo'
  };

  const sexOptions = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' },
    { label: 'Otro', value: 'otro' },
    { label: 'Prefiero no decir', value: 'prefiero_no_decir' },
  ];

  const handleEditClick = (key: string, label: string, value: any) => {
    setEditingField({ key, label, value: value || '' });
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!user?.id || !editingField) return;
    
    try {
      setIsSubmitting(true);
      const updates = { [editingField.key]: editingField.value };
      const updatedProfile = await updateProfile(user.id, updates);
      dispatch(setProfile(updatedProfile));
      setIsEditModalVisible(false);
      setEditingField(null);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500 mt-1">Tu información personal y de contacto</p>
          </div>
          <Button 
            label="Cerrar sesión" 
            icon="pi pi-power-off" 
            severity="danger" 
            text 
            className="hover:bg-red-50"
            onClick={handleLogout}
          />
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
              <div className="w-32 h-32 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-200">
                {userName.substring(0, 1).toUpperCase()}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h2 className="text-3xl font-bold text-gray-900">{userName}</h2>
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    className="w-8 h-8 md:ml-2"
                    onClick={() => handleEditClick('name', 'Nombre Completo', profile?.name)}
                  />
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    Estudiante
                  </span>
                  {profile?.genre && (
                    <button 
                      onClick={() => handleEditClick('genre', 'Género', profile?.genre)}
                      className="px-3 py-1 bg-gray-50 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {genreLabels[profile.genre] || profile.genre}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<MailIcon className="w-6 h-6" />}
              label="Correo electrónico"
              value={user?.email}
            />
            <InfoItem 
              icon={<PhoneIcon className="w-6 h-6" />}
              label="Teléfono"
              value={profile?.number}
              onEdit={() => handleEditClick('number', 'Teléfono', profile?.number)}
            />
            <InfoItem 
              icon={<CalendarIcon className="w-6 h-6" />}
              label="Fecha de nacimiento"
              value={formatBirthdate(profile?.birthdate)}
              onEdit={() => handleEditClick('birthdate', 'Fecha de Nacimiento', profile?.birthdate)}
            />
            <InfoItem 
              icon={<UserIcon className="w-6 h-6" />}
              label="Edad"
              value={profile?.birthdate ? `${getAge(profile.birthdate)} años` : '—'}
            />
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Estado de la cuenta</h3>
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <i className="pi pi-check text-sm" />
              </div>
              <p className="font-medium text-sm">Perfil verificado y completo</p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog 
        header={`Editar ${editingField?.label || ''}`} 
        visible={isEditModalVisible} 
        style={{ width: '90vw', maxWidth: '400px' }} 
        onHide={() => {
          setIsEditModalVisible(false);
          setEditingField(null);
        }}
        footer={
          <div className="flex gap-2 justify-end">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setIsEditModalVisible(false)} />
            <Button label="Guardar" icon="pi pi-check" onClick={handleSave} loading={isSubmitting} />
          </div>
        }
      >
        <div className="py-4">
          {editingField?.key === 'name' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
              <InputText 
                value={editingField.value} 
                onChange={(e) => setEditingField({...editingField, value: e.target.value})} 
                className="w-full"
                autoFocus
              />
            </div>
          )}

          {editingField?.key === 'number' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Teléfono</label>
              <InputText 
                value={editingField.value} 
                onChange={(e) => setEditingField({...editingField, value: e.target.value})} 
                className="w-full"
                placeholder="+1 809 000-0000"
                autoFocus
              />
            </div>
          )}

          {editingField?.key === 'birthdate' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Fecha de Nacimiento</label>
              <Calendar 
                value={editingField.value ? new Date(editingField.value + 'T00:00:00') : null} 
                onChange={(e) => {
                  const date = e.value as Date;
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setEditingField({...editingField, value: `${year}-${month}-${day}`});
                  }
                }} 
                dateFormat="dd/mm/yy" 
                showIcon 
                inline
                className="w-full"
              />
            </div>
          )}

          {editingField?.key === 'genre' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Género</label>
              <Dropdown 
                value={editingField.value} 
                options={sexOptions} 
                onChange={(e) => setEditingField({...editingField, value: e.value})} 
                className="w-full"
                placeholder="Selecciona una opción"
                autoFocus
              />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
