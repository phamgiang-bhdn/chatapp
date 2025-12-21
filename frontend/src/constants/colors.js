export const colors = {
  primary: {
    main: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
  },
  
  secondary: {
    main: '#EC4899',
    light: '#F472B6',
    dark: '#DB2777',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  },
  
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
    hover: '#F1F5F9',
    input: '#F8FAFC',
  },
  
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  
  success: {
    main: '#10B981',
    light: '#34D399',
    bg: '#D1FAE5',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    bg: '#FEE2E2',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    bg: '#FEF3C7',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    bg: '#DBEAFE',
  },
  
  border: {
    light: '#E2E8F0',
    main: '#CBD5E1',
    dark: '#94A3B8',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
    primaryAlt: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    secondary: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    blue: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    warm: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    primary: '0 10px 40px -10px rgba(99, 102, 241, 0.4)',
    secondary: '0 10px 40px -10px rgba(236, 72, 153, 0.4)',
  },
};

export const avatarGradients = [
  'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
  'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
];

export const getAvatarGradient = (userId) => {
  if (!userId) return avatarGradients[0];
  return avatarGradients[userId % avatarGradients.length];
};
