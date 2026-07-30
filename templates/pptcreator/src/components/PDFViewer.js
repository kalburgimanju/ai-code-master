import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Maximize2, Minimize2, X } from 'lucide-react';
export const PDFViewer = ({ file, onClose }) => {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const handleDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };
    const handleRenderPage = ({ pageIndex }) => {
        setPageNumber(pageIndex + 1);
    };
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    if (!file)
        return null;
    return (_jsx("div", { className: `fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300
      ${isFullscreen ? 'p-8' : 'p-4 flex items-center justify-center'}
    `, children: _jsxs("div", { className: "w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [file.name, " - Page ", pageNumber, " of ", numPages] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: toggleFullscreen, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: isFullscreen ? _jsx(Minimize2, { className: "w-5 h-5" }) : _jsx(Maximize2, { className: "w-5 h-5" }) }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-8 flex items-center justify-center", children: _jsx(Document, { file: file, onLoadSuccess: handleDocumentLoadSuccess, className: "max-w-full", children: _jsx(Page, { pageNumber: pageNumber, renderTextLayer: false, renderAnnotationLayer: false, className: "shadow-lg", onRenderSuccess: handleRenderPage, width: isFullscreen ? 1200 : 600 }) }) }), _jsx("div", { className: "px-6 py-4 border-t border-gray-200 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-center space-x-4", children: [_jsx("button", { onClick: () => setPageNumber(Math.max(1, pageNumber - 1)), disabled: pageNumber <= 1, className: "px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Previous" }), _jsxs("span", { className: "px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg", children: [pageNumber, " / ", numPages] }), _jsx("button", { onClick: () => setPageNumber(Math.min(numPages, pageNumber + 1)), disabled: pageNumber >= numPages, className: "px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Next" })] }) })] }) }));
};
