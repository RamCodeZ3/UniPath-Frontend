import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { profileSchema, type ProfileFormData } from './profile.schema';
import { createProfile, getProfile } from '../../shared/services/profileService';
import { getSession } from '../../shared/services/authService';
import { setUser, setEmailConfirmed } from '../../app/store/auth/authSlice';
import type { RootState } from '../../app/store/store';

const sexOptions = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decir', value: 'prefiero_no_decir' },
];

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

const MaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10" cy="14" r="5" />
    <path d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="5" />
    <path d="M12 13v8M9 18h6" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const StepCard = ({ icon, title, subtitle, children }: StepCardProps) => (
  <div className="flex flex-col gap-6 py-4">
    <div className="flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

interface GenderOptionProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
  variant: 'primary' | 'secondary';
}

const GenderOption = ({ icon, label, selected, onSelect, variant }: GenderOptionProps) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative flex flex-col items-center justify-center rounded-2xl border-2 
        transition-all duration-200 cursor-pointer
        ${isPrimary ? 'p-6' : 'p-4 flex-row gap-3'}
        ${selected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
      `}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      <div className={`${isPrimary ? 'w-14 h-14 mb-3' : 'w-6 h-6'} ${selected ? 'text-blue-600' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{label}</span>
    </button>
  );
};

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        className={`
          h-2 rounded-full transition-all duration-300
          ${i === currentStep ? 'w-8 bg-blue-500' : i < currentStep ? 'w-2 bg-blue-500' : 'w-2 bg-gray-200'}
        `}
      />
    ))}
  </div>
);

