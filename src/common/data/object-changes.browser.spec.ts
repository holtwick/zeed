import { cloneObject } from 'zeed'
import { objectAssignDeepInPlace, objectDescribeChange } from './object-changes'

describe('crdt-transfer.spec', () => {
  it('should transfer', async () => {
    const left = {
      a: 1,
      b: 2,
      d: {
        x: 11,
        y: 22,
      },
      f: undefined,
    }
    const right = {
      a: 1,
      b: undefined, // b deleted
      c: { // c added
        m: 11,
        n: 22,
        o: {
          t: 333,
        },
      },
      d: {
        // x deleted
        y: 22,
        z: 33,
      },
      e: 5, // e new
      f: null, // f ignored
    }

    // Change

    const change = objectDescribeChange(left, right)
    expect(change).toMatchInlineSnapshot(`
      Object {
        "b": null,
        "c": Object {
          "m": 11,
          "n": 22,
          "o": Object {
            "t": 333,
          },
        },
        "d": Object {
          "x": null,
          "z": 33,
        },
        "e": 5,
      }
    `)

    const changeBack = objectDescribeChange(right, left)
    expect(changeBack).toMatchInlineSnapshot(`
      Object {
        "b": 2,
        "c": null,
        "d": Object {
          "x": 11,
          "z": null,
        },
        "e": null,
      }
    `)

    // Assign

    const newRight = cloneObject(right)
    objectAssignDeepInPlace(newRight, left)
    expect(newRight).toEqual(left)

    const newLeft = cloneObject(left)
    objectAssignDeepInPlace(newLeft, right)
    expect(newLeft).toEqual(right)
  })

  it('should realword', () => {
    const left = {
      _id: '28fb8y8wyg9v1zjjf82f0ag3wf',
      asset: 'asset:///3ueg24fewe27n11x8wkthpuhjb/408/unnamed?s=9611&t=application%2Fpdf&d=sistS-RL81hJvuYAQig1YwAVo1EWvW0V76aCn0xaYH4%3D',
      confirmed: false,
      contact: '194dmg182z5kfnh18jh5bv552t',
      credit: true,
      currency: 'EUR',
      date: 20221024,
      // doctype: '00000000000000000000000002',
      gross: 330.26,
      iban: 'RS65548003804069052346',
      inbox: false,
      kind: 'doc',
      net: 308.65,
      positions: {
        '03z3f066w4d373v2wf0qkb5n4h': {
          category: '0y3nyfd3h38ug72vfxc81m8bh6',
          description: 'Shoes',
          gross: 68.57,
          net: 64.08,
          quantity: 1,
          sort: 828,
          taxRate: 7,
        },
        '1tc3625w6d51ekyeuawap72x9r': {
          category: '2u2xxtjymvqvkr9c907ymrjcdm',
          description: 'Sausages',
          gross: 115.98,
          net: 108.39,
          quantity: 1,
          sort: 829,
          taxRate: 7,
        },
        '4q4nnjcxypy4ynahkyt6hnc5kc': {
          category: '0y3nyfd3h38ug72vfxc81m8bh6',
          description: 'Ball',
          gross: 145.71,
          net: 136.18,
          quantity: 1,
          sort: 827,
          taxRate: 7,
        },
      },
      star: false,
      tags: {},
      tax: 21.61,
      title: 'capacitor',
    }

    const right = {
      _id: '28fb8y8wyg9v1zjjf82f0ag3wf',
      asset: 'asset:///3ueg24fewe27n11x8wkthpuhjb/408/unnamed?s=9611&t=application%2Fpdf&d=sistS-RL81hJvuYAQig1YwAVo1EWvW0V76aCn0xaYH4%3D',
      confirmed: false,
      contact: '194dmg182z5kfnh18jh5bv552t',
      credit: true,
      currency: 'EUR',
      date: 20221024,
      // doctype: '00000000000000000000000002',
      gross: 330.26,
      iban: 'RS65548003804069052346',
      inbox: false,
      kind: 'doc',
      net: 308.65,
      positions: {
        '03z3f066w4d373v2wf0qkb5n4h': {
          category: '0y3nyfd3h38ug72vfxc81m8bh6',
          description: 'Shoes',
          gross: 68.57,
          net: 64.08,
          quantity: 1,
          sort: 828,
          taxRate: 7,
        },
        '1tc3625w6d51ekyeuawap72x9r': {
          category: '2u2xxtjymvqvkr9c907ymrjcdm',
          description: 'Sausages',
          gross: 115.98,
          net: 108.39,
          quantity: 1,
          sort: 829,
          taxRate: 7,
        },
        '4q4nnjcxypy4ynahkyt6hnc5kc': {
          category: '0y3nyfd3h38ug72vfxc81m8bh6',
          description: 'Ball',
          gross: 145.71,
          net: 136.18,
          quantity: 1,
          sort: 827,
          taxRate: 7,
        },
      },
      star: false,
      tags: {
        '2u5g10fz4r6fv7xe7gf1hpapvh': 1,
        '4wn6jgw433u615kmuqqj5rygwg': 2,
      },
      tax: 21.61,
      title: 'capacitor',
    }

    expect(right).not.toEqual(left)

    objectAssignDeepInPlace(right, left)
    expect(right).toEqual(left)
  })
})
