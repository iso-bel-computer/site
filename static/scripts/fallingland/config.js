export const config = {
    "gameSettings": {
        "canvasWidth": 400,
        "canvasHeight": 400,
    },
    "worldGen": {
        "chanceOfWaterFeatures": 1,
        "defaultWaterLevel": -50,
        "randomiseWaterLevel": true,
        "sandHeightAboveWater": 2,
        "minForestsPerMap": 5,
        "maxForestsPerMap": 20,
    },
    "viewSettings": {
        "contourInterval": 20,
        "gridInterval": 40,
        "gridOffset": 20,
        "maxZoom": 10,
        "minZoom": 3,

    },
    "tileTypes": {
        "tree": {
            "flammability": 0.2,
            "burnTime": 50,
        },
        "grass": {
            "flammability": 0.3,
            "burnTime": 2,
        },
        "ash": {
            "grassRegrowthSpeed": 0.001 // chance of regrowth per tick, per neighbouring grass tile
        }
    }

}
