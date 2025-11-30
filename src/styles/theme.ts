import { THEME } from '../config/constants';

export const media = {
  mobile: `@media (max-width: ${THEME.breakpoints.mobile})`,
  tablet: `@media (max-width: ${THEME.breakpoints.tablet})`,
  desktop: `@media (max-width: ${THEME.breakpoints.desktop})`,
} as const;