#!/usr/bin/env python3

import os; import json; import time; import requests; from bs4 import BeautifulSoup; import re; import urllib3; import sqlite3; import random
from statistics import mode;
with open("config/councillist.json") as f:
    councils = json.load(f)

with open("config/crawlerConfig.json") as f:
    CONFIG = json.load(f)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


sqliteConnection = sqlite3.connect(CONFIG['dbLocation']) # initialising sql
cursor = sqliteConnection.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")
sqliteConnection.commit()

# Create cllrs table
cursor.execute(CONFIG['tableSchema'])

# Create party history table
cursor.execute(CONFIG['partyHistorySchema'])

def findDataIndexes(cllrs, councilName):
    partyIndices = []
    positionIndices = []
    for cllr in cllrs:
        ps = cllr.find_all('p')

        for i, p in enumerate(ps):

            partyWords = ['labour', 'conservative', 'reform', 'green', 'liberal dem', 'independent', 'plaid cymru']
            positionWords = ['chair', 'leader', 'spokesperson', 'committee']

            if any(word in p.text.lower() for word in partyWords):
                partyIndices.append(i)

            if any(word in p.text.lower() for word in positionWords):
                positionIndices.append(i)

    if not partyIndices:
        raise Exception(f' Unable to find party indices for {councilName}')

    partyIndex = mode(partyIndices)

    if positionIndices:
        positionIndex = mode(positionIndices)
    else:
        positionIndex = None

    modifyCouncils = []
    with open("config/councillist.json", 'r') as f:
        modifyCouncils = json.load(f)
        for modifyCouncil in modifyCouncils:
            if modifyCouncil['name'] == councilName:
                modifyCouncil['partyIndex'] = partyIndex
                modifyCouncil['positionIndex'] = positionIndex
                break
    with open("config/councillist.json", 'w') as f:
        f.write(json.dumps(modifyCouncils, indent=4))

    return partyIndex, positionIndex

def normaliseParty(rawName):
    name = rawName.lower().strip()
    stripWords = ['party', 'the', 'and', 'group', 'welsh', 'co-operative', 'cooperative']
    for word in stripWords:
        name = re.sub(rf'\b{word}\b', '', name)
    name = re.sub(r'[&()\-]', '', name)  # remove punctuation separately
    name = re.sub(r'\s+', ' ', name).strip()  # collapse extra whitespace

    partyMap = {
        'labour / llafur cymru': 'labour',
        'scottish labour': 'labour',
        'labour/llafur cymru': 'labour',
        'llafur cymru / labour': 'labour',
        'conservatives': 'conservative',
        'conservative unionist': 'conservative',
        'conservatives / ceidwadwyr cymreig': 'conservative',
        'local conservative': 'conservative',
        'scottish conservatives': 'conservative',
        'scottish conservative unionist': 'conservative',
        'scottish national': 'snp',
        'local conservatives': 'conservative',
        'liberal democrat': 'liberal democrats',
        'liberal democrats / democratiaid rhyddfrydol cymru': 'liberal democrats',
        'scottish liberal democrat': 'liberal democrats',
        'scottish green': 'green', #they're different orgs but we keep the raw name
        'scottish liberal democrats': 'liberal democrats',
        'your': 'your party', # this is silly but 99% of the time your will have been 'your party' stripped out
        'of women': 'party of women', # terf island
        'reform uk': 'reform',
        'plaid cymru of wales': 'plaid cymru',
        # etc.
    }

    name = partyMap.get(name.lower().strip(), name)

    if 'independent' in name:
        name = 'independent'

    return name

fetchedCllrs = 0


for council in councils:

    try:
        page = requests.get(council['url'] + '/mgMemberIndex.aspx', headers=CONFIG['headers'], timeout=20, verify=False)

        if page.status_code != 200:
            raise Exception(f" Bad status {page.status_code} for {council['url']}")
        else:

            soupedPage = BeautifulSoup(page.text, 'html.parser')
            cllrContainer = soupedPage.find('div', class_='mgThumbsList')
            if not cllrContainer:
                raise Exception(f' No councillor div found')
            cllrs = cllrContainer.find_all('li')
            if not cllrs:
                raise Exception(f' No councillors found in cllr div')

            if council.get('positionIndex') is None or council.get('partyIndex') is None:
                partyIndex, positionIndex = findDataIndexes(cllrs, council['name'])
                council['partyIndex'] = partyIndex
                council['positionIndex'] = positionIndex

        for cllr in cllrs:
            ps = cllr.find_all('p')
            if not ps:
                continue
            if len(ps) < 2:
                continue
            profileLink = council['url'] + cllr.find('a', href=True)['href']
            imageLink = council['url'] + cllr.find('img')['src']
            cllrName = cllr.find('a').text
            ward    = ps[0].text.strip() if len(ps) > 0 else ''
            rawParty    = ps[council['partyIndex']].text if len(ps) > council['partyIndex'] else ps[1].text
            party = normaliseParty(rawParty)

            if council['positionIndex']:
                position = ps[council['positionIndex']].text if len(ps) > council['positionIndex']  else None
            else:
                position = 'Unknown'

            cursor.execute("SELECT * FROM councillors WHERE name = ? AND council = ?", (cllrName, council['name']))
            row = cursor.fetchone()

            # defection detection logic lives here
            if row:
                councillor_id = row[0]
                previousParty = row[8]
                if previousParty != rawParty:
                    print(f'   > Defection detected! {cllrName}: {previousParty} -> {rawParty}')

            # adding new cllrs logic lives here
            else:
                cursor.execute("""
                    INSERT INTO councillors (council, name, party, title, ward, image, profileLink, rawParty)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (council['name'], cllrName, party, position, ward, imageLink, profileLink, rawParty))
                councillor_id = cursor.lastrowid

            fetchedCllrs += 1

        print(f" > {fetchedCllrs} ✔ Fetched {council['name']}")
        sqliteConnection.commit()
    except Exception as e:
        print(f' > Exception fetching {council["name"]}: {e}')

print(f"\nCrawl complete. Fetched {fetchedCllrs} cllrs.")

sqliteConnection.close()
