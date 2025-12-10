export default function Logo({ size = 32 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 120 120"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="NomNom"
		>
			<circle cx="60" cy="60" r="56" fill="#059669" opacity="0.12" />
			<circle cx="60" cy="60" r="42" fill="#10b981" />
			<path
				d="M44 76c0-10 7.5-18 16.7-18 4.6 0 8.8 2.2 11.3 5.7 2.1 3 5.4 4.3 8 4.3 4.7 0 8-3.6 8-8.6 0-10.2-10-18.4-23-18.4-15 0-27 11.4-27 25.6C38 72.6 40.5 76 44 76z"
				fill="#ecfdf3"
			/>
			<path
				d="M50 66.5c0-5.9 4.8-10.7 10.7-10.7 2.9 0 5.6 1.2 7.5 3.1 1.4 1.5 3.3 2.3 5.3 2.3 4 0 7.2-3.3 7.2-7.3 0-7.2-7.3-13.1-16.3-13.1-10.8 0-19.6 8-19.6 17.8 0 3.9 1.1 7.7 3.2 8.7 1 .5 2-.1 1.9-0.8L50 66.5z"
				fill="#ffffff"
				opacity="0.9"
			/>
		</svg>
	);
}