# Try the HowlScene development preview

HowlScene is under active development. The controls below are implemented and the complete workflow is exercised in browser tests. Human usability review remains open. Keep a separate copy of important work.

## Open and customize a project

A verified public editor address is not available yet. Open the local address provided by the person running the editor. Developers can follow the project README.

1. Open the editor and optionally open **Getting started** for guidance.
2. Choose a personal portfolio starter under **Start from a template**. Replacing the current project asks for confirmation.
3. Pick Ink Wash, Cyberpunk, or Modern Professional under **Visual theme**.
4. Change **Website title** to your name and edit the description.
5. Use **Background color**, **Text color**, and **Accent color** to adjust the site's colors. If a color combination is hard to read, HowlScene displays a higher-contrast color and explains why.
6. Select the introduction section, edit its heading, and use the rich-text controls for paragraphs, headings, bold, italic, links, or lists.
7. Choose **Change section image**, upload a PNG/JPEG/WebP, and describe it with alt text.
8. Choose Projects under **New section type** and select **Add a section**. Edit its content with the available controls.
9. Move sections up or down, choose layouts, and set **Choose animation style**. Undo and Redo restore supported committed edits.
10. Switch themes and check your text remains intact. Set **Preview size** to Phone, Tablet, or Desktop.
11. Check the save message, then select **Save project backup** to keep an editable copy outside this browser.
12. Select **Download my website** to download the separate published website ZIP.
13. Follow [the publishing guide](publishing.md), then visit the hosted site and check text, images, navigation, and disabling animation.

The three themes include original layered scenery and optional motion. Phone-width browser tests and visual comparisons check representative layouts; they do not guarantee every layout on every real device.

## Save and reopen your work

Watch the save message. Drafts are saved in this browser when storage is available. They are not saved to a cloud account. Clearing browser data can delete them.

Select **Save project backup** to download an editable project file. Keep it somewhere safe. Use **Open project backup** to reopen it; replacing your current project requires confirmation. A backup includes supported uploaded images. Import validation and asynchronous save behavior are active verification areas, so keep your original backup until you have checked the restored project.

If local saving fails, leave the tab open and download a backup. A previous successful save does not mean your latest changes are safe; check the current message.

## Download and publish the website

Select **Download my website** to create the published website ZIP. This is different from an editable project backup. Extract it using your computer's archive tool. Upload all extracted files together to a static website host, keeping `index.html` at the top of the folder you publish. You do not need a development build step for the downloaded website.

Use [the publishing guide](publishing.md) for a browser upload workflow and a separate GitHub Pages workflow. Hosting has its own account requirements, terms, and limits. HowlScene does not automatically publish your website.

Visit the hosted address and check text, images, links, and navigation. Essential content should remain available without JavaScript or animation. Opening the files directly on your computer is not the supported verification method; use a host serving HTTP or HTTPS.

## Troubleshooting

| Problem                                          | What to do                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Saving failed or the draft could not be restored | Keep the tab open, save a backup, and retain any older backups. Do not clear browser storage while recovering work.    |
| An image is rejected                             | Choose a valid PNG, JPEG, or WebP no larger than 5 MiB, at most 8192 pixels per side and 24 million pixels total.      |
| A backup cannot be opened                        | Keep your current project and original backup. Check that you selected an editable backup rather than a published ZIP. |
| The published page has missing styling or images | Upload every extracted file and preserve the folder structure and filenames.                                           |
| A control does not match the full product vision | This development preview has unfinished features. See the README and progress journal.                                 |

## Safe limits and motion

You can have up to 100 sections and 100 repeated entries per section. Images are limited to 20 per project and 5 MiB each, with at most 8192 pixels per side and 24 million pixels. The serialized asset collection is limited to about 28 MB including base64 encoding, so the practical original-image total is smaller. Backups have a 30 MiB limit. SVG files are not accepted.

Links must use `https://`, a simple `mailto:` email address, or a section anchor such as `#intro`. The site honors your device's reduced-motion setting. Enhanced exported sites also provide a manual animation-disable control. Disabling effects must leave text and navigation usable. The editor has no cloud account or tracking service; see [privacy details](../architecture/privacy.md).
