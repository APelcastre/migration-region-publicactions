import { create } from "domain";
import { CURRENCY, PUBLISHING_TYPE } from "../model/promotion.constants";
import { Promotion } from "../model/promotion.model";
//import { Category } from "../model/promotion.model";
import { Region } from "../../vl_promociones_migration/src/model/promotion.model";
import fs from 'fs';
import {ObjectId} from 'mongodb';
import { validateConnection } from "../config/database";
import path from "path";
//import { Category } from "../../vl_promociones_migration/src/model/promotion.schema";
import { Category } from "../model/promotion.schema";

/////Función para cargar a mongo.
//const fs = require('fs');
const paths = 'C:\\Projects\\KATU\\publicationsjsons';
const publishingTypeMap: Record<string, PUBLISHING_TYPE> = {
    "Hotel": PUBLISHING_TYPE.HOTEL,
    "Paquete": PUBLISHING_TYPE.PAQUETE,
    "Vuelo": PUBLISHING_TYPE.VUELO
    
  };

//leo archivos en carpeta 
export const readFilesFromDirectory = (): void => {
    fs.readdir(paths, async (err: NodeJS.ErrnoException | null, files: string[]) => {
      if (err) {
        console.error('Error al leer la carpeta:', err);
        return;
      }
      console.log('--------------------------------------------------------------');
      //Contadores
      const numOfFiles = files.length;
      console.log(`Cantidad de publicaciones a procesar ${numOfFiles}`)
      console.log('----------------------------------------------------------------');
      let successCount = 0;
      let errorCount = 0;
      let failedPublications: string[] = [];
      let idWithError= '';
      //
      for(const file of files){
        const filePath = path.join(paths, file);

        try{
            //leo archivo
        const rawData = fs.readFileSync(filePath, 'utf-8');
        
        //paso a objeto
        const jsonData = JSON.parse(rawData);
        idWithError = jsonData[0].id;
        //Region Section
        const regionInfo = await getRegionByCountry(jsonData[0].destination_country, jsonData[0].id);

        const regionData =  regionInfo ? {
          name: regionInfo,
          countries: [{
            name: jsonData[0]?.destination_country,
            states: [{
              name: jsonData[0]?.detination_statename,
              locations: [{
                name: jsonData[0]?.destinoname,
                tags: []
              }]
            }]
          }]
        } : {};

        //console.log(regionData)

        //mapeo para el esquema promociones
        //tengo que sacar los datos del json que extraiga y colocarlos , }
        //hay que revisar el nombre de cada campo.
        //console.log(jsonData)
        const rescategories = jsonData[0]?.categories?.map((category: any) => ({
          name: category.category,
          visible: category.status,
          order: category.clasification
        })) || [];

        //Images
        const resImages = jsonData[0]?.imagesection.map((image: any)=>({
          url: image.urlimg,
          section: image.sectionimg
        })) || [];

        //origins
        const transFormOrigins = await transformOrigins(jsonData[0]?.origins, regionInfo);

        //console.log(resImages);
       
        const newPromotion = new Promotion({
           id: jsonData[0]?.id,
            visible: jsonData[0]?.status,
            title:jsonData[0]?.title,
      subhead: jsonData[0]?.subhead,
      coverimage: jsonData[0]?.coverImg, //ya esta en el query
      url: jsonData[0]?.url,
     fare: jsonData[0]?.priceFrom,
      shortDescription: jsonData[0]?.shortDescription,
      longDescription: jsonData[0]?.longDescription,
      rate: jsonData[0]?.rate,
      note: jsonData[0]?.note,
      priceFrom: CURRENCY.MXN,
      expirationDate: new Date(jsonData[0]?.expirationDate),
      ecoturism: jsonData[0]?.ecotourism ?? undefined,
      postLegend: jsonData[0]?.postlegend ?? undefined,
      user: jsonData[0]?.userId,
      //legend: 'Esta es la leyenda',
      category:rescategories, //ya esta en el query
      type:publishingTypeMap[jsonData[0]?.pubtypename], // ya esta en el query
      imagesection: resImages,
    // slides:[
    //     'slide1',
    //     'slide2'
    // ],
    amenities: jsonData[0]?.amenities ?? undefined,
    clauses: Array.isArray(jsonData[0]?.clauses) ? jsonData[0]?.clauses.map((clasus: any) => ({ ...clasus })) 
    : typeof jsonData.clauses === "string" && jsonData.clauses.trim() !== ""
        ? [{ text: jsonData.clauses }]
        : [],
    destinations:{
        urlLocation: jsonData[0]?.urlLocation,
        latitude: jsonData[0]?.latitude,
        longitude: jsonData[0]?.longitude,
        region: regionData
    },
     dates: transFormOrigins,//jsonData[0]?.origins?.length > 0 ? jsonData[0]?.origins.map(async (origin: any)=>({
    //     active: origin.statusoriginfechas,
    //     start_date: new Date(origin.stardateor),
    //     end_date: new Date(origin.endateor),
    //     origins:[
    //         {
    //             statusOrigin: origin.status ?? false,
    //             region: regionInfo, //origin.country ? await getRegionByCountry(origin.country, 1) : null,
    //             country:{
    //                 name: origin.countryname || "Desconocido",
    //                 states: origin.statename || []
    //             },
    //             location:{
    //                 name: origin.originname || "Sin ubicación",
    //                 tags: origin.tags || []
    //             }

    //         }
    //     ],
    //     pax: origin.datesocuppancies?.map((p: any)=> ({
    //         active: p.statusdescrip ?? true,
    //         description: p.descripccion,
    //         price: p.price,
    //         currency: CURRENCY.MXN
    //         //dejo un array vacio en caso  de  que la publicación no tenga pax o descripcciones.
    //     })) || [] 
    //     //Mismo caso de pax. La publicación puede o no tener origins.
    // })) : [] ,
    embedding: []
          });
        
       
        //  console.log(newPromotion);
       
        await newPromotion.save();
        successCount++;
       // console.log(`Archivo ${file} guardado en MongoDB`);

        }catch(error){
          errorCount++;
          failedPublications.push(idWithError); 
           // console.log(`Error procesando el archivo ${file}:`, error)
        }
      }
  
    //   files.forEach(file => {
    //     const filePath = path.join(paths, file);
    //     console.log('Archivo encontrado:', filePath);
    //   });
    console.log('-----------------------------------------------------------------');
    console.log(`Total de publicaciones guardadas correctamente: ${successCount}`);
    console.log(`Total publicaciones con error: ${errorCount}`);
    console.log(`IDs de publicaciones con error al guardar:`);
    failedPublications.forEach(id => console.log(`- ID: ${id}`));

    });

  };




  async function getRegionByCountry(countryName: string, idpub: number){
    try{

        if(!countryName){
            throw new Error("El nombre del pais es requerido." + "Verifica publicación #:" + idpub);
        }
        const countryNameclean =  countryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const region = await validateConnection(countryNameclean, idpub);
        return region;
        // const region = await Region.findOne(
        //     { "countries.name": "Mexico" },
        //     { "_id": 1, "name": 1, "countries.$": 1 }
        //   );
        
        // const region = await Region.findOne(
        //   { "countries.name": "Mexico" },
        //   { _id: 1, name: 1, countries: 1 }).lean();

         // console.log(region);


        //const specificRegion = await Region.findById('67a3bc3718ea773712482c41').exec();
       // const specificRegion = await Region.findOne({ 'countries.name': 'Mexico' }).exec();
      //  console.log(specificRegion);
      // const specificRegion = await Region.findOne({}).exec();
        

        // if(specificRegion){
        //     console.log("Region found:", specificRegion);
        // }else{
        //    // const region2 = await Region.findById({ countries: {$in: [countryName]} });
        //     //console.log("Found in general search:", region2);
        // }

        // const region = await Region.findOne({
        //     'countries.name': countryName
        // });
        // console.log('Resultado de la búsqueda:', region);
        // if (!region) {
        //     console.log("No se encontró la región para:", countryName);
        //     return null;
        //   }
        //   return {
        //     id: region.id,
        //     name: region.name
        //   };
    }catch(error){
        console.error("Error al buscar la región:", error);
    return null;
    }
  }


  async function transformOrigins(origins: any[], regionInfo: any) {
    if (!origins?.length) return [];
  
    return Promise.all(origins.map(async (origin) => ({
      active: origin.statusoriginfechas,
      start_date: new Date(origin.stardateor),
      end_date: new Date(origin.endateor),
      origins: [
        {
          statusOrigin: origin.status ?? false,
          region: typeof regionInfo === "string" ? { name: regionInfo, countries: [] } : regionInfo, // Verifica si es string y lo convierte en objeto
          country: {
            name: origin.countryname || "Desconocido",
            states: origin.statename ? [{ name: origin.statename }] : [], // Asegura estructura correcta
          },
          location: {
            name: origin.originname || "Sin ubicación",
            tags: origin.tags || [],
          },
        },
      ],
      pax: origin.datesocuppancies?.map((p: any) => ({
        active: p.statusdescrip ?? true,
        description: p.descripccion,
        price: p.price,
        currency: CURRENCY.MXN,
      })) || [],
    })));
  }

