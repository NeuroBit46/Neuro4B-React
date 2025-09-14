export default function ButtonBase({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  const base = 'rounded-sm font-medium transition-colors duration-200';
  const variants = {
    primary: 'bg-primary text-primary-bg cursor-pointer hover:bg-primary-hover',
    secondary: 'bg-secondary text-primary-bg cursor-pointer hover:bg-secondary-hover',
    disabledPrimary: 'bg-primary-disabled text-primary-bg',
    disabledSecondary: 'bg-secondary-bg text-secondary border-secondary border-1',
  };

  const sizes = {
    sm: 'px-4 py-1 text-xs',
    md: 'px-6 py-1.5 text-sm',
    lg: 'px-8 py-3 text-lg',
  };

  const style = `${base} ${sizes[size]} ${
  disabled
    ? variant === 'primary'
      ? variants.disabledPrimary
      : variants.disabledSecondary
    : variants[variant]
  } ${className}`;


  return (
    <button onClick={onClick} disabled={disabled} className={style}>
      {children}
    </button>
  );
}
