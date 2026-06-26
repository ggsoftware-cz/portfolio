// Showcase projects. Copy (name, tagline, descriptions, results) lives in
// messages/{cs,en}.json under the `work.items.<slug>` namespace so it stays
// translatable. Non-translatable data (tech tags, links, visuals) lives here.
//
// Screenshots: each project renders an on-brand <ProjectMockup> placeholder by
// default. To use real screenshots, drop images in /public/work/<slug>/ and set
// `cover` + `screenshots` to their paths — the components will use them instead.

export type ProjectVariant = "dashboard" | "landing" | "app";

export type Project = {
  slug: string;
  /** Live site, if public. Empty hides the "visit" button. */
  url: string;
  year: string;
  /** Drives the mockup layout + section accent. */
  variant: ProjectVariant;
  /** Tech stack / category chips — not translated. */
  tags: string[];
  /** Optional real cover screenshot (e.g. "/work/stockflow/cover.png"). */
  cover?: string;
  /** Optional real gallery screenshots. */
  screenshots?: string[];
};

export const projects: Project[] = [
  {
    slug: "wokmoto",
    url: "https://wokmoto.ggsoftware.cz",
    year: "2026",
    variant: "app",
    tags: ["Next.js", "Tailwind CSS", "TypeScript"],
    cover: "/work/wokmoto/cover.png",
    screenshots: ["/work/wokmoto/desktop2.png", "/work/wokmoto/mobile.png"],
  },
  {
    slug: "vireo",
    url: "https://vireo.ggsoftware.cz",
    year: "2026",
    variant: "app",
    tags: ["Next.js", "Tailwind CSS", "TypeScript"],
    cover: "/work/vireo/cover.png",
    screenshots: ["/work/vireo/desktop2.png", "/work/vireo/mobile.png"],
  },
  {
    slug: "samolep",
    url: "https://www.samolep.cz",
    year: "2025",
    variant: "app",
    tags: ["React", "RestAPI", "ASP.NET Core"],
    cover: "/work/samolep/cover.png",
    screenshots: ["/work/samolep/desktop2.png", "/work/samolep/mobile.png"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
