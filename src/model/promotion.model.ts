import { Schema, model, Types } from "mongoose";
import {
  Country as CountryType,
  Promotion as PromotionType,
  Region as RegionType,
  State as StateType,
  Location as LocationType,
  Category as CategoryType,
} from "./promotion.schema";
import { CURRENCY, PUBLISHING_TYPE } from "./promotion.constants";
import { url } from "inspector";

const LocationSchema = new Schema<LocationType>(
  {
    // idLocation:{type:String, unique: true},
    name: { type: String, required: true },
    tags: {
      type: [String],
      set: (tags: string[]) => tags.map((tag) => tag.toUpperCase()),
    },
  },
  { timestamps: true }
);

const StateSchema = new Schema<StateType>({
  //idState: {type: String, unique: true},
  name: { type: String, required: true },
  locations: [LocationSchema],
});

const CountrySchema = new Schema<CountryType>({
  // idcountry:{type: String, unique: true},
  name: { type: String, required: true },
  states: [StateSchema],
});

const RegionSchema = new Schema<RegionType>({
  // idregion:{type: String, unique:true},
  name: { type: String, required: true },
  countries: [CountrySchema],
});

const CategorySchema = new Schema<CategoryType>({
  name: { type: String, required: true },
  visible: { type: Boolean },
  order: { type: Number },
});

const ImageSchema = new Schema({
  url: { type: String, required: true },
  section: { type: String, required: true },
});

const PaxSchema = new Schema({
  active: { type: Boolean, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, enum: CURRENCY, required: true },
});

const PromotionSchema = new Schema<PromotionType>(
  {
    id: { type: Number, required: true, unique: true },
    visible: { type: Boolean, required: true, default: false },
    title: { type: String, required: true },
    subhead: { type: String, required: true },
    coverimage: { type: String, required: true },
    url: { type: String, required: false },
    fare: { type: Number, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    rate: { type: Number, required: true },
    note: { type: String, required: true },
    priceFrom: { type: String, enum: CURRENCY, required: true },
    expirationDate: { type: Date, required: true },
    ecoturism: { type: Boolean },
    postLegend: { type: String },
    // user: {
    //   type: Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    // legend: { type: String, required: true },
    category: [{ type: CategorySchema }],
    type: {
      type: String,
      enum: PUBLISHING_TYPE,
      required: true,
    },
    imagesection: [{ type: ImageSchema }],
    //slides: { type: [String], required: true },
    amenities: { type: String },
    clauses: { type: [String] },
    destinations: {
      urlLocation: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      region: {
        type: RegionSchema,
        required: true,
      },
    },
    dates: [
      {
        active: { type: Boolean },
        start_date: { type: Date },
        end_date: { type: Date },
        origins: [
          {
            region: {
              type: RegionSchema,
            },
            country: {
              name: { type: String },
              locations: [
                {
                  type: RegionSchema,
                },
              ],
            },
            location: { LocationSchema },
          },
        ],
        pax: [PaxSchema],
      },
    ],
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

export const Promotion = model<PromotionType>("Promotion", PromotionSchema);
export const Region = model<RegionType>("Region", RegionSchema);
export const Category = model<CategoryType>("Category", CategorySchema);
