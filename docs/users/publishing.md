# Publish your downloaded website

Your website ZIP is already built. You do not need React, npm, or a terminal to publish it. Keep your editable project backup separately; publish the website files, not the backup containing your editing data. Hosting requires a separate provider account and agreement to that provider's current terms. HowlScene does not automatically publish or buy a domain.

## Cloudflare Pages upload

1. Download your website ZIP from HowlScene and extract it. Check that the extracted folder contains `index.html` and the accompanying files.
2. Sign in to Cloudflare and open **Workers & Pages**.
3. Choose **Create application**, then **Get started**, then **Drag and drop your files**.
4. Name the project and upload the website ZIP or its extracted folder. Choose **Deploy site**, then follow **Save and Deploy** if shown.
5. Open the address Cloudflare provides. Check images, section links, text, and animation controls. Keep all files together when uploading a replacement version.

Cloudflare's dashboard upload accepts a ZIP or folder, with a 1,000-file limit and 25 MiB maximum per file. A Direct Upload project cannot later switch to Git integration; that requires a new project. These details were checked against [Cloudflare's official Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/). Dashboard wording and plan limits can change.

## GitHub Pages without a local terminal

A repository is a folder of files stored on GitHub. Use a new repository for this website; do not replace an existing website repository.

1. Create a GitHub account if needed, then create a new public repository with a README.
2. Extract the website ZIP on your computer. In the repository, choose **Add file → Upload files**. Upload the extracted contents, keeping `index.html` at the top level and preserving `assets/` when present. Save the upload with **Commit changes**.
3. Use **Add file → Create new file** to create an empty `.nojekyll` file at the same top level, then commit it.
4. Open **Settings → Pages**, select publishing from a branch, choose the branch containing the files and its root folder, then save.
5. Wait for deployment and use **Visit site** in Pages settings. Test at the address GitHub actually provides, including its repository path. Do not assume an address from a repository name alone.

GitHub requires the entry file at the publishing source's top level; `.nojekyll` disables the default Jekyll processing for branch publication. See [GitHub's official site creation guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

GitHub Pages is unsuitable for sites primarily facilitating commercial transactions or commercial SaaS, and should not handle passwords or payment details. Published sites have a 1 GB maximum and other service limits. Choose another suitable host for uses outside its terms. See [the current GitHub Pages restrictions](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Check before sharing

Visit the actual hosted address on a phone and computer. Follow every link, inspect image descriptions, and disable animation. Verify important text with JavaScript disabled. If styling or images are absent, check that every extracted file was uploaded with its original relative folder structure. Direct `file://` opening is not the supported deployment test.
