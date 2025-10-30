/**
 * Script Name: MoveSummaries
 * Description: Moves any Google Doc whose name contains "ChatGPT Summary"
 *              into the designated folder, removing it from all other parents.
 *
 * Author: Matt Fraser
 * Version: 2.0.1
 * Last Updated: 2025-10-30
 *
 * Notes:
 * - Uses the Advanced Drive Service (v3). Enable "Drive API" under Services.
 * - Performs a true move by updating file parents via Drive.Files.update().
 * - Safe DRY_RUN mode available for previewing actions before execution.
 */

const CONFIG = {
  FOLDER_ID: '1cfT2p9GyexmIIFVwR4HmWpdaCzg2GYsX', // Chat GPT Summaries folder
  DRY_RUN: false,                                  // Set true for preview mode
  PAGE_SIZE: 200,                                  // Up to 1000 is supported; 200 is safe
  QUERY:
    "mimeType = 'application/vnd.google-apps.document' " +
    "and name contains 'ChatGPT Summary' " +
    "and not name contains 'ChatGPT Sessions' " +
    "and trashed = false",
  FIELDS: 'files(id,name,parents,mimeType),nextPageToken',
};

/**
 * Main function: moves qualifying Google Docs into the target folder.
 * Removes all other parents to ensure a single, true move.
 */
function moveSummaries() {
  const destId = CONFIG.FOLDER_ID;
  let moved = 0, skipped = 0, errors = 0;
  let pageToken = null;

  do {
    const resp = Drive.Files.list({
      q: CONFIG.QUERY,
      corpora: 'user',
      pageSize: CONFIG.PAGE_SIZE,
      pageToken,
      fields: CONFIG.FIELDS,
      supportsAllDrives: false,
    });

    const files = resp.files || [];
    for (const file of files) {
      const parents = file.parents || [];
      const alreadyThere = parents.includes(destId);
      if (alreadyThere) { skipped++; continue; }

      try {
        if (CONFIG.DRY_RUN) {
          console.log(`[DRY RUN] Would move: ${file.name} (${file.id})`);
        } else {
          Drive.Files.update(
            {},
            file.id,
            null,
            {
              addParents: destId,
              removeParents: parents.join(','),
              fields: 'id,parents',
              supportsAllDrives: false,
            }
          );
          moved++;
        }
      } catch (err) {
        errors++;
        console.log(`ERROR moving ${file.name} (${file.id}): ${err && err.message ? err.message : err}`);
      }
    }

    pageToken = resp.nextPageToken || null;
  } while (pageToken);

  console.log(`Moved: ${moved} | Skipped: ${skipped} | Errors: ${errors}`);
}

/**
 * Safe preview function – runs with DRY_RUN enabled.
 */
function previewMoveSummaries() {
  const prev = CONFIG.DRY_RUN;
  CONFIG.DRY_RUN = true;
  try { moveSummaries(); }
  finally { CONFIG.DRY_RUN = prev; }
}