// const cargarJson = (filePath: string)=>{
//     const data = fs.readFileSync(filePath, 'utf-8');
//     return JSON.parse(data);
// }



/////////////////////////////////





//Armar el objeto
// const promotion_obj: PromotionType={
//       visible: true,
//       title: 'Some text',
//       subtitle: 'Some text2',
//       coverimage: 'https:unaimagen', //ya esta en el query
//       url: 'xsxs',
//       fare: 1000,
//       shortDescription: 'Some text lorepIpsum',
//       longDescription: 'Some text 1,2,3',
//       rate: 5,
//       note: 'Nijfgdgfds',
//       priceFrom: CURRENCY.MXN,
//       expirationDate: new Date(),
//       ecoturism: false,
//       postLegend: 'Texto',
//       //user: UserModel,
//       legend: 'Esta es la leyenda',
//       category: [{
//         name: 'Internacionales',
//         visible: true,
//         order: 5 //clasification en postgress
//       }], //ya esta en el query
//       type:PUBLISHING_TYPE.PAQUETE, // ya esta en el query
//       imagesection:[
//        {url:'miurl', section:'carousel', create_date:'1991/12/2', update_date:'1991/2/23' },
//        {url:'miurl', section:'carousel', create_date:'1991/12/2', update_date:'1991/2/23' },
//        {url:'miurl', section:'carousel', create_date:'1991/12/2', update_date:'1991/2/23' }
//     ],
//     // slides:[
//     //     'slide1',
//     //     'slide2'
//     // ],
//     amenities:[
//         'amentie1',
//         'amenitie2'
//     ],
//     clauses: [
//         'Solo hay una'
//     ],
//     destinations:{
//         latitude: 22154,
//         longitude: 5454,
//         region: { 
//             name: "America", 
//             countries: [{
//                 name:"Mexico",
//                 states:[{
//                     name:"Quintana Roo",
//                     locations:[{
//                         name: "Playa del carmen",
//                         tags:["playa", "tur ismo"]
//                     }] }]}] //referencia
//         },
//     },
//     dates: [{
//         active: true,
//         start_date: new Date().toISOString(), // Formato string ISO
//         end_date: "2025-12-31", // También puede ser string
//         origins: [
//             {
//                 statusOrigin: true,
//                 region: { 
//                     name: "Europe", 
//                     countries: [] 
//                 },
//                 country: { 
//                     name: "Spain", 
//                     states: [] 
//                 },
//                 location: {
//                     name: "Barcelona",
//                     tags: ["beach", "city"]
//                 }
//             }
//         ],
//         pax: []
//     }],
//     embedding: [1215,121]
     
// }

//console.log(promotion_obj);
