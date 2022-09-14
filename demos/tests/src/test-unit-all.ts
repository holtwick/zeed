export {}

async function handleCandidates(candidates: Record<string, Function>) {
  console.log("candidates", Object.keys(candidates))
  for (let [name, fn] of Object.entries(candidates)) {
    console.log("MODULE", name)
    // @ts-ignore
    window.testUrl = name
    await fn()
  }
}

console.log("load all browser")

{
  let candidates = import.meta.glob("../../../src/browser/*.spec.*")
  handleCandidates(candidates)
}

{
  let candidates = import.meta.glob("../../../src/common/*.spec.*")
  handleCandidates(candidates)
}

{
  let candidates = import.meta.glob("../../../src/common/**/*.spec.*")
  handleCandidates(candidates)
}
