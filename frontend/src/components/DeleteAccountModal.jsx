import { LuTriangleAlert, LuX } from 'react-icons/lu';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <h3 className="text-lg font-semibold text-neutral-900">Delete Account</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <LuTriangleAlert className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-neutral-700">
                This will permanently delete your account and remove your projects,
                saved content, and conversations.
              </p>
              <p className="text-sm font-medium text-red-600">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-100 bg-neutral-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
