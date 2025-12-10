export default function Logo({ size = 32 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
            <stop
              offset="100%"
              style={{ stopColor: '#a5b4fc', stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.5C29.33 87.5 12.5 70.67 12.5 50S29.33 12.5 50 12.5 87.5 29.33 87.5 50 70.67 87.5 50 87.5z"
          fill="url(#logoGradient)"
        />
        <path
          d="M50 27.5c-12.4 0-22.5 10.1-22.5 22.5S37.6 72.5 50 72.5s22.5-10.1 22.5-22.5-10.1-22.5-22.5-22.5zm0 37.5c-8.27 0-15-6.73-15-15s6.73-15 15-15 15 6.73 15 15-6.73 15-15 15z"
          fill="white"
        />
      </svg>
    );
  }