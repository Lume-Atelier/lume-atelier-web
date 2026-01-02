import { ButtonHTMLAttributes, forwardRef, AnchorHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
  {
    variants: {
      variant: {
        // Botão principal com gradiente dourado
        primary: [
          'bg-gradient-to-r from-gold via-primary to-gold-dark',
          'text-primary-foreground',
          'shadow-lg shadow-gold/30',
          'hover:shadow-xl hover:shadow-gold/50',
          'hover:scale-105',
          'active:scale-95',
          'focus:ring-gold',
        ].join(' '),

        // Botão com borda dourada e fundo transparente
        outline: [
          'border-2 border-gold',
          'text-gold',
          'bg-transparent',
          'hover:bg-gold/10',
          'hover:border-gold-light',
          'hover:scale-105',
          'hover:shadow-lg hover:shadow-gold/30',
          'active:scale-95',
          'focus:ring-gold',
        ].join(' '),

        // Botão secundário com bronze
        secondary: [
          'bg-bronze',
          'text-foreground',
          'hover:bg-bronze-light',
          'hover:scale-105',
          'hover:shadow-lg hover:shadow-bronze/40',
          'active:scale-95',
          'focus:ring-bronze',
        ].join(' '),

        // Botão fantasma (apenas texto)
        ghost: [
          'text-gold',
          'hover:bg-gold/10',
          'hover:text-gold-light',
          'hover:scale-105',
          'active:scale-95',
          'focus:ring-gold',
        ].join(' '),

        // Botão destrutivo (vermelho)
        destructive: [
          'bg-destructive',
          'text-destructive-foreground',
          'hover:bg-destructive/90',
          'hover:scale-105',
          'hover:shadow-lg hover:shadow-destructive/40',
          'active:scale-95',
          'focus:ring-destructive',
        ].join(' '),

        // Botão sutil (muted)
        muted: [
          'bg-muted',
          'text-muted-foreground',
          'hover:bg-muted/80',
          'hover:text-foreground',
          'hover:scale-105',
          'active:scale-95',
          'focus:ring-muted-foreground',
        ].join(' '),

        // Botão com gradiente dourado animado
        gradient: [
          'gradient-gold',
          'text-primary-foreground',
          'shadow-lg shadow-primary/30',
          'hover:shadow-xl hover:shadow-primary/50',
          'hover:scale-105',
          'active:scale-95',
          'focus:ring-primary',
        ].join(' '),
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-base rounded-lg',
        lg: 'px-6 py-3 text-lg rounded-lg',
        xl: 'px-8 py-4 text-xl rounded-xl',
        icon: 'p-2 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, href, ...props }, ref) => {
    const classes = buttonVariants({ variant, size, fullWidth, className });

    const loadingSpinner = loading ? (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : null;

    // Se tiver href, renderiza como Link do Next.js
    if (href) {
      return (
        <Link href={href} className={classes}>
          {loadingSpinner}
          {children}
        </Link>
      );
    }

    // Caso contrário, renderiza como button normal
    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loadingSpinner}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
