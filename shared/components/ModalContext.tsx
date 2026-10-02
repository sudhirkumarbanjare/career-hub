import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { SuccessModal } from './SuccessModal';
import { ErrorModal } from './ErrorModal';
import { WarningModal } from './WarningModal';
import { InfoModal } from './InfoModal';
import { LoadingModal } from './LoadingModal';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  icon?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel?: () => void;
}

export interface ModalContextType {
  showSuccess: (title: string, message: string, onOk?: () => void, icon?: string) => void;
  showError: (title: string, message: string, onRetry?: () => void, icon?: string) => void;
  showWarning: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, icon?: string) => void;
  showInfo: (title: string, message: string, onOk?: () => void, icon?: string) => void;
  showConfirm: (options: ConfirmOptions) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Success state
  const [successConfig, setSuccessConfig] = useState<{
    title: string;
    message: string;
    onOk?: () => void;
    icon?: string;
  } | null>(null);

  // Error state
  const [errorConfig, setErrorConfig] = useState<{
    title: string;
    message: string;
    onRetry?: () => void;
    icon?: string;
  } | null>(null);

  // Warning state
  const [warningConfig, setWarningConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    icon?: string;
  } | null>(null);

  // Info state
  const [infoConfig, setInfoConfig] = useState<{
    title: string;
    message: string;
    onOk?: () => void;
    icon?: string;
  } | null>(null);

  // Loading state
  const [loadingConfig, setLoadingConfig] = useState<{ message?: string } | null>(null);

  const showSuccess = useCallback((title: string, message: string, onOk?: () => void, icon?: string) => {
    setSuccessConfig({ title, message, onOk, icon });
  }, []);

  const showError = useCallback((title: string, message: string, onRetry?: () => void, icon?: string) => {
    setErrorConfig({ title, message, onRetry, icon });
  }, []);

  const showWarning = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    icon?: string
  ) => {
    setWarningConfig({ title, message, onConfirm, onCancel, icon });
  }, []);

  const showInfo = useCallback((title: string, message: string, onOk?: () => void, icon?: string) => {
    setInfoConfig({ title, message, onOk, icon });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmConfig(options);
  }, []);

  const showLoading = useCallback((message?: string) => {
    setLoadingConfig({ message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingConfig(null);
  }, []);

  const hideModal = useCallback(() => {
    setConfirmConfig(null);
    setSuccessConfig(null);
    setErrorConfig(null);
    setWarningConfig(null);
    setInfoConfig(null);
    setLoadingConfig(null);
    setConfirmLoading(false);
  }, []);

  const handleConfirmAction = async (reason?: string) => {
    if (!confirmConfig) return;
    try {
      setConfirmLoading(true);
      await confirmConfig.onConfirm(reason);
      setConfirmConfig(null);
    } catch (err: any) {
      setErrorConfig({
        title: 'Action Failed',
        message: err?.message || 'Could not complete action. Please try again.',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showLoading,
        hideLoading,
        hideModal,
      }}
    >
      {children}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmationModal
          visible={!!confirmConfig}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isDestructive={confirmConfig.isDestructive}
          requireReason={confirmConfig.requireReason}
          reasonPlaceholder={confirmConfig.reasonPlaceholder}
          icon={confirmConfig.icon}
          loading={confirmLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            if (confirmConfig.onCancel) confirmConfig.onCancel();
            setConfirmConfig(null);
          }}
        />
      )}

      {/* Success Modal */}
      {successConfig && (
        <SuccessModal
          visible={!!successConfig}
          title={successConfig.title}
          message={successConfig.message}
          icon={successConfig.icon}
          onClose={() => {
            const cb = successConfig.onOk;
            setSuccessConfig(null);
            if (cb) cb();
          }}
        />
      )}

      {/* Error Modal */}
      {errorConfig && (
        <ErrorModal
          visible={!!errorConfig}
          title={errorConfig.title}
          message={errorConfig.message}
          icon={errorConfig.icon}
          onRetry={errorConfig.onRetry}
          onClose={() => setErrorConfig(null)}
        />
      )}

      {/* Warning Modal */}
      {warningConfig && (
        <WarningModal
          visible={!!warningConfig}
          title={warningConfig.title}
          message={warningConfig.message}
          icon={warningConfig.icon}
          onConfirm={() => {
            const cb = warningConfig.onConfirm;
            setWarningConfig(null);
            cb();
          }}
          onCancel={() => {
            const cb = warningConfig.onCancel;
            setWarningConfig(null);
            if (cb) cb();
          }}
        />
      )}

      {/* Info Modal */}
      {infoConfig && (
        <InfoModal
          visible={!!infoConfig}
          title={infoConfig.title}
          message={infoConfig.message}
          icon={infoConfig.icon}
          onClose={() => {
            const cb = infoConfig.onOk;
            setInfoConfig(null);
            if (cb) cb();
          }}
        />
      )}

      {/* Loading Modal */}
      {loadingConfig && (
        <LoadingModal
          visible={!!loadingConfig}
          message={loadingConfig.message}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
