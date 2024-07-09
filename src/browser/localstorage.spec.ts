// import { isBrowser } from "../common/platform"
import { arraySorted } from '../common'
import { LocalStorage } from './localstorage'

describe('localStorage', () => {
  it('should store data and read it again', () => {
    {
      const db = new LocalStorage({ name: 'test' })
      db.clear()
      expect(db.allKeys()).toEqual([])
      db.setItem('a', 1)
      db.setItem('b', { complex: [1, 2, '3'] })
      db.setItem('c', [0, 9, 8])
      db.setItem('c', 'Again!')
      expect(arraySorted(db.allKeys())).toEqual(['a', 'b', 'c'])
      expect(db.getItem('a')).toEqual(1)
      expect(db.getItem('b')).toEqual({ complex: [1, 2, '3'] })
      expect(db.getItem('c')).toEqual('Again!')
    }
    {
      const db = new LocalStorage({ name: 'test' })
      expect(arraySorted(db.allKeys())).toEqual(['a', 'b', 'c'])
      expect(db.getItem('a')).toEqual(1)
      expect(db.getItem('b')).toEqual({ complex: [1, 2, '3'] })
      expect(db.getItem('c')).toEqual('Again!')
      db.removeItem('b')
      expect(arraySorted(db.allKeys())).toEqual(['a', 'c'])
      db.clear()
      expect(db.allKeys()).toEqual([])
    }
  })
})
