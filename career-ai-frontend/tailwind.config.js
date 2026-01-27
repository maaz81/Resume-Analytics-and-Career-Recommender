/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use 'class' strategy for dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx,vue,html}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (upper palette)
        brand: {
          primary: "#3F76FF",      // Bright, professional blue
          secondary: "#1E293B",    // Deep slate for text/headers
          accent: "#FF8C42",       // Warm accent for calls-to-action
          info: "#6DCCFF",         // Light info blue
        },
        // Status colors
        status: {
          success: {
            DEFAULT: "#16A34A",
            light: "#ECFDF5",
            dark: "#14532D",
          },
          warning: {
            DEFAULT: "#F5A524",
            light: "#FFF7E6",
            dark: "#B45308",
          },
          error: {
            DEFAULT: "#EF4444",
            light: "#FEF2F2",
            dark: "#991C1C",
          },
          info: {
            DEFAULT: "#3B82F6",
            light: "#EFF6FF",
            dark: "#1E3A8A",
          },
        },
        // Surface / background system
        surface: {
          default: "#FFFFFF",
          background: "#F8FAFB",
          alt: "#F0F4F9",
          dark: "#0D162D",
          card: "#FFFFFF",
          cardDark: "#1E293B",
        },
        // Text system
        text: {
          primary: "#1E293B",
          secondary: "#4C5F7A",
          muted: "#98A4B7",
          inverse: "#F8FAFB",
        },
        // Border system
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
          dark: "#334155",
          focus: "#3F76FF", // matches brand.primary
        },
        // Disabled state
        disabled: {
          bg: "#F1F5F9",
          text: "#CBD5E1",
          border: "#E2E8F0",
        },
      },
      // Elevation / shadows
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.15)",
        xl: "0 20px 25px rgba(0,0,0,0.2)",
        'inner-md': "inset 0 4px 6px rgba(0,0,0,0.05)",
        'focus': "0 0 0 3px rgba(63, 118, 255, 0.1)", // Focus ring shadow
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular'],
      },
      // Font sizes with line heights
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Border radius for smooth UI
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      // Spacing scale for consistent paddings/margins
      spacing: {
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '7.5': '30px',
      },
      // Z-index scale for layer management
      zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modal: 1040,
        popover: 1050,
        tooltip: 1060,
      },
      // Transition timing for smooth UI interactions
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      // Animation keyframes
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        slideInUp: 'slideInUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-in',
        fadeOut: 'fadeOut 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        spin: 'spin 1s linear infinite',
        bounce: 'bounce 1s infinite',
      },
      // Typography plugin customization
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.primary'),
            maxWidth: 'none',
            a: {
              color: theme('colors.brand.primary'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            strong: {
              color: theme('colors.text.primary'),
              fontWeight: '600',
            },
            code: {
              color: theme('colors.brand.accent'),
              backgroundColor: theme('colors.surface.alt'),
              padding: '0.25rem 0.375rem',
              borderRadius: theme('borderRadius.sm'),
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.surface.cardDark'),
              color: theme('colors.text.inverse'),
            },
            h1: {
              color: theme('colors.text.primary'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.text.primary'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.text.primary'),
              fontWeight: '600',
            },
            ul: {
              listStyleType: 'disc',
            },
            ol: {
              listStyleType: 'decimal',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Better default form styling
    require('@tailwindcss/typography'), // Prose for readable text content
    require('@tailwindcss/aspect-ratio'), // Useful for media/content layouts
  ],
};