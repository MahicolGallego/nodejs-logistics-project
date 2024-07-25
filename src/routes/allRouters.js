import { Router} from "express";
import { getPathToDBFile } from "../helpers/getPathToFileDB.helper.js";
import { promises as fs} from 'fs'

const readFileFs = async (pathToTargetDBFile) => {
    try {   
        const data = await fs.readFile(pathToTargetDBFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`)
    }
    
}

const writeFileFs = async (pathToTargetDBFile,dataToOverWriteDBFile) => {
    try {
        await fs.writeFile(pathToTargetDBFile, JSON.stringify(dataToOverWriteDBFile, null, 2),'utf8');
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`)
    }
}

export const myRouter = Router();

//EndPoints for Warehouses

const pathToDBFileWarehouses = getPathToDBFile("../../databases/warehouses.json")

myRouter.post("/warehouses", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);

    console.log(warehouses);
    const newWarehouse = {
        id: warehouses.length + 1,
        name: req.body.name,
        location: req.body.location
    }

    warehouses.push(newWarehouse);
    writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(201).json({message: "Warehouse created successfully", warehouse: newWarehouse});

}) 

myRouter.get("/warehouses", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    res.status(200).json(warehouses)
})

myRouter.get("/warehouses/:id", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const warehouse = warehouses.find(w => w.id === parseInt(req.params.id));

    if(!warehouse) return res.status(404).send("Warehouse no encontrado")

    res.status(200).json(warehouse)
})

myRouter.put("/warehouses/:id", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const indexWarehouse = warehouses.findIndex((w) => w.id === parseInt(req.params.id));

    if(indexWarehouse === -1) return res.status(404).send("Warehouse no encontrado")

    const updateWarehouse = {
        ...warehouses[indexWarehouse],
        name: req.body.name,
        location: req.body.location
    }

    warehouses[indexWarehouse] = updateWarehouse
    await writeFileFs(pathToDBFileWarehouses, warehouses)

    res.status(200).json({message: 'Warehouse actualizado exitosamente', warehouse: updateWarehouse})
})

myRouter.delete("/warehouses/:id", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const indexWarehouse = warehouses.findIndex((w) => w.id === parseInt(req.params.id));

    if(indexWarehouse === -1) return res.status(404).send("Warehouse no encontrado")

    warehouses.splice(indexWarehouse, 1);
    await writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(200).send("Warehouse eliminado exitosamente")
})

