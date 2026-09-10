type LogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export function Logo({ className = "", variant = "light" }: LogoProps) {
  const wordmark =
    variant === "dark" ? "text-white" : "text-slate-900";
  const accent =
    variant === "dark" ? "text-brand-400" : "text-brand-600";

  return (
    <a
      href="#inicio"
      className={`inline-flex items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${className}`}
      aria-label="Aula TP Chile — inicio"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="9" fill="#0B5FFF" />
        <path
          d="M8 24V12l10 6 10-6v12"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="2.2" fill="#F5C518" />
      </svg>
      <span className={`text-lg font-bold tracking-tight ${wordmark}`}>
        Aula TP <span className={accent}>Chile</span>
      </span>
    </a>
  );
}
