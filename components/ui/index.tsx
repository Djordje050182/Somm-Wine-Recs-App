import React from 'react';

// Shared design-system primitives. See DESIGN.md for usage rules.

export const Kicker: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass ${className}`}>{children}</p>
);

export const Rule: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-0 border-t border-hairline ${className}`} />
);

export const SectionHeading: React.FC<{
  kicker?: string;
  title: string;
  standfirst?: string;
  className?: string;
}> = ({ kicker, title, standfirst, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {kicker && <Kicker>{kicker}</Kicker>}
    <h2 className="font-display text-3xl md:text-4xl font-medium text-ink leading-tight">{title}</h2>
    {standfirst && <p className="font-body text-lg text-ink/60 max-w-2xl">{standfirst}</p>}
  </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }
> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const base = 'font-ui font-semibold tracking-wide rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  const sizes = {
    sm: 'text-[11px] uppercase px-3 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-sm px-7 py-3.5',
  };
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-claret text-parchment hover:bg-claret-deep',
    secondary: 'border border-ink/20 text-ink hover:border-ink bg-transparent',
    ghost: 'text-claret hover:text-claret-deep bg-transparent',
    dark: 'bg-ink text-parchment hover:bg-black',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`bg-paper border border-hairline rounded-sm ${className}`} {...props}>
    {children}
  </div>
);

export const Tag: React.FC<{ children: React.ReactNode; tone?: 'default' | 'sale' | 'success'; className?: string }> = ({
  children,
  tone = 'default',
  className = '',
}) => {
  const tones = {
    default: 'border-hairline text-ink/60',
    sale: 'border-terracotta/40 text-terracotta',
    success: 'border-vine/40 text-vine',
  };
  return (
    <span className={`inline-block font-ui text-[10px] font-semibold uppercase tracking-kicker border px-2 py-1 rounded-sm ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

export const EmptyState: React.FC<{ title: string; body?: string; action?: React.ReactNode }> = ({ title, body, action }) => (
  <div className="text-center py-20 px-6">
    <h3 className="font-display text-2xl text-ink mb-2">{title}</h3>
    {body && <p className="font-body text-ink/50 max-w-md mx-auto mb-6">{body}</p>}
    {action}
  </div>
);
