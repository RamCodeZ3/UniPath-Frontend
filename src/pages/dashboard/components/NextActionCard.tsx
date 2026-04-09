import { Button } from 'primereact/button';

interface NextActionCardProps {
  title: string;
  description: string;
  actionLabel: string;
  actionIcon?: string;
  onAction: () => void;
}

export const NextActionCard = ({
  title,
  description,
  actionLabel,
  actionIcon = 'pi pi-arrow-right',
  onAction,
}: NextActionCardProps) => {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
          <i className="pi pi-bolt text-sm" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      <Button
        label={actionLabel}
        icon={actionIcon}
        iconPos="right"
        className="w-full"
        onClick={onAction}
      />
    </section>
  );
};
