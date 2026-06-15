"use client";

import React from "react";

interface CyMedLogoProps {
  variant?: "full" | "icon" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "color";
  className?: string;
}

const SIZES = {
  xs: { icon: 24,  text: 14, sub: 7  },
  sm: { icon: 32,  text: 18, sub: 9  },
  md: { icon: 40,  text: 22, sub: 10 },
  lg: { icon: 52,  text: 28, sub: 12 },
  xl: { icon: 72,  text: 38, sub: 14 },
};

/* The real CyMed C-mark: orange C + blue circle accent */
export function CyMedIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const scale = size / 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CyMed"
    >
      {/* Orange C letterform */}
      <path
        d="M28 10.5 C28 10.5 22 8 16 8 C9.4 8 5 12.5 5 20 C5 27.5 9.4 32 16 32 C22 32 28 29.5 28 29.5 L28 25.5 C28 25.5 23 27.5 16.5 27.5 C12 27.5 9.5 24.5 9.5 20 C9.5 15.5 12 12.5 16.5 12.5 C23 12.5 28 14.5 28 14.5 Z"
        fill="#E67E22"
      />
      {/* Blue circle accent — top right of C */}
      <circle cx="29" cy="10" r="5" fill="#5DADE2" />
      {/* White inner dot for depth */}
      <circle cx="29" cy="10" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}

export function CyMedLogo({
  variant = "full",
  size = "md",
  theme = "dark",
  className = "",
}: CyMedLogoProps) {
  const s = SIZES[size];
  const textColor = theme === "light" ? "#2c3e50" : "#ffffff";
  const subColor  = theme === "light" ? "#7f8c8d" : "rgba(255,255,255,0.5)";

  if (variant === "icon") {
    return <CyMedIcon size={s.icon} className={className} />;
  }

  if (variant === "wordmark") {
    return (
      <div className={`flex items-center gap-0 ${className}`} style={{ lineHeight: 1 }}>
        <span style={{ fontFamily: "Arial, sans-serif", fontSize: s.text, fontWeight: 700, color: "#E67E22", letterSpacing: "0.05em" }}>
          CY
        </span>
        <span style={{ fontFamily: "Arial, sans-serif", fontSize: s.text, fontWeight: 700, color: textColor, letterSpacing: "0.05em" }}>
          MED
        </span>
      </div>
    );
  }

  /* Full logo: icon + wordmark + subtitle */
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CyMedIcon size={s.icon} />
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: s.text, fontWeight: 700, color: "#E67E22", letterSpacing: "0.04em" }}>
            CY
          </span>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: s.text, fontWeight: 700, color: textColor, letterSpacing: "0.04em" }}>
            MED
          </span>
        </div>
        <div style={{ fontSize: s.sub, fontWeight: 500, color: subColor, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>
          Healthcare ERP
        </div>
      </div>
    </div>
  );
}

export default CyMedLogo;
