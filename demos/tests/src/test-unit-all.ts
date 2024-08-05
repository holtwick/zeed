/// <reference types="vite/client" />
/* eslint-disable no-console */

export {}

async function handleCandidates(candidates: Record<string, any>) {
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
  void handleCandidates(candidates)
}

{
  const candidates = import.meta.glob('../../../src/common/*.spec.*')
  void handleCandidates(candidates)
}

{
  const candidates = import.meta.glob('../../../src/common/**/*.spec.*')
  void handleCandidates(candidates)
}
