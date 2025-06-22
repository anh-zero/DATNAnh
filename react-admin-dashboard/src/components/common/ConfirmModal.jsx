import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmButtonClass = "bg-red-500 hover:bg-red-600"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white dark:bg-theme-surface0 rounded-lg max-w-md w-full relative border border-theme-border shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="p-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-theme-text-primary">{title}</h3>
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                    <p className="text-gray-600 dark:text-theme-text-secondary">{message}</p>
                </div>
                <div className="bg-gray-50 dark:bg-theme-surface px-6 py-4 flex justify-end space-x-2 rounded-b-lg">
                    <button
                        className="px-4 py-2 border border-gray-300 dark:border-theme-border text-gray-700 dark:text-gray-300 rounded-md shadow-sm bg-white dark:bg-theme-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`px-4 py-2 border border-transparent text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary ${confirmButtonClass}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmModal;