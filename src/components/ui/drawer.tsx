import React from 'react';
import classNames from 'classnames';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, children }) => {
  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 flex',
        open ? 'translate-x-0' : 'translate-x-full',
        'transition-transform duration-300'
      )}
    >
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white w-80 max-w-full h-full shadow-lg">
        <button
          className="absolute top-0 right-0 m-4 text-gray-600"
          onClick={onClose}
        >
          Close
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};