#!/usr/bin/env python3
import sqlite3
from datetime import datetime
def getDefectionData():
    sqliteConnection = sqlite3.connect("./data/councillors.db")
    cursor = sqliteConnection.cursor()

    cursor.execute("""
    SELECT * FROM defectionEvents
    WHERE certainty is 'HIGH'
    ORDER BY date DESC
    """)

    defectionEvents = cursor.fetchall()

    defectionEventsJSON = []

    for event in defectionEvents:
        json = {
            "defectionid": event[0],
            "council": event[2],
            "councillorName": event[3],
            "partyFrom": event[4],
            "partyTo": event[5],
            "rawPartyFrom": event[6],
            "rawPartyTo": event[7],
            "date": datetime.strptime(event[8], '%Y-%m-%d'),
        }
        json['prettyDate'] = json['date'].strftime('%b %d')

        defectionEventsJSON.append(json)

    return defectionEventsJSON
