interface QuickActionItem {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Accesos rapidos</h2>
      <p className="text-sm text-gray-600 mt-1 mb-4">Navega a los modulos clave de tu proceso</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className="text-left w-full min-h-14 border border-gray-100 rounded-xl p-3.5 sm:p-4 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <i className={`pi ${action.icon} text-sm`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{action.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export type { QuickActionItem };
