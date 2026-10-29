import { parseSite } from "../../packages/core/src/index";
export const originalPortfolioUrl =
  "https://howlcipher.github.io/william_elias/";
/** Facts checked against the owner's public portfolio source, 2026-10-28. */
export const williamSite = parseSite({
  schemaVersion: 1,
  title: "William Elias",
  description:
    "Software and automation engineering: developer tools, secure workflows, and production systems.",
  theme: "ink",
  motion: "cinematic",
  sections: [
    {
      id: "introduction",
      type: "hero",
      heading: "William Elias",
      body: "Software & Automation Engineer\nDeveloper tools. Secure workflows. Software built to run in the real world.",
    },
    {
      id: "about",
      type: "about",
      heading: "From manual work to maintainable software",
      body: "William builds internal applications, APIs, developer tooling, and automation with Python, Go, and C#/.NET. His background in production operations and infrastructure informs his approach to reliability, delivery, and security.",
    },
    {
      id: "work",
      type: "experience",
      heading: "Professional work",
      layout: "timeline",
      body: "Stellantis Financial Services US — Senior Production Support Engineer. Work includes a Go deployment CLI, a .NET 8 Blazor internal application, Python/FastAPI operations tooling, credential remediation, and Azure DevOps delivery automation.\nEarlier experience includes DevOps engineering and Python automation at HBK, with network and infrastructure roles dating to 2015.",
    },
    {
      id: "projects",
      type: "projects",
      heading: "Independent projects",
      layout: "cards",
      richText: [
        {
          type: "paragraph",
          spans: [
            {
              text: "These personal projects are not employer production systems. They were developed outside employment with AI coding assistants under William’s direction and review.",
            },
          ],
        },
        {
          type: "list",
          ordered: false,
          items: [
            [
              {
                text: "HowlPlane",
                href: "https://github.com/howlcipher/howlplane",
                bold: true,
              },
              {
                text: " — a Python/Go control plane for routing engineering work, reconciling reviews, and running verification.",
              },
            ],
            [
              {
                text: "Password Arena",
                href: "https://github.com/howlcipher/password_arena",
                bold: true,
              },
              {
                text: " — a synthetic-only password-strength simulation with bounded experiments and reproducible test modes.",
              },
            ],
            [
              {
                text: "Baseball Optimizer",
                href: "https://github.com/howlcipher/baseball_optimizer",
                bold: true,
              },
              { text: " — a baseball project with a Rust/Axum REST API." },
            ],
          ],
        },
      ],
    },
    {
      id: "skills",
      type: "skills",
      heading: "Tools with a purpose",
      body: "Python · Go · C#/.NET · FastAPI · Blazor · REST APIs\nAzure DevOps · CI/CD · PowerShell · Git\nCredential remediation · Access policies · Audit history\nProduction diagnostics · Application Insights · KQL",
    },
    {
      id: "connect",
      type: "contact",
      heading: "Explore the original work",
      richText: [
        {
          type: "paragraph",
          spans: [
            {
              text: "This is an alternate HowlScene presentation. The original portfolio remains the authoritative source for current professional information.",
            },
          ],
        },
        {
          type: "list",
          ordered: false,
          items: [
            [
              {
                text: "Original William Elias portfolio",
                href: originalPortfolioUrl,
              },
            ],
            [{ text: "GitHub", href: "https://github.com/howlcipher" }],
            [{ text: "LinkedIn", href: "https://linkedin.com/in/wylelias" }],
          ],
        },
      ],
    },
  ],
});
