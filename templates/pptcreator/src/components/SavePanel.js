import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Download, Save, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
export const SavePanel = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('My Presentation');
    const [fileType, setFileType] = useState('pdf');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const handleSave = async () => {
        if (!title.trim())
            return;
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await onSave({ title, fileType });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
        catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('error'), 3000);
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center", children: [_jsx(Save, { className: "w-5 h-5 mr-2" }), "Save Presentation"] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Presentation Title" }), _jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Enter presentation title...", error: !title.trim() ? 'Title is required' : '', maxLength: 100 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Export Format" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { onClick: () => setFileType('pdf'), className: `p-3 rounded-lg border-2 transition-all
                    ${fileType === 'pdf'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'}
                  `, children: [_jsx(AlertCircle, { className: "w-6 h-6 mx-auto mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "PDF" })] }), _jsxs("button", { onClick: () => setFileType('image'), className: `p-3 rounded-lg border-2 transition-all
                    ${fileType === 'image'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'}
                  `, children: [_jsx(ImageIcon, { className: "w-6 h-6 mx-auto mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Image" })] }), _jsxs("button", { onClick: () => setFileType('both'), className: `p-3 rounded-lg border-2 transition-all
                    ${fileType === 'both'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'}
                  `, children: [_jsx(Download, { className: "w-6 h-6 mx-auto mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Both" })] })] })] })] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: [saveStatus === 'success' && (_jsxs("span", { className: "flex items-center text-green-600", children: [_jsx(Check, { className: "w-4 h-4 mr-1" }), "Saved successfully!"] })), saveStatus === 'error' && (_jsxs("span", { className: "flex items-center text-red-600", children: [_jsx(AlertCircle, { className: "w-4 h-4 mr-1" }), "Save failed. Please try again."] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isSaving, children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: isSaving || !title.trim(), children: isSaving ? 'Saving...' : 'Save' })] })] })] })] }) }));
};
