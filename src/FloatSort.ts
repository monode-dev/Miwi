import { exists } from './utils'

//
export const FloatSort = {
  //
  toSorted<T>(options: {
    list: Iterable<T>
    getPos: (item: T) => number
    getUid: (item: T) => string
  }): T[] {
    return [...options.list].toSorted((a, b) => {
      // Prefer to use sortPos
      const posA = options.getPos(a)
      const posB = options.getPos(b)
      if (posA !== posB) return posA - posB

      // Due to the multi-player nature of this app two items might end up with the same sortPos.
      const uidA = options.getUid(a)
      const uidB = options.getUid(b)
      return uidA.localeCompare(uidB)
    })
  },

  //
  getPosBefore(pos: number) {
    return Math.floor(pos) - 1
  },

  //
  getPosAfter(pos: number) {
    return Math.ceil(pos) + 1
  },

  //
  getNewStartPos<T>(props: {
    list: Iterable<T>
    getPos: (item: T) => number
    getUid: (item: T) => string
  }): number {
    const sortedList = FloatSort.toSorted(props)
    if (sortedList.length === 0) return 0
    return FloatSort.getPosBefore(props.getPos(sortedList[0]!))
  },

  //
  getNewEndPos<T>(props: {
    list: Iterable<T>
    getPos: (item: T) => number
    getUid: (item: T) => string
  }): number {
    const sortedList = FloatSort.toSorted(props)
    if (sortedList.length === 0) return 0
    return FloatSort.getPosAfter(props.getPos(sortedList[sortedList.length - 1]!))
  },

  //
  moveItem<T>(props: {
    sortedList: Iterable<T>
    fromIndex: number
    toIndex: number
    getPos: (item: T) => number
    setPos: (item: T, pos: number) => void
  }) {
    const { fromIndex, toIndex, getPos, setPos } = props

    // Create a copy of the list with the item in the new position
    const sortedList = [...props.sortedList]
    const item = sortedList[fromIndex]!
    sortedList.splice(fromIndex, 1)
    sortedList.splice(toIndex, 0, item)

    // Calculate the item's new position
    const prevItem = sortedList[toIndex - 1]
    const prevPos = exists(prevItem) ? getPos(prevItem) : null
    const nextItem = sortedList[toIndex + 1]
    const nextPos = exists(nextItem) ? getPos(nextItem) : null
    const newPos = exists(prevPos)
      ? exists(nextPos)
        ? (prevPos + nextPos) / 2
        : FloatSort.getPosAfter(prevPos)
      : exists(nextPos)
      ? FloatSort.getPosBefore(nextPos)
      : 0

    // Move the item
    const havePrecisionForNewPos = newPos !== prevPos && newPos !== nextPos
    if (havePrecisionForNewPos) {
      setPos(item, newPos)
    } else {
      for (let i = 0; i < sortedList.length; i++) {
        setPos(sortedList[i]!, i)
      }
    }
  },
}
