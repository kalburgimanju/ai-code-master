import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
export const UploadPanel = ({ isOpen, onClose, onUpload, currentSlide }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({
        '.ppt': 0,
        '.pptx': 0,
        '.pdf': 0,
        '.png': 0,
        '.jpg': 0,
        '.jpeg': 0,
        '.svg': 0
    });
    const fileInputRef = useRef(null);
    const acceptedTypes = [
        'presentation/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/svg+xml'
    ];
    const acceptedExtensions = ['.ppt', '.pptx', '.pdf', '.png', '.jpg', '.jpeg', '.svg'];
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const simulateUpload = (file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension)
            return;
        const key = `.${extension}`;
        if (!uploadProgress[key])
            return;
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(prev => ({
                ...prev,
                [key]: progress
            }));
            if (progress >= 100) {
                clearInterval(interval);
                onUpload(file, currentSlide);
                setTimeout(() => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [key]: 0
                    }));
                }, 2000);
            }
        }, 300);
    };
    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            simulateUpload(e.target.files[0]);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            simulateUpload(e.dataTransfer.files[0]);
        }
    };
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'ppt':
            case 'pptx':
                return _jsx(FileText, { className: "w-5 h-5 text-blue-600" });
            case 'pdf':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-600" });
            case 'png':
            case 'jpg':
            case 'jpeg':
                return _jsx(ImageIcon, { className: "w-5 h-5 text-green-600" });
            default:
                return _jsx(FileText, { className: "w-5 h-5 text-gray-600" });
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Upload Presentation" }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: `border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
              ${isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            `, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [_jsx(Upload, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Drop files here" }), _jsx("p", { className: "text-gray-600 mb-4", children: "or" }), _jsx(Button, { onClick: () => fileInputRef.current?.click(), className: "mb-4", children: "Choose Files" }), _jsx("input", { ref: fileInputRef, type: "file", accept: acceptedExtensions.join(','), onChange: handleFileUpload, className: "hidden" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Accepted: ", acceptedExtensions.join(', '), " (max 50MB)"] })] }), (Object.entries(uploadProgress).some(([_, progress]) => progress > 0) && (_jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Upload Progress" }), Object.entries(uploadProgress).map(([extension, progress]) => (progress > 0 && (_jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "text-sm text-gray-600 flex items-center", children: [getFileIcon(extension), _jsx("span", { className: "ml-2", children: extension })] }), _jsxs("span", { className: "text-sm text-gray-500", children: [progress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) })] }, extension))))] })))] })] }) }));
};
