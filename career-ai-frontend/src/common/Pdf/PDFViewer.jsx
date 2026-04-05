import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// react-pdf v10 + pdfjs-dist v5 worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const PDFViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [loadError, setLoadError] = useState(null);

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoadError(null);
    };

    const onLoadError = (error) => {
        console.error('PDF load error:', error);
        setLoadError(error?.message || 'Failed to load PDF');
    };

    return (
        <div className="overflow-auto h-[80vh]">
            {loadError && (
                <div className="p-4 text-center">
                    <p className="text-red-500 mb-2">Error: {loadError}</p>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        Open PDF in new tab instead
                    </a>
                </div>
            )}
            <Document
                file={fileUrl}
                onLoadSuccess={onLoadSuccess}
                onLoadError={onLoadError}
                loading={<div className="text-center p-4">Loading PDF...</div>}
            >
                {numPages && Array.from(new Array(numPages), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={800}
                    />
                ))}
            </Document>
        </div>
    );
};

export default PDFViewer;