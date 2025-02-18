import { Application } from "express";
import mongoose from "mongoose";
import {ObjectId} from 'mongodb';
import { Region } from "../../vl_promociones_migration/src/model/promotion.model";

const databaseConnection = async () => {
    try {
        console.log("Connecting to database...");
        mongoose.set('bufferTimeoutMS', 30000);
        mongoose.set('bufferCommands', false);
        if (process.env.DATABASE_URL) {
            const client = await mongoose.connect(process.env.DATABASE_URL);
            if (client) {
                
                console.log("Database connection completed, running with database connection");
                //await validateConnection();
               
            }
        
        } else {
            console.log("Database connection string unavailable, running without database connection");

        }
    } catch (error: unknown) {
        console.log(error);
        throw new Error((error as Error).message);
    }
};



export async function validateConnection(countryName: string, idPublication: number) {
    try {
      // Verificamos que mongoose.connection.db no sea undefined
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) { 
       
       ///est   query funcniona
       const region = await mongoose.connection.db
  .collection('regions')
  .findOne(
    { "countries.name": countryName }, 
    { projection: { "_id": 1, "name": 1, "countries.$": 1 } }
  );
//        const region = await mongoose.connection.db
//   .collection('regions')
//   .findOne(
//     { "countries._id": new ObjectId("67a3bc3718ea773712482c41") },
//     { projection: { "_id": 1, "name": 1, "countries.$": 1 } } 
//   );
  if(region)
  {
    // console.log(region);
        //  console.log(`ID de la región: ${region._id}`);
         // console.log(`Nombre de la región: ${region.name}`);

          return region.name;

  }else{
    console.log(`No se obtuvo región para la publicación con id : ${idPublication} `)
  }
          
  
      } else {
        console.log('La conexión con MongoDB no está lista o db no está disponible.');
      }
    
    } catch (error) {
      console.error('Error al realizar la consulta:', error);
    }
  }

export default databaseConnection;
