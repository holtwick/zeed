/**
 * Distribute file, named by natural numbers, in a way that each folder only
 * contains `maxEntriesPerFolder` subfolders or files. Returns a list of
 * names, where the last one is the file name, all others are folder names.
 *
 * Example: `distributedFilePath(1003)` results in `['2', '1', '3']` which
 * could be translated to the file path `2/1/3.json`.
 */
export function distributedFilePath(index: number, maxEntriesPerFolder: number = 1000): string[] {
  if (index < 0)
    throw new Error('Only numbers >= 0 supported')
  const names: string[] = []
  do {
    names.unshift((index % maxEntriesPerFolder).toString())
    index = Math.floor(index / maxEntriesPerFolder)
  } while (index > 0)
  names.unshift(names.length.toString())
  return names
}
