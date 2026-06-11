type AlertProps = {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
};

export default function Alert({ type, message, onDismiss }: AlertProps) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
