#!/usr/bin/env python3
import sqlite3
import json
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

def getCouncillorsInCouncil(councilName):

    sqliteConnection = sqlite3.connect("./data/councillors.db")
    cursor = sqliteConnection.cursor()

    # Bug 1: Used {council} instead of {councilName} (wrong variable name)
    # Bug 2: f-string with user input = SQL injection risk. Use parameterised query instead.
    # Bug 3: LIKE queries need % wildcards, or use = if you want an exact match
    cursor.execute("SELECT * FROM councillors WHERE council = ?", (councilName,))

    councillors = cursor.fetchall()
    councillorsJSON = []

    for cllr in councillors:
        # Bug 4: Variable named `json` shadows the json module if imported,
        # and more importantly, the loop overwrites it each iteration —
        # so the final `return json` only ever returns the last councillor.
        # Use a distinct name like `cllr_dict` instead.
        cllr_dict = {
            "councillor_id": cllr[0],
            "council": cllr[1],
            "councillorName": cllr[2],
            "party": cllr[3],
            "title": cllr[4],
            "ward": cllr[5],
            "imageurl": cllr[6],
            "profileurl": cllr[8],
            "rawParty": cllr[9],
            "lastUpdated": cllr[10],
            "active": cllr[11],
        }
        councillorsJSON.append(cllr_dict)

    # Bug 5: Returned `json` (the last loop variable) instead of the full list.
    # Also need to use jsonify() to return a proper JSON HTTP response.
    return councillorsJSON
