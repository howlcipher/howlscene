export const publishingOptions = [
  {
    name: "Cloudflare Pages",
    summary: "Upload your website ZIP from a web browser.",
    steps: [
      "Extract the website ZIP on your computer. Keep index.html, PUBLISH.txt, and the other files together.",
      "Sign in to Cloudflare and open Workers & Pages. Choose Create application, Get started, then Drag and drop your files.",
      "Upload the ZIP or extracted folder, then choose Deploy site and follow the Save and Deploy prompt if it appears.",
      "Open the address Cloudflare gives you. Check your text, images, links, and animation controls.",
    ],
    guideUrl:
      "https://developers.cloudflare.com/pages/get-started/direct-upload/",
    guideLabel: "Official Cloudflare upload guide",
  },
  {
    name: "GitHub Pages",
    summary: "Publish the files from a new GitHub repository.",
    steps: [
      "Create a new public repository with a README. Do not replace an existing website repository.",
      "Extract the website ZIP. In the repository, choose Add file, then Upload files. Upload the extracted contents so index.html is at the top level, keep the assets folder, and commit the files.",
      "Create an empty .nojekyll file at the top level and commit it.",
      "Open Settings, then Pages. Choose publishing from a branch, select the branch containing your files and its root folder, then save.",
      "Wait for GitHub to publish the site and open the address shown in Pages settings. Check your text, images, links, and animation controls.",
    ],
    guideUrl:
      "https://docs.github.com/en/pages/getting-started/creating-a-github-pages-site",
    guideLabel: "Official GitHub Pages creation guide",
    note: "GitHub Pages is not suitable for sites primarily facilitating commercial transactions or SaaS, and should not handle passwords or payment details.",
  },
] as const;

export function formatPublishingInstructions(): string {
  const lines = [
    "PUBLISH YOUR HOWLSCENE WEBSITE",
    "",
    "No code or build step is required. Keep all extracted files together and keep index.html at the top level. Opening the files with file:// is not supported; use a website host or an HTTP server.",
    "",
  ];

  for (const option of publishingOptions) {
    lines.push(option.name, option.summary, "");
    option.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    lines.push(`Official instructions: ${option.guideUrl}`);
    if ("note" in option) lines.push(option.note);
    lines.push("");
  }

  lines.push(
    "This ZIP is a published website, not an editable project backup. Keep the separate HowlScene project backup if you want to reopen your work in the editor.",
  );
  return lines.join("\n");
}
