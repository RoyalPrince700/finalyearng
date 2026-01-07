import { LuX, LuCheck } from 'react-icons/lu';

const SuccessModal = ({ isOpen, onClose, title = "Success!", message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h3 className="font-semibold text-lg text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1 rounded-full transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <LuCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
