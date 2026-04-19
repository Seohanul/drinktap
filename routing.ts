import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en', 'vi', 'th', 'lo'],
  defaultLocale: 'ko'
});
