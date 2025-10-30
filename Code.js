/**
 * Script Name: MoveChatGPTSummaries
 * Description: Moves any Google Doc whose name contains "ChatGPT Summary"
 *               into the designated folder, removing it from all other parents (true move).
 * 
 * Author: Matt Fraser
 * Version: 1.0.0
 * Last Updated: 2025-10-30
 * 
 * Workflow:
 * - Searches My Drive for Google Docs matching “ChatGPT Summary”.
 * - Skips any file already inside the target “Chat GPT Summaries” folder.
 * - Moves qualifying files and removes them from all other parent folders.
 * 
 * Purpose:
 * Maintains Drive organization by auto-filing ChatGPT summaries into a
 * centralized reference folder for archival and retrieval.
 */

function moveChatGPTSummaries() {
  const FOLDER_ID = "1cfT2p9GyexmIIFVwR4HmWpdaCzg2GYsX"; // Chat GPT Summaries folder
  const dest = DriveApp.getFolderById(FOLDER_ID);

  // Only look in My Drive (not Shared drives, not Shared with me)
  const myDrive = DriveApp.getRootFolder();
  const query =
    'name contains "ChatGPT Summary" and not name contains "ChatGPT Sessions" and trashed = false';
  const files = myDrive.searchFiles(query);

  let moved = 0,
    skipped = 0;

  while (files.hasNext()) {
    const file = files.next();
    const parents = file.getParents();
    let inTarget = false;

    while (parents.hasNext()) {
      if (parents.next().getId() === FOLDER_ID) {
        inTarget = true;
        break;
      }
    }

    if (inTarget) {
      skipped++;
      continue;
    }

    dest.addFile(file);

    const allParents = file.getParents();
    while (allParents.hasNext()) {
      const p = allParents.next();
      if (p.getId() !== FOLDER_ID) p.removeFile(file);
    }
    moved++;
  }

  Logger.log(`Moved: ${moved} | Skipped: ${skipped}`);
}
