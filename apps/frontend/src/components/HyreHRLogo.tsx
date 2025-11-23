interface LogoProps {
    className?: string;
    size?: number;
}

export default function HyreHRLogo({ className = '', size = 32 }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="hyrehr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>

            {/* Modern abstract logo - interconnected nodes representing talent network */}
            <g fill="url(#hyrehr-gradient)">
                {/* Top node - represents talent */}
                <circle cx="50" cy="20" r="8" />

                {/* Left node */}
                <circle cx="25" cy="50" r="8" />

                {/* Right node */}
                <circle cx="75" cy="50" r="8" />

                {/* Bottom node */}
                <circle cx="50" cy="80" r="8" />

                {/* Center hub - larger */}
                <circle cx="50" cy="50" r="12" />

                {/* Connecting lines */}
                <line x1="50" y1="28" x2="50" y2="38" stroke="url(#hyrehr-gradient)" strokeWidth="3" strokeLinecap="round" />
                <line x1="33" y1="50" x2="38" y2="50" stroke="url(#hyrehr-gradient)" strokeWidth="3" strokeLinecap="round" />
                <line x1="62" y1="50" x2="67" y2="50" stroke="url(#hyrehr-gradient)" strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="62" x2="50" y2="72" stroke="url(#hyrehr-gradient)" strokeWidth="3" strokeLinecap="round" />
            </g>
        </svg>
    );
}
