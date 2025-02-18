import { CURRENCY, PUBLISHING_TYPE } from '../model/promotion.constants'
//import { UserModel } from '@/modules/user/user.model'

interface Publication {
  id: number;
  visible: boolean
  title: string
  //subhead: string // QUITAR YA QUE EXISTE EN PROMOTION INTERFACE
  coverimage: string
  url?: string
  fare: number
  shortDescription: string
  longDescription: string
  rate: number
  note: string 
  priceFrom: CURRENCY 
  expirationDate: Date
  ecoturism?: boolean
  postLegend?: string
}

export type Embedding = number[]

export interface Carousel extends Publication {
  start_date: Date | string
  end_date?: Date | string
  order: number
}
export interface ImageSection{
  url: string,
  section: string,
  create_date?: Date | string,
  update_date?: Date | string

}

export interface Region {
  idregion?: string,
  name: string
  countries: Country[],
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Country {
  idcountry?: string,
  name: string
  states: State[]
}

export interface State {
  idState?:string
  name:string
  locations?: Location[]
}

export interface Location {
  idLocation?:string
  name: string
  tags: string[]
}

export interface Category {
  name: string
  visible: boolean
  order?: number
}

export interface Origin {
  statusOrigin?: boolean,
  region: Region
  country?: Country
  location?: Location
}

export interface Destination extends Origin {
  urlLocation?: string
  latitude?: number
  longitude?: number
}

export interface Period {
  active: boolean
  start_date?: Date | string
  end_date?: Date | string
  origins?: Origin[]
  pax: Pax[]
}

export interface Pax {
  active: boolean
  description: string
  price: number
  currency: CURRENCY
}

export interface Complements {
  shortDescription: string
  longDescription: string
  note: string
  priceFrom: CURRENCY
  expirationDate: Date
  rate: number
  amenities: string
  clauses: string
  ecoturism: boolean
  postLegend?: string
}

export interface Promotion extends Publication {
 // user: UserModel
  legend: string // AQUI COLOCAR SUBHEAD ACTUAL .
  category: Category[]
  type: PUBLISHING_TYPE
  gallery: ImageSection[] // GALLERY EL NOMBRE GALLERY 
 // slides: string[] // COLOCAR LAS IMAGENES DEL carousel
  amenities?: string
  clauses: string[]
  destinations: Destination
  dates: Period[] // CAMBIAR EL NOMBRE DEL OBJETO PERIOD---
  embedding: Embedding
}