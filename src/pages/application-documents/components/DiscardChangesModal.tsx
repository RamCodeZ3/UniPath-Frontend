import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface DiscardChangesModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DiscardChangesModal = ({
  visible,
  onConfirm,
  onCancel,
}: DiscardChangesModalProps) => {
  return (
    <Dialog
      header="⚠️ Descartar cambios"
      visible={visible}
      onHide={onCancel}
      modal
      style={{ width: '90vw', maxWidth: '400px' }}
      footer={
        <div className="flex gap-3">
          <Button
            label="Cancelar"
            onClick={onCancel}
            className="p-button-outlined flex-1"
            icon="pi pi-times"
          />
          <Button
            label="Descartar cambios"
            onClick={onConfirm}
            className="p-button-danger flex-1"
            icon="pi pi-trash"
          />
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-gray-700">
          Tienes documentos sin guardar. Si sales de esta página, se perderán todos los cambios.
        </p>
        <p className="text-gray-600 text-sm">
          ¿Estás seguro de que deseas continuar?
        </p>
      </div>
    </Dialog>
  );
};
