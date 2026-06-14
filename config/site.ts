export type TeamMember = { name: string; role: string; photo: string };

export type SiteConfig = {
  name: string;
  alternateNames: string[];
  url: string;
  email: string;
  phone: string;
  copyrightStartYear: number;
  googleSiteVerification: string;
  legal: { companyName: string; ico: string; dic: string; address: string };
  social: { linkedin: string; github: string; instagram: string };
  team: TeamMember[];
  plausibleDomain: string;
};

export const siteConfig: SiteConfig = {
  name: "GG Software",
  // Brand variants people actually type into search — fed to structured data
  // so Google links these queries to this site.
  alternateNames: [
    "GGSoftware",
    "GG Software CZ",
    "ggsoftware.cz",
    "ggsoftware",
  ],
  url: "https://ggsoftware.cz",
  email: "ggsoftware.cz@gmail.com",
  // TODO: add a public phone number (e.g. "+420 777 123 456"), or leave empty to hide it.
  phone: "",
  copyrightStartYear: 2026,
  // Paste the code from Google Search Console → Settings → Ownership
  // verification → "HTML tag" (just the content="..." value). Leave empty to omit.
  googleSiteVerification: "fNgWlsetCF-he9ep9kzSzA7FwC67wZNm3_KnD7vtmgA",
  // TODO: fill in your real Czech business identity. Shown in the footer and the
  // privacy policy. Leave a field empty to hide it.
  legal: {
    companyName: "", // e.g. "Jan Novák" or "GG Software s.r.o."
    ico: "", // IČO
    dic: "", // DIČ (leave empty if you are not a VAT payer)
    address: "", // registered address
  },
  // TODO: paste your profile URLs. Empty links are hidden automatically.
  social: {
    linkedin: "",
    github: "",
    instagram: "",
  },
  // TODO: replace with your real team. `photo` is an optional image path in
  // /public (e.g. "/team/jan.jpg"); leave empty to show initials instead.
  team: [
    {
      name: "Martin Holý",
      role: "Full-stack Developer & UX/UI Designer",
      photo: "",
    },
    { name: "Jakub Šajer", role: "Full-stack Developer", photo: "" },
  ],
  // TODO: set to your bare domain (e.g. "ggsoftware.cz") to enable privacy-friendly
  // Plausible analytics. Leave empty to disable analytics entirely.
  plausibleDomain: "",
};
