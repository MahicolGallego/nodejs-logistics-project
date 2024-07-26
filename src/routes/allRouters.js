import { Router } from "express";
import { promises as fs } from 'fs';
import { getPathToDBFile } from "../helpers/getPathToFileDB.helper.js";

//-------------------------------------------------------------------------------

//utilities functions

//Read files
const readFileFs = async (pathToTargetDBFile) => {
    try {
        const data = await fs.readFile(pathToTargetDBFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`)
    }
    
}

//Write files
const writeFileFs = async (pathToTargetDBFile,dataToOverWriteDBFile) => {
    try {
        await fs.writeFile(pathToTargetDBFile, JSON.stringify(dataToOverWriteDBFile, null, 2),'utf8');
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`)
    }
}

// Verify exist of elements

async function verifyExistence(idElementToVerify, pathToTargetDBFile, res, typeElementToVerify) {
    if (idElementToVerify !== null && idElementToVerify !== "") {
        const data = await readFileFs(pathToTargetDBFile)
        if (!data.length) return res.status(404).send(`Error: Elemento ${typeElementToVerify} a relacionar no existe por que no hay registros`)
        
        const SpecificElement = data.find((e) => e.id === parseInt(idElementToVerify, 10));
        //se parsea por si existe la posibilidad de que se mande como str

        if (!SpecificElement) return res.status(404).send(`Error: El elemento ${typeElementToVerify} a relacionar no existe`);
    }
    
    if (idElementToVerify === "") {
        return null;
    }

    return parseInt(idElementToVerify, 10);
}



//-------------------------------------------------------------------------------

//Paths to DB Files

const pathToDBFileWarehouses = getPathToDBFile("../../databases/warehouses.json")
const pathToDBFileShipments = getPathToDBFile("../../databases/shipments.json")
const pathToDBFileDrivers = getPathToDBFile("../../databases/drivers.json")
const pathToDBFileVehicles = getPathToDBFile("../../databases/vehicles.json")

//-------------------------------------------------------------------------------

//Router

export const myRouter = Router();

//-------------------------------------------------------------------------------

//EndPoints

//---------------------------------------------

//EndPoints for Warehouses

myRouter.post("/warehouses", async (req, res) => {

    //se verificamos relaciones validas
    
    req.body.vehicleId = await verifyExistence(req.body.vehicleId, pathToDBFileVehicles, res, "vehicle");
    
    const warehouses = await readFileFs(pathToDBFileWarehouses);

    // console.log(warehouses);
    
    const newWarehouse = {
        id: warehouses.length + 1,
        name: req.body.name,
        location: req.body.location,
        vehicleId: req.body.vehicleId
    }

    warehouses.push(newWarehouse);
    await writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(201).json({ message: "Warehouse created successfully", warehouse: newWarehouse });

});

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

    req.body.vehicleId = await verifyExistence(req.body.vehicleId, pathToDBFileVehicles, res);

    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const indexWarehouse = warehouses.findIndex((w) => w.id === parseInt(req.params.id));

    if(indexWarehouse === -1) return res.status(404).send("Warehouse no encontrado");

    const updateWarehouse = {
        ...warehouses[indexWarehouse],
        name: req.body.name,
        location: req.body.location,
        vehicleId: req.body.vehicleId
    }

    warehouses[indexWarehouse] = updateWarehouse
    await writeFileFs(pathToDBFileWarehouses, warehouses)

    res.status(200).json({message: 'Warehouse actualizado exitosamente', warehouse: updateWarehouse})
})

myRouter.delete("/warehouses/:id", async (req, res) => {
    
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const warehouse = warehouses.find((w) => w.id === parseInt(req.params.id));

    if(!warehouse) return res.status(404).send("Warehouse no encontrado")

    const warehousesUpdated = warehouses.filter((w) => w.id !== warehouse.id);
    await writeFileFs(pathToDBFileWarehouses, warehousesUpdated);

    res.status(200).send("Warehouse eliminado exitosamente")
})

//---------------------------------------------

//EndPoints for shipments

myRouter.post("/shipments", async (req, res) => {

    //se verificamos relaciones validas
    
    req.body.warehouseId = await verifyExistence(req.body.warehouseId, pathToDBFileWarehouses, res, "warehouse");

    if (!req.body.warehouseId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el warehouse a relacionar" });
    
    req.body.vehicleId = await verifyExistence(req.body.vehicleId, pathToDBFileVehicles, res, "vehicle");

    if (!req.body.vehicleId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el vehicle a relacionar" });
    
    req.body.driverId = await verifyExistence(req.body.driverId, pathToDBFileDrivers, res, "driver");

    if (!req.body.driverId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el driver a relacionar" });
    
    const shipments = await readFileFs(pathToDBFileShipments);

    // console.log(warehouses);
    
    const newShipment = {
        id: shipments.length + 1,
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId: req.body.warehouseId,
        vehicleId: req.body.vehicleId,
        driverId: req.body.driverId
    }

    warehouses.push(newShipment);
    await writeFileFs(pathToDBFileShipments, shipments);

    res.status(201).json({ message: "shipments created successfully", shipment: newShipment });

});

myRouter.get("/shipments", async (req, res) => {
    const shipments = await readFileFs(pathToDBFileShipments);
    res.status(200).json(shipments)
})

myRouter.get("/shipments/:id", async (req, res) => {
    const shipments = await readFileFs(pathToDBFileShipments);
    const shipment = shipments.find((s) => s.id === parseInt(req.params.id))

    if(!shipment) return res.status(404).send("Shipment no encontrado")

    res.status(200).json(shipment)
})

myRouter.put("/shipments/:id", async (req, res) => {

    //se verificamos relaciones validas
    
    req.body.warehouseId = await verifyExistence(req.body.warehouseId, pathToDBFileWarehouses, res, "warehouse");

    if (!req.body.warehouseId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el warehouse a relacionar" });
    
    req.body.vehicleId = await verifyExistence(req.body.vehicleId, pathToDBFileVehicles, res, "vehicle");

    if (!req.body.vehicleId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el vehicle a relacionar" });
    
    req.body.driverId = await verifyExistence(req.body.driverId, pathToDBFileDrivers, res, "driver");

    if (!req.body.driverId) return res.status(400).json({ Mesagge: "Error: Datos no validos para el driver a relacionar" });

    const shipments = await readFileFs(pathToDBFileShipments);

    const indexShipment = shipments.findIndex((s) => s.id === parseInt(req.params.id));
    
    if(indexShipment === -1) return res.status(404).send("shipment no encontrado");

})