/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                'theme-primary': '#4299E1',        // Light blue (e.g., for buttons, highlights)
                'theme-primary-hover': '#2B6CB0',  // Darker blue for hover states
                'theme-accent': '#50E3C2',         // Teal/turquoise accent
                'theme-background': '#FFFFFF',     // Main background (white)
                'theme-surface': '#F7FAFC',       // Slightly off-white for cards/surfaces
                'theme-text-primary': '#2D3748',   // Dark gray for primary text
                'theme-text-secondary': '#718096', // Medium gray for secondary text
                'theme-border': '#E2E8F0',        // Light gray for borders
                'orange': '#F59E0B',
                'pink': '#EC4899',
                'green': '#10B981',
                'purple': '#8B5CF6',
            },
        },
    },
	plugins: [],
};
