import { distributedFilePath } from './distributed'

describe('distributed.spec', () => {
  it('should distribute file names', async () => {
    expect(distributedFilePath(0)).toEqual(['1', '0'])
    expect(distributedFilePath(1)).toEqual(['1', '1'])
    expect(distributedFilePath(2)).toEqual(['1', '2'])
    expect(distributedFilePath(999)).toEqual(['1', '999'])
    expect(distributedFilePath(1000)).toEqual(['2', '1', '0'])
    expect(distributedFilePath(1001)).toEqual(['2', '1', '1'])
  })
})
