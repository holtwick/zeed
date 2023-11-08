import { toValidFilename } from './path'

describe('path.spec', () => {
  it('should fix filenames', async () => {
    const samples = [
      'prn',
      'a/b/c/d.txt',
      'a\\b\\c\\d.txt',
      'trailing...',
      '...leading',
      'illegal start \\/:*?"<>| end',
      'crazy \t white \n space \0 nil',
      'fancy 👨‍👩‍👧‍👦 family ⇒ ∅ ❌ 😂.txt',
    ]
    expect(samples.map(s => toValidFilename(s, ' '))).toMatchInlineSnapshot(`
      Array [
        "prn ",
        "a b c d.txt",
        "a b c d.txt",
        "trailing",
        "leading",
        "illegal start end",
        "crazy white space nil",
        "fancy 👨‍👩‍👧‍👦 family ⇒ ∅ ❌ 😂.txt",
      ]
    `)
  })
})
