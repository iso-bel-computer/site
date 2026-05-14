export const config = {
    "gameSettings": {
        "canvasWidth": 350, // 400 best for gameplay
        "canvasHeight": 350,
        "messageTimeout": 1500, // length of time messages to the player are displayed, in ms
        "timeBetweenTicks": 50 // time in ms. 50 works well.
    },
    "worldGen": {
        "maxWaterSources": 5,
        "chanceOfOcean": 0.4,
        "waterAmount": 0, // lower for more land. higher for more water.
        "randomiseWaterLevel": false,
        "randomWaterLevelMod": [-30,20], // added on after perlin noise to bias towards more or less water. allows for waterless and drowned worlds
        "beachAmounts": 0.03, // chance of any shore tile having a beach
        "beachSize": 0.5, // value 0 to 1
        "randomiseBeaches": true,
        "bogAmounts": 0.0001,
        "bogSize": 60,
        "minForestsPerMap": 0,
        "maxForestsPerMap": 40,
        "shallowWaterRockRate": 0.0008,
        "mountainRockRate": 0.0007,
        "snowAltitude": 155, // default altutide for snow. 65 creates snow capped mountains
        "snowWorldChance": 0.05, // random 1% chance for any world to be covered in snow
        "beehiveChanceInTree": 0.0001, // chance any tree tile is replaced with a beehive

    },
    "viewSettings": {
        "contourInterval": 15,
        "contourThickness": 2,
        "contourDarkness": 45,
        "gridInterval": 40,
        "gridOffset": 20,
        "maxZoom": 10,
        "minZoom": 1,

    },
    "worldBehaviour": {
        "grassGrowAcrossHeightDifference": 5, // how close in elevation two tiles have to be for grass to grow beteween them
        "waterEvaporationRate": 0.003, // the amount of water that comes off a block every tick

    },
    "gameplay": {
        "maxBridgeLength": 90,
    },
    "tileTypes": {
        "water": {
            "passable": false,
            "fertilityBoost": 0.001, // fertility is a 0-1 value. this is for every neighbour in a four mile radius
            "neverDrawContour": false,
        },
        "sand": {
            "flammability": 0.05,
            "burnTime": 1,
            "desirability": 0.6,
            "fertilityBoost": -0.001, // fertility is a 0-1 value. this is for every neighbour in a four mile radius
            "erosionChance": 0.9
        },

        "stone": {
            "desirability": 0.4,
            "canPlantTrees": true,
            "fertilityBoost": -0.001, // fertility is a 0-1 value. this is for every neighbour in a four mile radius
            "erosionChance": 0.01

        },
        "marsh": {
            "flammability": 0.002,
            "burnTime": 200,
            "desirability": 0.2,
            "canPlantTrees": true,
            "fertilityBoost": 0.005 // fertility is a 0-1 value. this is for every neighbour in a four mile radius

        },
        "tree": {
            "flammability": 0.045,
            "burnTime": 13,
            "passable": false,
            "marshSpreadSpeed": 0.000001,
            "neverDrawContour": true
        },
        "grass": {
            "flammability": 0.1,
            "burnTime": 3,
            "canPlantTrees": true,
            "desirability": 0.7,
            "marshSpreadSpeed": 0.00001,
            "erosionChance": 0.1
        },
        "flower": {
            "flammability": 1,
            "burnTime": 2,
            "desirability": 0.8,
        },
        "ash": {
            "grassRegrowthSpeed": 0.0005, // chance of regrowth per tick, per neighbouring grass tile
            "desirability": 0.1,
        },
        "mud": {
            "grassRegrowthSpeed": 0.002, // chance of regrowth per tick, per neighbouring grass tile
            "desirability": 0.2,
            "erosionChance": 0.1
        },
        "bridge": {
            "flammability": 0.1,
            "burnTime": 15,
        },
        "gorse": {
            "flammability": 0.2,
            "burnTime": 3,
        },
        "shrub": {
            "flammability": 0.3,
            "burnTime": 4,
        }
    }

}
