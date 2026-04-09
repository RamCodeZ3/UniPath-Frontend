import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchGetUserApplications } from '../../store/application/thunks';
import { fetchGetDocumentsByProfileId } from '../../store/document/thunks';
import {
  fetchGetAllScholarships,
  fetchGetScholarshipApplicationsByProfileId,
} from '../../store/scholarship/thunk';
import { KpiCards } from './components/KpiCards';
import { NextActionCard } from './components/NextActionCard';
import { ProgressHero } from './components/ProgressHero';
import { QuickActions, type QuickActionItem } from './components/QuickActions';
import { UpcomingScholarships } from './components/UpcomingScholarships';

interface PrimaryActionConfig {
  label: string;
  description: string;
  target: string;
  icon?: string;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { profile, user } = useSelector((state: RootState) => state.auth);
  const { documents, status: documentStatus } = useSelector((state: RootState) => state.document);
  const { applications: universityApplications, fetchStatus: universityFetchStatus } = useSelector(
    (state: RootState) => state.application
  );
  const {
    scholarships,
    applications: scholarshipApplications,
    status: scholarshipStatus,
    applicationStatus: scholarshipApplicationStatus,
  } = useSelector((state: RootState) => state.scholarship);

  useEffect(() => {
    if (!profile?.id) return;

    dispatch(fetchGetDocumentsByProfileId(profile.id));
    dispatch(fetchGetUserApplications(profile.id));
    dispatch(fetchGetScholarshipApplicationsByProfileId(profile.id));
    dispatch(fetchGetAllScholarships());
  }, [dispatch, profile?.id]);

  const userName =
    profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Estudiante';

  const profileComplete = useMemo(() => {
    if (!profile) return false;

    return Boolean(profile.birthdate && profile.number && profile.genre);
  }, [profile]);

  const mandatoryMilestones = useMemo(
    () => [
      { label: 'Completar perfil', done: profileComplete },
      { label: 'Subir al menos 1 documento', done: documents.length > 0 },
      {
        label: 'Enviar 1 postulacion (universidad o beca)',
        done: universityApplications.length + scholarshipApplications.length > 0,
      },
      {
        label: 'Mantener oportunidades activas',
        done:
          scholarshipApplications.some((app) => app.status === 'pending' || app.status === 'in_review') ||
          universityApplications.some((app) => app.status === 'pending'),
      },
    ],
    [documents.length, profileComplete, scholarshipApplications, universityApplications]
  );

  const completedMilestones = mandatoryMilestones.filter((step) => step.done).length;

  const primaryAction = useMemo<PrimaryActionConfig>(() => {
    if (!profileComplete) {
      return {
        label: 'Completar perfil',
        description: 'Actualiza tus datos personales para habilitar postulaciones mas precisas.',
        target: '/profile',
        icon: 'pi pi-user-edit',
      };
    }

    if (documents.length === 0) {
      return {
        label: 'Subir documentos',
        description: 'Sube tus documentos base para acelerar postulaciones a universidades y becas.',
        target: '/documents',
        icon: 'pi pi-file-import',
      };
    }

    if (scholarshipApplications.length === 0) {
      return {
        label: 'Aplicar a una beca',
        description: 'Empieza por una beca abierta para aumentar tus opciones de financiamiento.',
        target: '/scholarships',
        icon: 'pi pi-graduation-cap',
      };
    }

    if (universityApplications.length === 0) {
      return {
        label: 'Aplicar a una universidad',
        description: 'Complementa tu ruta aplicando tambien a una universidad de interes.',
        target: '/universities',
        icon: 'pi pi-building',
      };
    }

    return {
      label: 'Explorar nuevas becas',
      description: 'Ya tienes postulaciones activas. Revisa nuevas oportunidades y fechas cercanas.',
      target: '/scholarships',
      icon: 'pi pi-compass',
    };
  }, [documents.length, profileComplete, scholarshipApplications.length, universityApplications.length]);

  const openScholarships = useMemo(() => {
    const today = new Date();

    return scholarships
      .filter((scholarship) => scholarship.status === 'open')
      .filter((scholarship) => {
        const deadline = scholarship.application_deadline
          ? new Date(scholarship.application_deadline)
          : null;

        if (!deadline || Number.isNaN(deadline.getTime())) return true;
        return deadline.getTime() >= today.getTime() - 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => {
        const dateA = a.application_deadline ? new Date(a.application_deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.application_deadline ? new Date(b.application_deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      })
      .slice(0, 4);
  }, [scholarships]);

  const quickActions = useMemo<QuickActionItem[]>(
    () => [
      {
        title: 'Explorar universidades',
        description: 'Filtra universidades por modalidad y estado para decidir tu proxima postulacion.',
        icon: 'pi-building',
        onClick: () => navigate('/universities'),
      },
      {
        title: 'Explorar becas',
        description: 'Consulta becas abiertas y aplica con tus documentos ya cargados.',
        icon: 'pi-graduation-cap',
        onClick: () => navigate('/scholarships'),
      },
      {
        title: 'Gestionar documentos',
        description: 'Sube, revisa y organiza tus documentos disponibles para aplicar.',
        icon: 'pi-file',
        onClick: () => navigate('/documents'),
      },
      {
        title: 'Actualizar perfil',
        description: 'Mantener tu perfil completo mejora la calidad de tus recomendaciones.',
        icon: 'pi-user',
        onClick: () => navigate('/profile'),
      },
    ],
    [navigate]
  );

  const isLoading =
    documentStatus === 'pending' ||
    universityFetchStatus === 'pending' ||
    scholarshipStatus === 'pending' ||
    scholarshipApplicationStatus === 'pending';

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-5">
          <div className="h-56 sm:h-52 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-white border border-gray-100 animate-pulse"
              />
            ))}
          </div>
          <div className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
            <div className="xl:col-span-2 h-56 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            <div className="h-56 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-5">
        <ProgressHero
          userName={userName}
          completedSteps={completedMilestones}
          totalSteps={mandatoryMilestones.length}
          milestones={mandatoryMilestones}
          primaryActionLabel={primaryAction.label}
          primaryActionDescription={primaryAction.description}
          onPrimaryAction={() => navigate(primaryAction.target)}
        />

        <KpiCards
          profileComplete={profileComplete}
          documentsCount={documents.length}
          universityApplicationsCount={universityApplications.length}
          scholarshipApplicationsCount={scholarshipApplications.length}
        />

        <NextActionCard
          title="Tu enfoque de esta semana"
          description={primaryAction.description}
          actionLabel={primaryAction.label}
          actionIcon={primaryAction.icon}
          onAction={() => navigate(primaryAction.target)}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
          <div className="xl:col-span-2">
            <QuickActions actions={quickActions} />
          </div>

          <UpcomingScholarships
            scholarships={openScholarships}
            onOpenScholarships={() => navigate('/scholarships')}
          />
        </div>
      </main>
    </div>
  );
}
