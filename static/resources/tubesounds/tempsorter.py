#!/usr/bin/env python3
import csv
import json

stationsObj = {}

with open('tubelocationdata.csv') as f:
    reader = csv.reader(f)
    reader.__next__()
    for row in reader:
        stationName = row[5]
        pan = row[2]
        stationsObj[stationName] = {'pan': pan }

with open('stationData.json', 'w') as f:
    json.dump(stationsObj, f)
