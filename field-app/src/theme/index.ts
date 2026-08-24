export const theme = {
  colors: {
    // Brand & UI
    primary: '#0B2341',       // Navy blue for headers, main buttons
    secondary: '#1A497A',     // Lighter blue for active states
    background: '#F4F6F8',    // Very light grey for app background
    surface: '#FFFFFF',       // Card/Panel background
    text: '#1C2530',          // Primary dark text
    textMuted: '#687787',     // Secondary text
    border: '#E1E5EB',        // Dividers and borders
    
    // Status
    warning: '#F59E0B',       // Amber/Orange for pending states, warnings
    critical: '#DC2626',      // Red for critical, failed sync, errors
    success: '#10B981',       // Green for resolved, synced
    info: '#3B82F6',          // Blue for general information
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: 'normal' as const },
    caption: { fontSize: 12, fontWeight: 'normal' as const },
    button: { fontSize: 16, fontWeight: '600' as const },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    round: 9999,
  }
};
