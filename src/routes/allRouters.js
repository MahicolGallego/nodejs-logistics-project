import { Router } from "express";
import { promises as fs } from "fs";
import { getPathToDBFile } from "../helpers/getPathToFileDB.helper.js";

//-------------------------------------------------------------------------------

//utilities functions

//Read files
const readFileFs = async (pathToTargetDBFile) => {
    try {
        const data = await fs.readFile(pathToTargetDBFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`);
    }
};

//Write files
const writeFileFs = async (pathToTargetDBFile, dataToOverWriteDBFile) => {
    try {
        await fs.writeFile(
            pathToTargetDBFile,
            JSON.stringify(dataToOverWriteDBFile, null, 2),
            "utf8"
        );
    } catch (error) {
        throw new Error(`Error en la respuesta: ${error}`);
    }
};

// Verify exist of elements

async function verifyExistence(
    idElementToVerify,
    pathToTargetDBFile,
    res,
    typeElementToVerify
) {
    if (idElementToVerify !== null && idElementToVerify !== "") {
        const data = await readFileFs(pathToTargetDBFile);
        if (!data.length)
            return res
                .status(404)
                .send(
                    `Error: Elemento ${typeElementToVerify} to be related no existe por que no hay registros`
                );

        const SpecificElement = data.find(
            (e) => e.id === parseInt(idElementToVerify, 10)
        );
        //se parsea por si existe la posibilidad de que se mande como str

        if (!SpecificElement)
            return res
                .status(404)
                .send(
                    `Error: El elemento ${typeElementToVerify} to be related no existe`
                );
    }

    if (idElementToVerify === "") {
        return null;
    }

    return parseInt(idElementToVerify, 10);
}

//-------------------------------------------------------------------------------

//Paths to DB Files

const pathToDBFileWarehouses = getPathToDBFile(
    "../../databases/warehouses.json"
);
const pathToDBFileShipments = getPathToDBFile("../../databases/shipments.json");
const pathToDBFileDrivers = getPathToDBFile("../../databases/drivers.json");
const pathToDBFileVehicles = getPathToDBFile("../../databases/vehicles.json");

//-------------------------------------------------------------------------------

//Router

export const myRouter = Router();

//-------------------------------------------------------------------------------

//EndPoints

//---------------------------------------------

//EndPoints for Warehouses

myRouter.post("/warehouses", async (req, res) => {
    //se verificamos relaciones validas

    req.body.vehicleId = await verifyExistence(
        req.body.vehicleId,
        pathToDBFileVehicles,
        res,
        "vehicle"
    );

    const warehouses = await readFileFs(pathToDBFileWarehouses);

    // console.log(warehouses);

    const newWarehouse = {
        id: warehouses[warehouses.length - 1].id + 1,
        name: req.body.name,
        location: req.body.location,
        vehicleId: req.body.vehicleId,
    };

    warehouses.push(newWarehouse);
    await writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(201).json({
        message: "Warehouse created successfully",
        warehouse: newWarehouse,
    });
});

myRouter.get("/warehouses", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    res.status(200).json(warehouses);
});

myRouter.get("/warehouses/:id", async (req, res) => {
    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const warehouse = warehouses.find((w) => w.id === parseInt(req.params.id));

    if (!warehouse) return res.status(404).send("Warehouse not found");

    res.status(200).json(warehouse);
});

myRouter.put("/warehouses/:id", async (req, res) => {
    req.body.vehicleId = await verifyExistence(
        req.body.vehicleId,
        pathToDBFileVehicles,
        res
    );

    const warehouses = await readFileFs(pathToDBFileWarehouses);
    const indexWarehouse = warehouses.findIndex(
        (w) => w.id === parseInt(req.params.id)
    );

    if (indexWarehouse === -1)
        return res.status(404).send("Warehouse not found");

    const updateWarehouse = {
        ...warehouses[indexWarehouse],
        name: req.body.name,
        location: req.body.location,
        vehicleId: req.body.vehicleId,
    };

    warehouses[indexWarehouse] = updateWarehouse;
    await writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(200).json({
        message: "Warehouse updated successfully",
        warehouse: updateWarehouse,
    });
});

myRouter.delete("/warehouses/:id", async (req, res) => {
    let warehouses = await readFileFs(pathToDBFileWarehouses);
    const warehouse = warehouses.find((w) => w.id === parseInt(req.params.id));

    if (!warehouse) return res.status(404).send("Warehouse not found");

    warehouses = warehouses.filter((w) => w.id !== warehouse.id);
    await writeFileFs(pathToDBFileWarehouses, warehouses);

    res.status(200).send("Warehouse deleted successfully");
});

//---------------------------------------------

//EndPoints for shipments

myRouter.post("/shipments", async (req, res) => {
    //se verificamos relaciones validas

    req.body.warehouseId = await verifyExistence(
        req.body.warehouseId,
        pathToDBFileWarehouses,
        res,
        "warehouse"
    );

    if (!req.body.warehouseId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the warehouse to be related",
        });

    req.body.vehicleId = await verifyExistence(
        req.body.vehicleId,
        pathToDBFileVehicles,
        res,
        "vehicle"
    );

    if (!req.body.vehicleId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the vehicle to be related",
        });

    req.body.driverId = await verifyExistence(
        req.body.driverId,
        pathToDBFileDrivers,
        res,
        "driver"
    );

    if (!req.body.driverId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the driver to be related",
        });

    const shipments = await readFileFs(pathToDBFileShipments);

    // console.log(warehouses);

    const newShipment = {
        id: shipments[shipments.length - 1].id + 1,
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId: req.body.warehouseId,
        vehicleId: req.body.vehicleId,
        driverId: req.body.driverId,
    };

    shipments.push(newShipment);
    await writeFileFs(pathToDBFileShipments, shipments);

    res.status(201).json({
        message: "shipments created successfully",
        shipment: newShipment,
    });
});

myRouter.get("/shipments", async (req, res) => {
    const shipments = await readFileFs(pathToDBFileShipments);
    res.status(200).json(shipments);
});

myRouter.get("/shipments/:id", async (req, res) => {
    const shipments = await readFileFs(pathToDBFileShipments);
    const shipment = shipments.find((s) => s.id === parseInt(req.params.id));

    if (!shipment) return res.status(404).send("Shipment not found");

    res.status(200).json(shipment);
});

myRouter.put("/shipments/:id", async (req, res) => {
    //se verificamos relaciones validas

    req.body.warehouseId = await verifyExistence(
        req.body.warehouseId,
        pathToDBFileWarehouses,
        res,
        "warehouse"
    );

    if (!req.body.warehouseId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the warehouse to be related",
        });

    req.body.vehicleId = await verifyExistence(
        req.body.vehicleId,
        pathToDBFileVehicles,
        res,
        "vehicle"
    );

    if (!req.body.vehicleId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the vehicle to be related",
        });

    req.body.driverId = await verifyExistence(
        req.body.driverId,
        pathToDBFileDrivers,
        res,
        "driver"
    );

    if (!req.body.driverId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the driver to be related",
        });

    const shipments = await readFileFs(pathToDBFileShipments);

    const indexShipment = shipments.findIndex(
        (s) => s.id === parseInt(req.params.id)
    );

    if (indexShipment === -1) return res.status(404).send("Shipment not found");

    const shipmentUpdated = {
        ...shipments[indexShipment],
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId: req.body.warehouseId,
        vehicleId: req.body.vehicleId,
        driverId: req.body.driverId,
    };

    shipments[indexShipment] = shipmentUpdated;
    await writeFileFs(pathToDBFileShipments, shipments);

    res.status(201).json({
        message: "Shipment updated successfully",
        shipment: shipmentUpdated,
    });
});

myRouter.delete("/shipments/:id", async (req, res) => {
    let shipments = await readFileFs(pathToDBFileShipments);
    const shipment = shipments.find(
        (s) => s.id === parseInt(req.params.id, 10)
    );

    if (!shipment) return res.status(404).send("Shipment not found");

    shipments = shipments.filter((s) => s.id !== shipment.id);
    await writeFileFs(pathToDBFileShipments, shipments);

    res.status(200).send("Shipment deleted successfully");
});

//---------------------------------------------

//EndPoints for drivers

myRouter.post("/drivers", async (req, res) => {
    req.body.warehouseId = await verifyExistence(
        req.body.warehouseId,
        pathToDBFileWarehouses,
        res,
        "warehouse"
    );

    if (!req.body.warehouseId)
        return res.status(404).json({
            message: "Error: Invalid data for the warehouse to be related",
        });

    const drivers = await readFileFs(pathToDBFileDrivers);

    const newDriver = {
        id: drivers[drivers.length - 1].id + 1,
        name: req.body.name,
        warehouseId: req.body.warehouseId,
    };

    drivers.push(newDriver);
    await writeFileFs(pathToDBFileDrivers, drivers);

    res.status(200).json({
        message: "Driver created successfully",
        driver: newDriver,
    });
});

myRouter.get("/drivers", async (req, res) => {
    const drivers = await readFileFs(pathToDBFileDrivers);
    res.status(200).json(drivers);
});

myRouter.get("/drivers/:id", async (req, res) => {
    const drivers = await readFileFs(pathToDBFileDrivers);
    const driver = drivers.find((d) => d.id === parseInt(req.params.id));

    if (!driver) return res.status(404).send("Driver not found");

    res.status(200).json(driver);
});

myRouter.put("/drivers/:id", async (req, res) => {
    //se verificamos relaciones validas

    req.body.warehouseId = await verifyExistence(
        req.body.warehouseId,
        pathToDBFileWarehouses,
        res,
        "warehouse"
    );

    if (!req.body.warehouseId)
        return res.status(400).json({
            Mesagge: "Error: Invalid data for the warehouse to be related",
        });

    const drivers = await readFileFs(pathToDBFileDrivers);

    const indexDriver = drivers.findIndex(
        (d) => d.id === parseInt(req.params.id)
    );

    if (indexDriver === -1) return res.status(404).send("Driver not found");

    const driverUpdated = {
        ...drivers[indexDriver],
        name: req.body.name,
        warehouseId: req.body.warehouseId,
    };

    drivers[indexDriver] = driverUpdated;
    await writeFileFs(pathToDBFileDrivers, drivers);

    res.status(201).json({
        message: "Driver updated successfully",
        driver: driverUpdated,
    });
});

myRouter.delete("/drivers/:id", async (req, res) => {
    let drivers = await readFileFs(pathToDBFileDrivers);
    const driver = drivers.find((d) => d.id === parseInt(req.params.id, 10));

    if (!driver) return res.status(404).send("Shipment not found");

    drivers = drivers.filter((d) => d.id !== driver.id);
    await writeFileFs(pathToDBFileDrivers, drivers);

    res.status(200).send("Driver deleted successfully");
});

//---------------------------------------------

//EndPoints for vehicles

myRouter.post("/vehicles", async (req, res) => {
    req.body.driverId = await verifyExistence(
        req.body.driverId,
        pathToDBFileDrivers,
        res,
        "driver"
    );

    if (!req.body.driverId)
        return res.status(404).json({
            message: "Error: Invalid data for the driver to be related",
        });

    const vehicles = await readFileFs(pathToDBFileVehicles);

    const newVehicle = {
        id: vehicles[vehicles.length - 1].id + 1,
        model: req.body.model,
        year: req.body.year,
        driverId: req.body.driverId,
    };

    vehicles.push(newVehicle);
    await writeFileFs(pathToDBFileVehicles, vehicles);

    res.status(200).json({
        message: "Vehicle created successfully",
        vehicle: newVehicle,
    });
});

myRouter.get("/vehicles", async (req, res) => {
    const vehicles = await readFileFs(pathToDBFileVehicles);
    res.status(200).json(vehicles);
});

myRouter.get("/vehicles/:id", async (req, res) => {
    const vehicles = await readFileFs(pathToDBFileVehicles);
    const vehicle = vehicles.find((v) => v.id === parseInt(req.params.id));

    if (!vehicle) return res.status(404).send("Vehicle not found");

    res.status(200).json(vehicle);
});

myRouter.put("/vehicles/:id", async (req, res) => {
    //se verificamos relaciones validas

    req.body.driverId = await verifyExistence(
        req.body.driverId,
        pathToDBFileDrivers,
        res,
        "driver"
    );

    if (!req.body.driverId)
        return res.status(404).json({
            message: "Error: Invalid data for the driver to be related",
        });

    const vehicles = await readFileFs(pathToDBFileVehicles);

    const indexVehicle = vehicles.findIndex(
        (v) => v.id === parseInt(req.params.id)
    );

    if (indexVehicle === -1) return res.status(404).send("Vehicle not found");

    const vehicleUpdated = {
        ...vehicles[indexVehicle],
        model: req.body.model,
        year: req.body.year,
        driverId: req.body.driverId,
    };

    vehicles[indexVehicle] = vehicleUpdated;
    await writeFileFs(pathToDBFileVehicles, vehicles);

    res.status(201).json({
        message: "Vehicle updated successfully",
        vehicle: vehicleUpdated,
    });
});

myRouter.delete("/vehicles/:id", async (req, res) => {
    let vehicles = await readFileFs(pathToDBFileVehicles);
    const vehicle = vehicles.find((d) => d.id === parseInt(req.params.id, 10));

    if (!vehicle) return res.status(404).send("Shipment not found");

    vehicles = vehicles.filter((v) => v.id !== vehicle.id);
    await writeFileFs(pathToDBFileVehicles, vehicles);

    res.status(200).send("Vehicle deleted successfully");
});
