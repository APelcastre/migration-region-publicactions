import { Request, Response } from "express";
import { extractRegions } from "../service/region.action";
import * as dotenv from "dotenv";
dotenv.config();


export const getRegions = async (): Promise<void>=> {
    try {
        const fileCountries = process.env.PATHCOUNTRIES as string
        const fileStates = process.env.PATHSTATES as string
        const fileCities =process.env.PATHCITIES as string 
        const regions = await extractRegions(fileCountries, fileStates, fileCities);

        console.log('Migración de Regiones Completada Correctamente, revise Compass o Atlas para ver los documentos.')

        //res.json(regions);
      } catch (error) {
        console.error('Error en el controlador de regiones:', error);
        //res.status(500).json({ message: 'Error interno del servidor' });
      }
}