import { Uint8ArrayToDataUri, dataUriToMimeType, dataUriToUint8Array, dataUriToBlob, blobToDataUri } from './datauri'

describe('datauri.spec', () => {
  it('should parse', async () => {
    const datauri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATmSURBVHgBxZdbbxNHFMdnZmcv3rW9dnBuDXYIIUBvCFqkoqq0oMJbK1VqK1WpRPvcT9BP0oc+VjUvPFSqWqjUIpBCgYeqkAYJmhKnhEtwbJzYXt92bj3rxCE0UWKHkPyllVa79sx/zvzmnD0YrdBHP0zHYnE5KhQ6jhF6HR6l0NZoJrhgzDST+MrZ9/fea73ArZsvL2eOS6XOwq2LXqQUmJH46+9O7f1p2cCZ3zIfIK05+fZJ4NHABB69mBmkRP2Mti7cbUkhVKxz9BrRiXpnuycPBKF3bR19RcDJ52iHpAB2gnZg9U8doBTdrAGbEnzQNWiwmXdKPq9yqVCnwosGOtKBiE7f7gnTQ3GTVite81lif5d1fa7Kruaq/O+yzzsZry0DB12THo6Z9FiPQwXn6Jdbd+X5Cb8xXVECwSYmKacnUt30s5diISPkqown+K+PymymysRGY+Mzl6ZKa72wNYRP90eNfRFdG7KJ9ue9Wfnj3ccsK6iQTlTqZkghvJTHgCbeaOBqsYDf6jL1o/0x+uZAgtSIri7Oev7NQoPnfSHbMpDQCflipMvaHzW0mw+y8vfpLL9R5DyYlJqWwoSg9aSkRLxexVbdI/scjb47mNCP7hnAk6WGODdTrs94/jNGVm0BYVW8kOdYRQaQaVjI6emXvY5SeZ+3BVlgULfDygyH5e6EpewwlYwxbT6fw0/yZYwsd/0IBOH0Kx4OsYo24mD6yct7aLI7jv+ar/HxeZ9fmfPYihLyjIKTkbQ07cPBmDECW3fj/mM5WaiI81NZTqIJodv2qgiuy8BISKMTj/PC9mvae/1h+kaqT9vlRtF4oc6vAfF3log/GDHo4bgFkNq0XCqiKzM5+Ue27M9jUx0b6tMmS4LnWUcMxIEBs8nA5XsFdptEfSk4qi3Mkz2mpCeTCXpkoEsL2bA3kAi47+OrmYfyWtZjmYriZtSVxNDREC8Zp5Ou8RwMmCiWSKhERZG8j6WT6JE5pfz0oypL/3MHJ21KdTAwVREChwFSa5eybbIcweHePuQsMVBeKAADRWAgitpjwK9o+4GBj19ZYqAADBSBgWyFPf2pbJa11r4+ZcAFBoxlBi5kcgxHumRnDBBgwNborbl5YdXL2on+CDDQCwy4qxg4EDXokZjVTFTl0sIyAwVkqEO7e8nDBhJwitplQAMGYssMXGoyEPEVJLVa8QkwoOhJyHprMjDn+VOeEiHXlVgHBgQwsLtjBirAAFtmIA4MdAcMYMhF3X3AgPTTszWWngQGINHo8J/pmhLKiTQZcEItBgjeBwyEI/rmGLBZVRsOKfrpq0NNBsYhD0ws+HxsTQaCvIBXMXD70Zwaz5X5hakcI9E4MOC0z0AgyRnyvRLZJevaiT5gYLDFQAMYqGyYBx4oQxpwOhbjtLbWNbBypYpxVC8XgQGhnUz16If7Y6sYuJ71/LueEJYblwQY2KhutAzcR518isOUDIoNKhdxMgx5ACryv3UipB1pq1j9XwGExY4MQAnWQ45CcM1K6QePNIcgDW1C0CPAR6maQJtUsNpOV/zsAGAAYzyGdkhwhtLEYiiNFrdhexWEn6Ix8u3p4SJUulG0zRJBf3h8eKa5gd+fOjAW9GposYt90SpC7RxNr2xOWzozNpWSvNmtBN1SCm1xew4neKwu0DfnIOqtF/8BnfHaFnTFayYAAAAASUVORK5CYII='
    expect(dataUriToUint8Array(datauri)?.length).toEqual(1361)
  })

  it('should create', () => {
    const bin = new Uint8Array([1, 2, 3])
    const uri = Uint8ArrayToDataUri(bin)
    expect(uri).toMatchInlineSnapshot('"data:application/octet-stream,AQID"')
    expect(dataUriToUint8Array(uri)).toEqual(bin)
    expect(dataUriToMimeType(uri)).toMatchInlineSnapshot('"application/octet-stream"')
  })

  it('should return undefined for invalid dataUri', () => {
    expect(dataUriToUint8Array('notadata')).toBeUndefined()
    expect(dataUriToMimeType('notadata')).toBeUndefined()
    expect(dataUriToBlob('notadata')).toBeUndefined()
  })

  it('should parse dataUri to Blob and back', async () => {
    const bin = new Uint8Array([1, 2, 3])
    const uri = Uint8ArrayToDataUri(bin, 'foo/bar')
    const blob = dataUriToBlob(uri)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob?.type).toBe('foo/bar')
    if (blob) {
      const uri2 = await blobToDataUri(blob)
      expect(uri2).toBe(uri)
    }
  })
})
