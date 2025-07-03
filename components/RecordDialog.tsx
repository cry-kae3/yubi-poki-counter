'use client';

import React from 'react';

interface RecordDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  employeeName: string;
}

const RecordDialog: React.FC<RecordDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  employeeName
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    } else if (event.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onCancel}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📝 記録確認</h2>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold text-blue-600">{employeeName}</span>
              さんの指ポキを記録しますか？
            </p>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleString('ja-JP')}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              autoFocus
            >
              記録する
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecordDialog;