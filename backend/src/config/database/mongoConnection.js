import mongoose from "mongoose";
import { env } from "../environment.js";

export default class mongoSingleton {
   static #instance;

   constructor(){
      
      const uri = process.env.NODE_ENV === "test" ?
       env.MONGO_URI_TEST : env.MONGO_URI_DEV;

      mongoose.connect(uri);

      console.log (`🟢 Mongo conectado a: ${process.env.NODE_ENV === "test" ? "DB_TEST" : "DB_DEV"}`);
   }

   static getInstance(){
      if(this.#instance){
         console.log("Ya existe una instancia de MongoDB");
         return this.#instance;
      }

      this.#instance = new mongoSingleton();
      console.log("Se creó una nueva instancia de MongoDB");
      return this.#instance;
   }
}
