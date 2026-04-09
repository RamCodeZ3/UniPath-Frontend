interface KpiCardsProps {
  profileComplete: boolean;
  documentsCount: number;
  universityApplicationsCount: number;
  scholarshipApplicationsCount: number;
}

interface KpiItem {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: 'blue' | 'green' | 'amber' | 'indigo';
}

const toneMap: Record<KpiItem['tone'], { bg: string; text: string; icon: string }> = {
  blue: {
    bg: 'bg-blue-50 border-blue-100',
    text: 'text-blue-700',
    icon: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-50 border-green-100',
    text: 'text-green-700',
    icon: 'bg-green-100 text-green-700',
  },
  amber: {
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-700',
    icon: 'bg-amber-100 text-amber-700',
  },
  indigo: {
    bg: 'bg-indigo-50 border-indigo-100',
    text: 'text-indigo-700',
    icon: 'bg-indigo-100 text-indigo-700',
  },
};

export const KpiCards = ({
  profileComplete,
  documentsCount,
  universityApplicationsCount,
  scholarshipApplicationsCount,
}: KpiCardsProps) => {
  const items: KpiItem[] = [
    {
      label: 'Perfil',
      value: profileComplete ? 'Completo' : 'Incompleto',
      detail: profileComplete ? 'Listo para aplicar' : 'Completa tus datos personales',
      icon: 'pi-user',
      tone: profileComplete ? 'green' : 'amber',
    },
    {
      label: 'Documentos',
      value: `${documentsCount}`,
      detail: documentsCount > 0 ? 'Disponibles en tu perfil' : 'Aun no has subido documentos',
      icon: 'pi-file',
      tone: 'blue',
    },
    {
      label: 'Postulaciones a universidades',
      value: `${universityApplicationsCount}`,
      detail: universityApplicationsCount > 0 ? 'Registradas en el sistema' : 'Sin postulaciones aun',
      icon: 'pi-building',
      tone: 'indigo',
    },
    {
      label: 'Postulaciones a becas',
      value: `${scholarshipApplicationsCount}`,
      detail: scholarshipApplicationsCount > 0 ? 'Postulaciones activas' : 'Sin postulaciones aun',
      icon: 'pi-graduation-cap',
      tone: 'blue',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const tone = toneMap[item.tone];

        return (
          <article key={item.label} className={`border rounded-2xl p-4 ${tone.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide font-semibold text-gray-600">{item.label}</p>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone.icon}`}>
                <i className={`pi ${item.icon} text-sm`} />
              </span>
            </div>
            <p className={`text-lg font-bold ${tone.text}`}>{item.value}</p>
            <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
          </article>
        );
      })}
    </section>
  );
};
