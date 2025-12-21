/**
 * Toast Notification Provider
 * 
 * Configured to always display on top of modals and other content
 */

'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      containerClassName="!z-[999999]"
      containerStyle={{
        zIndex: 999999, // Ensure toast container is always on top, higher than modals (z-99999)
        position: 'fixed', // Ensure it's positioned fixed
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #fff)',
          color: 'var(--toast-color, #333)',
          zIndex: 999999, // Ensure individual toasts also have high z-index
        },
        className: '!z-[999999]', // Additional className for z-index
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
