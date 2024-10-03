'use server'

import { revalidatePath } from 'next/cache'

import { SortByProps } from '@patterninc/react-ui'

import { Fetcher } from '@amplifi-workspace/static-shared'

import { Brand } from './types'

type PartialBrand = Partial<Brand> & { id: string }

export const getBrands = async ({
  search,
  sort,
}: {
  search: string
  sort: SortByProps
}) => {
  try {
    // TODO: Implement search and sort in the API
    const response = await Fetcher<Brand[]>({
      url: '/brand',
      method: 'GET',
    })

    return response
  } catch (error) {
    console.error('Error getting brands', error)
    throw error
  }
}

export const getBrand = async (brandId: string) => {
  try {
    const response = await Fetcher<Brand>({
      url: `/brand/${brandId}`,
      method: 'GET',
    })

    return response
  } catch (error) {
    console.error('Error getting brand', error)
    throw error
  }
}

export const createBrand = async (brand: Omit<Brand, 'id' | 'hostname'>) => {
  try {
    const response = await Fetcher<Brand>({
      url: '/brand',
      method: 'POST',
      payload: brand,
    })

    revalidatePath(`${process.env.ROUTE_PREFIX_V3}/settings/brands`)
    return response
  } catch (error) {
    console.error('Error creating brand', error)
    throw error
  }
}

export const updateBrand = async (brand: PartialBrand) => {
  try {
    const response = await Fetcher<PartialBrand>({
      url: `/brand/${brand.id}`,
      method: 'PUT',
      payload: brand,
    })

    revalidatePath(`${process.env.ROUTE_PREFIX_V3}/settings/brands/${brand.id}`)
    return response
  } catch (error) {
    console.error('Error updating brand', error)
    throw error
  }
}

export const deleteBrand = async (brandId: string) => {
  try {
    const response = await Fetcher<boolean>({
      url: `/brand/${brandId}`,
      method: 'DELETE',
    })

    revalidatePath(`${process.env.ROUTE_PREFIX_V3}/settings/brands`)
    return response
  } catch (error) {
    console.error('Error deleting brand', error)
    throw error
  }
}
