export const siteConfig = {
  name: 'GG Software',
  email: 'ggsoftware.cz@gmail.com',
  copyrightStartYear: 2025,
  social: {
    linkedin: '',
    github: ''
  }
} as const;

export type SiteConfig = typeof siteConfig;
