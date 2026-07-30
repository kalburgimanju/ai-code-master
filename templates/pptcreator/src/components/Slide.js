import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Upload, FileText, Upload as UploadIcon } from 'lucide-react';
import { Button } from './ui/Button';
export const Slide = ({ slideNumber, title, content, isActive = false, onUpload, showUploadPrompt = false }) => {
    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            onUpload(e.target.files[0]);
        }
    };
    const handleUploadClick = (e) => {
        e.stopPropagation();
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.svg';
        fileInput.onchange = handleFileUpload;
        fileInput.click();
    };
    return (_jsxs(motion.div, { className: `absolute inset-0 w-full h-screen p-8 flex flex-col transition-all duration-500
        ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
        ${showUploadPrompt ? 'border-2 border-dashed border-gray-300 bg-gray-50' : ''}
      `, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }, transition: { duration: 0.4 }, children: [showUploadPrompt ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [_jsx("div", { className: "w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4", children: _jsx(UploadIcon, { className: "w-12 h-12 text-gray-400" }) }), _jsx("p", { className: "text-gray-600 mb-2", children: "Upload your presentation" }), _jsx("p", { className: "text-sm text-gray-400", children: "Drag & drop or click to browse" }), _jsx("input", { type: "file", accept: ".ppt,.pptx,.pdf,.png,.jpg,.jpeg,.svg", onChange: handleFileUpload, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer" })] })) : (_jsxs("div", { className: "flex-1 flex flex-col", children: [slideNumber === 1 && (_jsx("div", { className: "flex items-center justify-center flex-1", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: title }), _jsx("p", { className: "text-lg text-gray-600 max-w-2xl mx-auto", children: content })] }) })), slideNumber > 1 && (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("div", { className: "text-center max-w-4xl mx-auto", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 border border-gray-200", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-6", children: title }), _jsx("div", { className: "text-gray-700 text-lg leading-relaxed whitespace-pre-line", children: content })] }) }) }))] })), _jsxs("div", { className: "flex items-center justify-between mt-8", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Slide ", slideNumber] }), _jsxs("div", { className: "flex items-center space-x-2", children: [slideNumber === 1 && (_jsxs("div", { className: "flex items-center text-sm text-blue-600", children: [_jsx(FileText, { className: "w-4 h-4 mr-1" }), "Title Slide"] })), slideNumber > 1 && (_jsxs("div", { className: "flex items-center text-sm text-green-600", children: [_jsx("span", { className: "w-2 h-2 bg-green-600 rounded-full mr-2" }), "Content Slide"] })), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleUploadClick, className: "ml-4", children: [_jsx(Upload, { className: "w-4 h-4 mr-1" }), " Upload"] })] })] })] }));
};
