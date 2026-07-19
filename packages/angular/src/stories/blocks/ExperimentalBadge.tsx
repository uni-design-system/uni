interface ExperimentalBadgeProps {
  label?: string;
  variant?: 'experimental' | 'beta' | 'alpha' | 'deprecated';
}

const variantStyles = {
  experimental: {
    background: '#ff6b35',
    color: 'white',
  },
  beta: {
    background: '#4285f4',
    color: 'white',
  },
  alpha: {
    background: '#9c27b0',
    color: 'white',
  },
  deprecated: {
    background: '#757575',
    color: 'white',
  },
};

const variantLabels = {
  experimental: 'EXPERIMENTAL',
  beta: 'BETA',
  alpha: 'ALPHA',
  deprecated: 'DEPRECATED',
};

export const ExperimentalBadge = ({
  label,
  variant = 'experimental',
}: ExperimentalBadgeProps) => (
  <span
    style={{
      ...variantStyles[variant],
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      marginLeft: '8px',
      display: 'inline-block',
      verticalAlign: 'middle',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}
  >
    {label || variantLabels[variant]}
  </span>
);
