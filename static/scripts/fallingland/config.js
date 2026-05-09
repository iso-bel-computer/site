export const config = {
    "gameSettings": {
        "canvasWidth": 500,
        "canvasHeight": 500,
    },
    "worldGen": {
        "waterAmount": 0, // lower for more land. higher for more water.
        "randomiseWaterLevel": true,
        "beachAmounts": 0.03, // chance of any shore tile having a beach
        "beachSize": 0.5, // value 0 to 1
        "randomiseBeaches": true,
        "bogAmounts": 0.001,
        "bogSize": 10,
        "minForestsPerMap": 5,
        "maxForestsPerMap": 20,
        "shallowWaterRockRate": 0.0004,
        "mountainRockRate": 0.0002,
        "snowAltitude": 65,
        "enableSnowWorlds": true,
        "beehiveChanceInTree": 0.0001, // chance any tree tile is replaced with a beehive

    },
    "viewSettings": {
        "contourInterval": 10,
        "contourThickness": 2,
        "gridInterval": 40,
        "gridOffset": 20,
        "maxZoom": 8,
        "minZoom": 3,

    },
    "worldBehaviour": {
        "grassGrowAcrossHeightDifference": 5, // how close in elevation two tiles have to be for grass to grow beteween them
        "waterEvaporationRate": 0.01 // the chance an isolated block of water will evaporate every tick

    },
    "gameplay": {
        "maxBridgeLength": 90,
    },
    "tileTypes": {
        "water": {
            "passable": false,
        },
        "sand": {
            "flammability": 0.05,
            "burnTime": 1,
            "desirability": 0.6,
        },

        "stone": {
            "desirability": 0.4,
        },
        "marsh": {
            "flammability": 0.03,
            "burnTime": 500,
            "desirability": 0.2
        },
        "tree": {
            "flammability": 0.05,
            "burnTime": 20,
            "passable": false,
        },
        "grass": {
            "flammability": 0.1,
            "burnTime": 3,
            "desirability": 0.7,
        },
        "flower": {
            "flammability": 1,
            "burnTime": 2,
            "desirability": 0.8,
        },
        "ash": {
            "grassRegrowthSpeed": 0.001, // chance of regrowth per tick, per neighbouring grass tile
            "desirability": 0.1,
        },
        "mud": {
            "grassRegrowthSpeed": 0.003, // chance of regrowth per tick, per neighbouring grass tile
            "desirability": 0.2,
        },
        "bridge": {
            "flammability": 0.1,
            "burnTime": 15,
        },
    }

}
