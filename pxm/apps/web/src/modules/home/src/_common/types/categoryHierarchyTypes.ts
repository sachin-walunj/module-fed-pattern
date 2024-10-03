export interface CategoryHierarchyItem {
  id: string
  name: string
}

export interface CategoryHierarchyResponse {
  hierarchy: CategoryHierarchyItem[]
  id: string
  force_child_inherit: string[]
}
