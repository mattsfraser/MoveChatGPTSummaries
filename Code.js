/**
 * Move any Google Doc whose title contains "ChatGPT Summary"
 * into the target folder, removing it from other parents (true move).
 */

/**
 * Move any Google Doc whose title contains "ChatGPT Summary"
 * into the target folder, removing it from other parents (true move).
 */
function moveChatGPTSummaries() {
  const FOLDER_ID = '1cfT2p9GyexmIIFVwR4HmWpdaCzg2GYsX'; // Chat GPT Summaries folder
  const dest = DriveApp.getFolderById(FOLDER_ID);

  // Only look in My Drive (not Shared drives, not Shared with me)
  const myDrive = DriveApp.getRootFolder();
  const query = 'title contains "ChatGPT Summary" and not name contains "ChatGPT Sessions" and trashed = false';
  const files = myDrive.searchFiles(query);

  let moved = 0, skipped = 0;

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

    if (inTarget) { skipped++; continue; }

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
