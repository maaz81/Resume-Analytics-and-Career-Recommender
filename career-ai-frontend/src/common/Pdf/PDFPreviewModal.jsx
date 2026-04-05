import PDFViewer from './PDFViewer';
import { X } from 'lucide-react';

const PDFPreviewModal = ({ isOpen, onClose, fileUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-4xl rounded-lg p-4 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3"
                >
                    <X />
                </button>

                <PDFViewer fileUrl={fileUrl} />
            </div>
        </div>
    );
};

export default PDFPreviewModal;