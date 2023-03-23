import { sleep } from "./exec"
import { duration } from "./time"

describe("time.spec", () => {
  it("should measure", async () => {
    const getDuration = duration()
    await sleep(50)
    expect(/\d+.\d\dms/.test(getDuration())).toBe(true) 
  })
})
