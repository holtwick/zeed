/* eslint-disable prefer-spread */

import { useBase } from './data/basex'
import { sleep } from './exec/promise'
import { suid, suidBytesDate, suidDate, uname, uuid, uuid32bit, uuidB32, uuidBytes, uuidDecode, uuidDecodeB32, uuidDecodeV4, uuidEncode, uuidEncodeB32, uuidEncodeV4, uuidv4 } from './uuid'

describe('uuid', () => {
  // beforeAll(() => setUuidDefaultEncoding('base32'))

  it('should not certain length', () => {
    expect(uuid().length).toBe(22)
    expect(uuidB32().length).toBe(26)
  })

  it('should encode/decode', () => {
    const us = uuid()
    const ub = uuidDecode(us)
    expect(ub.length).toBe(16)
    expect(uuidEncode(ub)).toEqual(us)
  })

  it('should not have collisions', () => {
    const list = Array.apply(null, Array.from({ length: 100 })).map(uuid)
    while (list.length) {
      const id = list.pop()
      expect(id?.length).toBe(22)
      expect(list).not.toContain(id)
    }
  })

  it('should not have collisions v4', () => {
    const list = Array.apply(null, Array.from({ length: 100 })).map(uuidv4)
    while (list.length) {
      const id = list.pop()
      expect(id?.length).toBe(36)
      expect(list).not.toContain(id)
    }
  })

  it('should have nice uname', () => {
    expect(uname()).toBe('id-0')
    expect(uname()).toBe('id-1')
    expect(uname('me')).toBe('me-0')
    expect(uname()).toBe('id-2')
  })

  it('should create sortable ID', () => {
    // Create a suid
    const sample = suid()
    expect(sample).toHaveLength('000FcTTJiOtjzrDGJVhfoa'.length) // === 22

    // Extract the date from the suid
    const dateSuid = new Uint8Array([
      0,
      0,
      141,
      33,
      250,
      205,
      174,
      58,
      31,
      221,
      187,
      156,
      31,
      221,
      187,
      156,
    ])
    expect(suidBytesDate(dateSuid)).toEqual(
      new Date('2020-10-10T22:10:14.349Z'),
    )

    //
    const { encode, decode } = useBase(62)

    expect(encode(dateSuid, 22)).toBe('000FcTTJiOtjzrDGJVhfoa')
    expect(decode('000FcTTJiOtjzrDGJVhfoa', 16)).toEqual(dateSuid)

    expect(decode('000FcTTJiOtjzrDGJVhfoa', 16)).toEqual(
      new Uint8Array([
        0,
        0,
        141,
        33,
        250,
        205,
        174,
        58,
        31,
        221,
        187,
        156,
        31,
        221,
        187,
        156,
      ]),
    )

    expect(suidDate('000FcTTJiOtjzrDGJVhfoa')).toEqual(
      new Date('2020-10-10T22:10:14.349Z'),
    )
  })

  it('should sort correctly', async () => {
    // 0 < a < B
    expect('abc' < 'ABC').toBe(false)
    expect('abc' > 'ABC').toBe(true)
    expect('0' < 'A').toBe(true)
    expect('0' < 'a').toBe(true)
    expect('0' > 'A').toBe(false)
    expect('0' > 'a').toBe(false)

    const sample = [
      '012a',
      '0123B',
      '0123c',
      'aBC',
      'Abc',
      'abC',
      'aa',
      'aZ',
      'ay',
      'aB',
      '002ITJose',
      '002ITJoCh',
      '002ITJoch',
      '002ITJoSE',
    ]
    sample.sort()
    expect(sample).toEqual([
      '002ITJoCh',
      '002ITJoSE',
      '002ITJoch',
      '002ITJose',
      '0123B',
      '0123c',
      '012a',
      'Abc',
      'aB',
      'aBC',
      'aZ',
      'aa',
      'abC',
      'ay',
    ])
  })

  it('should evaluate demo', async () => {
    expect.assertions(100)
    for (let i = 0; i < 100; i++) {
      const shortSortableId = suid()
      await sleep(2)
      const nextSUID = suid()
      expect(shortSortableId < nextSUID).toBe(true)
    }
  })

  it('should generate 32bit', () => {
    expect(uuid32bit()).not.toBe(0) // todo there is a little chance that this will fail
    expect(uuid32bit()).not.toBe(uuid32bit()) // todo there is a little chance that this will fail
    expect(Number.isSafeInteger(uuid32bit())).toBe(true)
  })

  it('should encode / decode 32', () => {
    const bytes = uuidBytes()
    const b32 = uuidEncodeB32(bytes)
    expect(b32).toHaveLength(26)
    expect(uuidDecodeB32(b32)).toEqual(bytes)
  })

  it('should encode / decode 62', () => {
    const bytes = uuidBytes()
    const b62 = uuidEncode(bytes)
    expect(b62).toHaveLength(22)
    expect(uuidDecode(b62)).toEqual(bytes)
  })

  it('should encode / decode 62 from string', () => {
    const id = uuid()
    expect(id).toHaveLength(22)
    const b62 = uuidDecode(id)
    expect(b62).toHaveLength(16)
    expect(uuidEncode(b62)).toEqual(id)
  })

  it('should encode / decode 62 by example', () => {
    const id = '78MQbFaILcblSYA7WS2OGE'
    expect(id).toHaveLength(22)
    const b62 = uuidDecode(id)
    expect(b62).toHaveLength(16)
    expect(b62).toMatchInlineSnapshot(`
      Uint8Array [
        234,
        109,
        230,
        115,
        91,
        247,
        195,
        211,
        119,
        255,
        157,
        220,
        65,
        184,
        26,
        190,
      ]
    `)
    expect(uuidEncode(b62)).toEqual('78MQbFaILcblSYA7WS2OGE')

    const uv4 = uuidEncodeV4(b62)
    expect(uv4).toEqual('ea6de673-5bf7-c3d3-77ff-9ddc41b81abe')
    expect(uuidDecodeV4(uv4)).toEqual(b62)
  })

  it('should generate a valid UUIDv4', () => {
    const uuid = uuidv4()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(uuid).toMatch(uuidRegex)
  })

  it('should encode Uint8Array to UUIDv4 format', () => {
    const bytes = new Uint8Array([234, 109, 230, 115, 91, 247, 195, 211, 119, 255, 157, 220, 65, 184, 26, 190])
    const encoded = uuidEncodeV4(bytes)
    expect(encoded).toEqual('ea6de673-5bf7-c3d3-77ff-9ddc41b81abe')
  })

  it('should decode UUIDv4 to Uint8Array', () => {
    const uuid = 'ea6de673-5bf7-c3d3-77ff-9ddc41b81abe'
    const decoded = uuidDecodeV4(uuid)
    expect(decoded).toEqual(new Uint8Array([234, 109, 230, 115, 91, 247, 195, 211, 119, 255, 157, 220, 65, 184, 26, 190]))
  })
})
