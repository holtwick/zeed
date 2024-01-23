import { formatBytesToHumanBase1000, formatBytesToHumanBase1024, formatSecondsToTime } from './format'

describe('format.spec', () => {
  it('should format bytes in 1024 steps', async () => {
    expect(formatBytesToHumanBase1024(123)).toMatchInlineSnapshot('"123 bytes"')
    expect(formatBytesToHumanBase1024(16 * 1024)).toMatchInlineSnapshot('"16.00 KiB"')
    expect(formatBytesToHumanBase1024(16 * 1024 * 1024)).toMatchInlineSnapshot('"16.00 MiB"')
    expect(formatBytesToHumanBase1024(16 * 1024 + 123)).toMatchInlineSnapshot('"16.12 KiB"')
    expect(formatBytesToHumanBase1024(16 * 1024 + 123, 0)).toMatchInlineSnapshot('"16 KiB"')
    expect(formatBytesToHumanBase1024(-123)).toMatchInlineSnapshot('"0 bytes"')
    expect(formatBytesToHumanBase1024(0)).toMatchInlineSnapshot('"0 bytes"')
  })

  it('should format bytes in 1000 steps', async () => {
    expect(formatBytesToHumanBase1000(123)).toMatchInlineSnapshot('"123 bytes"')
    expect(formatBytesToHumanBase1000(16 * 1000)).toMatchInlineSnapshot(`"16.00 KB"`)
    expect(formatBytesToHumanBase1000(16 * 1024 * 1024)).toMatchInlineSnapshot(`"16.78 MB"`)
    expect(formatBytesToHumanBase1000(16 * 1024 + 123)).toMatchInlineSnapshot(`"16.51 KB"`)
    expect(formatBytesToHumanBase1000(16 * 1024 + 123, 0)).toMatchInlineSnapshot(`"17 KB"`)
    expect(formatBytesToHumanBase1000(-123)).toMatchInlineSnapshot('"0 bytes"')
    expect(formatBytesToHumanBase1000(0)).toMatchInlineSnapshot('"0 bytes"')
  })

  it('should format time', async () => {
    expect(formatSecondsToTime(0)).toMatchInlineSnapshot('"0:00"')
    expect(formatSecondsToTime(-123)).toMatchInlineSnapshot('"-2:03"')
    expect(formatSecondsToTime(123)).toMatchInlineSnapshot('"2:03"')
    expect(formatSecondsToTime(60 * 60 * 12)).toMatchInlineSnapshot('"12:00:00"')
    expect(formatSecondsToTime(60 * 60 * 12, '.')).toMatchInlineSnapshot('"12.00.00"')
    expect(formatSecondsToTime(60 * 60 * 1000)).toMatchInlineSnapshot('"1000:00:00"')
  })
})
