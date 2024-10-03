export interface TreeLike<T extends TreeLike<T>> {
  id: string
  children: T[]
}
export const findItemWithId = <T extends TreeLike<T>>(
  id: string,
  children: T[]
): T | undefined => {
  for (const child of children) {
    if (child.id === id) {
      return child
    }

    const foundChild = findItemWithId(id, child.children)
    if (foundChild) {
      return foundChild
    }
  }

  return undefined
}

/** Manipulates a tree item with a callback function and returns a new list */
export const manipulateTreeItem = <T extends TreeLike<T>>(
  children: T[],
  callback: (item: T) => T
): T[] => {
  const copy = children.slice()
  for (let i = 0; i < copy.length; i++) {
    const child = copy[i]
    const newChild = callback({ ...child })
    copy[i] = newChild

    const newChildren = manipulateTreeItem(child.children, callback)
    copy[i].children = newChildren
  }

  return copy
}
