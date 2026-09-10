import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.85,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconLedger({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v13H8A2 2 0 0 1 6 18V4.5Z" {...stroke} />
      <path d="M6 4.5A2 2 0 0 0 4 6.5V18" {...stroke} />
      <path d="M9.5 9h6M9.5 13h6M9.5 17h4" {...stroke} />
    </Svg>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 16V7.5A1.5 1.5 0 0 1 4.5 6H14v10" {...stroke} />
      <path d="M14 10h4.2L21 13.2V16h-3" {...stroke} />
      <circle cx="7.5" cy="16.5" r="1.7" {...stroke} />
      <circle cx="16.5" cy="16.5" r="1.7" {...stroke} />
    </Svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 19h16" {...stroke} />
      <path d="M7 16V11M12 16V8M17 16v-4" {...stroke} />
    </Svg>
  );
}

export function IconCart({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 5h2l1.6 9.2A2 2 0 0 0 9.6 16H17" {...stroke} />
      <path d="M8 8h11l-1.2 6.2H9.2" {...stroke} />
      <circle cx="10" cy="19" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="19" r="1.2" fill="currentColor" />
    </Svg>
  );
}

export function IconBoxes({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 8 12 4.5 19.5 8 12 11.5 4.5 8Z" {...stroke} />
      <path d="M4.5 8v7.5L12 19.5l7.5-4V8" {...stroke} />
      <path d="M12 11.5V19.5" {...stroke} />
    </Svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 11.5 12 5l8 6.5" {...stroke} />
      <path d="M7 10.5V19h10v-8.5" {...stroke} />
    </Svg>
  );
}

export function IconExpand({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" {...stroke} />
    </Svg>
  );
}

const BY_VISTA = {
  accounting: IconLedger,
  suppliers: IconTruck,
  statistics: IconChart,
  sales: IconCart,
  inventory: IconBoxes,
  dashboard: IconHome,
};

export function ErpVistaIcon({ vista, className }: { vista: string; className?: string }) {
  const Cmp = BY_VISTA[vista as keyof typeof BY_VISTA] || IconHome;
  return <Cmp className={className} />;
}
