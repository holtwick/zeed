/* eslint-disable no-console */

export {}

async function handleCandidates(candidates: Record<string, Function>) {
  console.log('candidates', Object.keys(candidates))
  for (const [name, fn] of Object.entries(candidates)) {
    console.log('MODULE', name)
    // @ts-expect-error xxx
    window.testUrl = name
    await fn()
  }
}

console.log('load all browser')

{
  const candidates = import.meta.glob('../../../src/browser/*.spec.*')
  handleCandidates(candidates)
}

{
  const candidates = import.meta.glob('../../../src/common/*.spec.*')
  handleCandidates(candidates)
}

{
  const candidates = import.meta.glob('../../../src/common/**/*.spec.*')
  handleCandidates(candidates)
}
