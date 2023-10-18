import { formatMilliseconds } from "../time"
import { formatBytesToHuman, formatSecondsToTime } from "./format"

describe("format.spec", () => {
  it("should format bytes", async () => {
    expect(formatBytesToHuman(123)).toMatchInlineSnapshot('"123 bytes"')
    expect(formatBytesToHuman(16*1024)).toMatchInlineSnapshot('"16.00 KiB"')
    expect(formatBytesToHuman(16*1024*1024)).toMatchInlineSnapshot('"16.00 MiB"')
    expect(formatBytesToHuman(16*1024 + 123)).toMatchInlineSnapshot('"16.12 KiB"')
    expect(formatBytesToHuman(16*1024 + 123, 0)).toMatchInlineSnapshot('"16 KiB"')
    expect(formatBytesToHuman(-123)).toMatchInlineSnapshot('"0 bytes"')
    expect(formatBytesToHuman(0)).toMatchInlineSnapshot('"0 bytes"')
  })

  it("should format time", async () => {
    expect(formatSecondsToTime(0)).toMatchInlineSnapshot('"0:00"')
    expect(formatSecondsToTime(-123)).toMatchInlineSnapshot('"-2:03"')
    expect(formatSecondsToTime(123)).toMatchInlineSnapshot('"2:03"')
    expect(formatSecondsToTime(60*60*12)).toMatchInlineSnapshot('"12:00:00"')
    expect(formatSecondsToTime(60*60*12, '.')).toMatchInlineSnapshot('"12.00.00"')
    expect(formatSecondsToTime(60*60*1000)).toMatchInlineSnapshot('"1000:00:00"')
  })
})