import databaseConnection from "./config/database";
import { getRegions } from "./controllers/promotionregions.controller";
import * as dotenv from "dotenv";
import { readFilesFromDirectory } from "./service/promotion.action";
dotenv.config();


const runApp = async () =>{
    try{
        await databaseConnection();

        //await getRegions();
        await readFilesFromDirectory();

    }catch(err){

    }
};

runApp();