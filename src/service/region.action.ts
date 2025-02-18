import { Region } from "../model/promotion.model";
import {  Region as RegionType} from "../model/promotion.schema"
import * as fs from 'fs/promises';
import { State } from "../model/promotion.schema";
import {Location } from "../model/promotion.schema";
import { Country } from "../model/promotion.schema";

export interface Regions{
  region?: string;
}



export async function extractRegions(filePath: string, filePath2: string, pathCities: string): Promise<RegionType[]> {
  try {
    const data =  await fs.readFile(filePath, 'utf-8');
    const statesData = await fs.readFile(filePath2, 'utf-8');
    const citiesData = await fs.readFile(pathCities, 'utf-8');

      //Parseamos
  //  const countries1: Country[] = JSON.parse(data);
    const countries: { name: string; region: string }[] = JSON.parse(data);
    const states: { name: string; country_name: string; locations: Location[] }[] = JSON.parse(statesData);
    const cities: { name: string; state_name: string;}[] = JSON.parse(citiesData);


    // const regionsMap: Map<string, Country[]> = new Map();
    // const stateMap = new Map<string, State[]>();

    const regionMap = new Map<string, Country[]>(); // Región - Países
    const stateMap = new Map<string, State[]>(); // País - Estados
    const cityMap = new Map<string, Location[]>(); //Ciudades




    //Locations:
    
    cities.forEach(city => {
      const location: Location = {
        name: city.name,
        tags: [] // Puedes agregar tags si los necesitas en el futuro
      };

      if (!cityMap.has(city.state_name)) {
        cityMap.set(city.state_name, []);
      }
      cityMap.get(city.state_name)?.push(location);
    });

    //console.log(cities);

    ////////////

    //const countries: Regions[] = JSON.parse(data);
    //Agrupación estados-paises
    states.forEach(state => {
      const stateWithLocations: State = {
        name: state.name,
        locations: cityMap.get(state.name) || []  //state.locations || [],
      };
      if (!stateMap.has(state.country_name)) {
        stateMap.set(state.country_name, []);
      }
      stateMap.get(state.country_name)?.push(stateWithLocations);
    });

    //Agrupación paises x region
    // Agrupar países por región
    countries.forEach(country => {
      const countryWithStates: Country = {
        name: country.name,
        states: stateMap.get(country.name) || [],
      };
      if (!regionMap.has(country.region)) {
        regionMap.set(country.region, []);
      }
      regionMap.get(country.region)?.push(countryWithStates);
    });

    const regions: RegionType[] = Array.from(regionMap.entries()).filter(([regionName]) => {
      return regionName && regionName.trim().length > 0 })
     .map(([regionName, countries]) => ({
      name: regionName,
      countries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

   //console.log(JSON.stringify(regions, null, 2));

    await Region.create(regions);

    return regions;

      // Crear un Set para almacenar valores únicos
      //const uniqueRegions = new Set<string>();

    //////////////////////////////
    // countries1.forEach((country) => {
    //   if (typeof country.region === 'string' && country.region.trim() !== '') {
    //     if (!regionsMap.has(country.region)) {
    //       regionsMap.set(country.region, []); // Crear la región si no existe
    //     }
    //     regionsMap.get(country.region)?.push(country); // Agregar el país a la región
    //   }
    // });

    // const regions: Region[] = Array.from (regionsMap.entries()).map(([regionName, countries])=>({
    //   name: regionName,
    //   countries: countries.map(country => ({name: country.name}))
    // }));

    //console.log(regions);
 //   console.log(JSON.stringify(regions, null, 2));




      //////////////////////

      // countries.forEach((country) => {
      //   if (country.region) {
      //     uniqueRegions.add(country.region);
      //   }
      // });
  
  // Convertir el Set a un array
//   const myarra =  Array.from(uniqueRegions); //en este punto ya tenemos las regiones del arreglo.


//   const region_object1: RegionType={
//   name:" ASIA",
//     countries: [{
//       name: " Afganistan",
//       states: [{
//         name: " Estambu",
//         locations: [{
//           name: " Una ",
//           tags: [" pueblo "]
//         }]
//       }]
//     }]
// }

//     console.log(region_object1)
   // 
   //  return [];



  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return []; 
  }
}

// export function extractRegions(filepath: string): Promise<any[]>{
//   return new Promise((resolve, reject)=>{
//     fs.readFile(filepath, 'utf-8', (err, data)=> {
//       if(err){
//         console.error('No se logro leer archivo: ', err);
//         return;
//       }
  
//       try{
//         const countries = JSON.parse(data);
  
//         const regions = countries.map((country: any)=>({
//           region: country.region
//         }));
  
//         console.log(regions);
//       }catch(error){
//         console.log('Error en el parseo del JSON:', error);
//       }
//     });
//   })
 
// }

///QUitar 
//Primero obetenemos las regiones
// const region_object1: RegionType={
//   name: " ",
//     countries: [{
//       name: " ",
//       states: [{
//         name: " ",
//         locations: [{
//           name: " ",
//           tags: [" "]
//         }]
//       }]
//     }]
// }

// const region_object: RegionType = {
//     name: "America del Norte",
//     countries: [{
//       name: "México",
//       states: [{
//         name: "Jalisco",
//         locations: [{
//           name: "Puerto Vallarta",
//           tags: ["Playa"]
//         }]
//       }]
//     }]
// }



//const inserted_region = new Region(region_object1).save()

//console.log(inserted_region);