export const ProfileCreation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const stepperRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localUser, setLocalUser] = useState<any>(null);
  const storeUser = useSelector((state: RootState) => state.auth.user);
  
  const user = storeUser || localUser;
  const userEmail = user?.email;

  const startStepParam = parseInt(searchParams.get('step') || '1', 10);
  const prefillName = searchParams.get('prefillName') || '';
  const initialStep = Math.min(Math.max(startStepParam - 1, 0), 4);

  const [formData, setFormData] = useState<Partial<ProfileFormData>>({
    nombre: prefillName || '',
    fechaNacimiento: '',
    telefono: '',
    sexo: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          const user = session.user;
          setLocalUser(user);
          dispatch(setUser(user));
          dispatch(setEmailConfirmed(!!user.email_confirmed_at));

          const profile = await getProfile(user.id);
          if (profile) {
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('[ProfileCreation] Error obteniendo sesión:', error);
        window.location.href = '/';
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (initialStep > 0 && !isLoading) {
      setTimeout(() => {
        for (let i = 0; i < initialStep; i++) {
          stepperRef.current?.nextCallback();
        }
      }, 100);
    }
  }, [isLoading, initialStep]);

  const validateStep = (step: number): boolean => {
    if (step === 4) return true;
    
    const fieldsToValidate: Record<number, (keyof ProfileFormData)[]> = {
      0: ['nombre'],
      1: ['fechaNacimiento'],
      2: ['telefono'],
      3: ['sexo'],
    };

    const fields = fieldsToValidate[step];
    const stepData: any = {};
    
    fields.forEach(field => {
      stepData[field] = formData[field];
    });

    let stepSchema;
    if (step === 0) {
      stepSchema = profileSchema.pick({ nombre: true });
    } else if (step === 1) {
      stepSchema = profileSchema.pick({ fechaNacimiento: true });
    } else if (step === 2) {
      stepSchema = profileSchema.pick({ telefono: true });
    } else if (step === 3) {
      stepSchema = profileSchema.pick({ sexo: true });
    }

    if (!stepSchema) {
      return false;
    }

    const result = stepSchema.safeParse(stepData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      stepperRef.current?.nextCallback();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    stepperRef.current?.prevCallback();
    setErrors({});
  };

  const handleSubmit = async () => {
    const result = profileSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      setSubmitError('No hay sesión activa');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await createProfile(user.id, {
        name: result.data.nombre,
        birthdate: result.data.fechaNacimiento,
        number: result.data.telefono,
        genre: result.data.sexo,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || 'Error al crear el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === 4) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Completa tu perfil</h1>
          <p className="text-gray-500 mt-1">Cuéntanos un poco sobre ti</p>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={5} />

        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          onKeyDown={handleKeyDown}
        >
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              {submitError}
            </div>
          )}

          <Stepper ref={stepperRef} linear>
            <StepperPanel>
              <StepCard
                icon={<UserIcon className="w-8 h-8" />}
                title="¿Cómo te llamas?"
                subtitle="Ingresa tu nombre completo"
              >
                <div className="flex flex-col gap-2">
                  <InputText
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => updateField('nombre', e.target.value)}
                    placeholder="Ej: Juan Pérez García"
                    className={`w-full p-3 text-base ${errors.nombre ? 'p-invalid' : ''}`}
                  />
                  {errors.nombre && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <i className="pi pi-exclamation-circle text-xs" />
                      <span>{errors.nombre}</span>
                    </div>
                  )}
                </div>
              </StepCard>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button 
                  label="Continuar" 
                  icon="pi pi-arrow-right" 
                  iconPos="right" 
                  onClick={handleNext}
                  className="btn-primary"
                />
              </div>
            </StepperPanel>

            <StepperPanel>
              <StepCard
                icon={<CalendarIcon className="w-8 h-8" />}
                title="¿Cuándo naciste?"
                subtitle="Selecciona tu fecha de nacimiento"
              >
                <div className="flex flex-col gap-2">
                  <Calendar
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento + 'T00:00:00') : null}
                    onChange={(e) => {
                      const date = e.value as Date;
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formatted = `${year}-${month}-${day}`;
                        updateField('fechaNacimiento', formatted);
                      }
                    }}
                    dateFormat="dd/mm/yy"
                    showIcon
                    placeholder="DD/MM/AAAA"
                    maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
                    viewDate={new Date(2000, 0, 1)}
                    yearNavigator
                    yearRange="1940:2013"
                    className={`w-full ${errors.fechaNacimiento ? 'p-invalid' : ''}`}
                    inputClassName="p-3 text-base"
                  />
                  {errors.fechaNacimiento && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <i className="pi pi-exclamation-circle text-xs" />
                      <span>{errors.fechaNacimiento}</span>
                    </div>
                  )}
                </div>
              </StepCard>
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button 
                  label="Atrás" 
                  icon="pi pi-arrow-left" 
                  onClick={handleBack} 
                  text
                  className="text-gray-600"
                />
                <Button 
                  label="Continuar" 
                  icon="pi pi-arrow-right" 
                  iconPos="right" 
                  onClick={handleNext}
                  className="btn-primary"
                />
              </div>
            </StepperPanel>

            <StepperPanel>
              <StepCard
                icon={<PhoneIcon className="w-8 h-8" />}
                title="¿Cuál es tu teléfono?"
                subtitle="Incluye el código de país"
              >
                <div className="flex flex-col gap-2">
                  <InputText
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                    placeholder="+1 809 000-0000"
                    className={`w-full p-3 text-base ${errors.telefono ? 'p-invalid' : ''}`}
                  />
                  {errors.telefono && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <i className="pi pi-exclamation-circle text-xs" />
                      <span>{errors.telefono}</span>
                    </div>
                  )}
                </div>
              </StepCard>
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button 
                  label="Atrás" 
                  icon="pi pi-arrow-left" 
                  onClick={handleBack} 
                  text
                  className="text-gray-600"
                />
                <Button 
                  label="Continuar" 
                  icon="pi pi-arrow-right" 
                  iconPos="right" 
                  onClick={handleNext}
                  className="btn-primary"
                />
              </div>
            </StepperPanel>

            <StepperPanel>
              <StepCard
                icon={<UserIcon className="w-8 h-8" />}
                title="¿Cómo te identificas?"
                subtitle="Selecciona una opción"
              >
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <GenderOption
                      icon={<MaleIcon className="w-full h-full" />}
                      label="Hombre"
                      selected={formData.sexo === 'masculino'}
                      onSelect={() => updateField('sexo', 'masculino')}
                      variant="primary"
                    />
                    <GenderOption
                      icon={<FemaleIcon className="w-full h-full" />}
                      label="Mujer"
                      selected={formData.sexo === 'femenino'}
                      onSelect={() => updateField('sexo', 'femenino')}
                      variant="primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('sexo', 'otro')}
                      className={`
                        w-full p-3 rounded-xl border-2 text-left transition-all duration-200
                        flex items-center gap-3
                        ${formData.sexo === 'otro' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.sexo === 'otro' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <i className={`pi pi-sparkles text-sm ${formData.sexo === 'otro' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <span className={`font-medium ${formData.sexo === 'otro' ? 'text-blue-700' : 'text-gray-700'}`}>Otro</span>
                      {formData.sexo === 'otro' && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('sexo', 'prefiero_no_decir')}
                      className={`
                        w-full p-3 rounded-xl border-2 text-left transition-all duration-200
                        flex items-center gap-3
                        ${formData.sexo === 'prefiero_no_decir' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.sexo === 'prefiero_no_decir' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <i className={`pi pi-eye-slash text-sm ${formData.sexo === 'prefiero_no_decir' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <span className={`font-medium ${formData.sexo === 'prefiero_no_decir' ? 'text-blue-700' : 'text-gray-700'}`}>Prefiero no decirlo</span>
                      {formData.sexo === 'prefiero_no_decir' && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  {errors.sexo && (
                    <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm">
                      <i className="pi pi-exclamation-circle" />
                      <span>{errors.sexo}</span>
                    </div>
                  )}
                </div>
              </StepCard>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button 
                  label="Atrás" 
                  icon="pi pi-arrow-left" 
                  onClick={handleBack} 
                  text
                  className="text-gray-600"
                />
                <Button 
                  label="Continuar" 
                  icon="pi pi-arrow-right" 
                  iconPos="right" 
                  onClick={handleNext}
                  className="btn-primary"
                />
              </div>
            </StepperPanel>

            <StepperPanel>
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials(formData.nombre || '')}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{formData.nombre || 'Tu nombre'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Resumen de tu perfil</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Nombre completo</p>
                        <p className="font-medium text-gray-900 truncate">{formData.nombre || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <i className="pi pi-envelope text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Correo electrónico</p>
                        <p className="font-medium text-gray-900 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                        <p className="font-medium text-gray-900">
                          {formData.fechaNacimiento 
                            ? `${new Date(formData.fechaNacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}${getAge(formData.fechaNacimiento) ? ` (${getAge(formData.fechaNacimiento)} años)` : ''}`
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <PhoneIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{formData.telefono || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        {formData.sexo === 'masculino' ? (
                          <MaleIcon className="w-5 h-5 text-blue-600" />
                        ) : formData.sexo === 'femenino' ? (
                          <FemaleIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Sexo</p>
                        <p className="font-medium text-gray-900">
                          {formData.sexo ? sexOptions.find(o => o.value === formData.sexo)?.label : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="pi pi-shield text-green-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Todo listo para comenzar</p>
                    <p className="text-xs text-green-600 mt-1">Al confirmar, podrás acceder a todas las funcionalidades de UniPath.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button 
                  label="Atrás" 
                  icon="pi pi-arrow-left" 
                  onClick={handleBack} 
                  text
                  className="text-gray-600"
                />
                <Button 
                  label="Confirmar y continuar" 
                  icon="pi pi-check" 
                  iconPos="right" 
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  className="btn-success"
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Tu información está protegida y solo se usa para personalizar tu experiencia
        </p>
      </div>
    </div>
  );
};
