#!/usr/bin/env python3
from bs4 import BeautifulSoup
import requests
import re
import json
import time
import os
import random
import datetime
import dcolors
from io import BytesIO
from PIL import Image
from colorist import bg_hex

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
readingLog = '../static/resources/data/reading.json'
url="https://www.goodreads.com/review/list/63239304-dylanhemmings1?shelf=read&view=covers&per_page=20&page="
maxPagesToFetch = 10
refreshAll = True
bookData = []

if not refreshAll:
    try:
        with open(readingLog, 'r') as f:
            bookData = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        bookData = []  # Start with empty list if file is missing or empty/invalid

pageNo = 1

while pageNo < maxPagesToFetch:
    page = requests.get(url + str(pageNo), headers=headers)
    soup = BeautifulSoup(page.text, 'html.parser') if page else 'Unknown'
    booksTable = soup.find(id="booksBody")
    bookRows = soup.find_all(attrs={'class':'bookalike review'})

    if 'no matching items' in soup.text.lower():
                break

    for row in bookRows:

        def cleanValue(value):
            value = value.text
            textReplacements = ['title', '\n', 'num pages', 'isbn13', 'isbn', 'pp', 'date read', 'author', '*']
            reSubs = [r':.*', # this replaces anything following : or ( - title subtitles
                    r'^review', # replaces the word review, but only if at the beginning of a line
                    r'\(.*',
                    r'(?<=\?).*']
            for string in textReplacements:
                value = value.replace(string, '')

            for regex in reSubs:
                value = re.sub(regex, '', value)

            value = value.strip()
            return value
        def authorProcess(author):
            split = author.split(',')
            split.reverse()
            newAuthor = ' '.join(split)
            return newAuthor.strip()
        def dateProcess(date):
            split = date.replace(',','').split()
            if len(split) < 3:
                split.insert(1, 1)  # if there's no date then we set the date to 1
            dd = int(split[1])
            mm = 0
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            for i, month in enumerate(months):
                if split[0] == month:
                    mm = i + 1
            yyyy = int(split[2])

            newDate = datetime.datetime(yyyy, mm, dd)
            return newDate
        def bookInList(title):
            return any(title  == comparison['title'] for comparison in bookData)
        def getCoverColors(imageUrl):
            try:
                time.sleep(1)
                tmpPath = 'tmp'
                response = requests.get(imageUrl, headers=headers, timeout=10)
                response.raise_for_status()

                # Save to tmp file
                with open('tmp', 'wb') as img_file:
                    img_file.write(response.content)

                # Extract colors using dcolorz
                colors = list(dcolors.colorz(tmpPath, n=5))

                return colors
            except Exception as e:
                print(e)
                return
            finally:
                os.remove('tmp')

        title = cleanValue(row.find(attrs={'class':"field title"}))

        if bookInList(title):
            break

        pages = int(cleanValue(row.find(class_="field num_pages")))
        author = authorProcess(cleanValue(row.find(class_='field author')))
        isbn = cleanValue(row.find(class_='field isbn'))
        isbn13 = cleanValue(row.find(class_='field isbn13'))
        readDate = dateProcess(cleanValue(row.find(class_='field date_read')))

        coverImgLink = row.find(class_='field cover').find('img').attrs['src']
        coverColours = getCoverColors(coverImgLink)

        print(title.ljust(80), str(pages).ljust(5), author.ljust(40), readDate.strftime('%d/%m/%Y').ljust(20), isbn.ljust(12), isbn13)
        for i, color in enumerate(coverColours):
            bg_hex(f"{i}                                             ", color)



        coloursInput = False
        while not coloursInput:
            try:
                mainColor = coverColours[int(input  ('Select main color    > '))]
                bg_hex(f'Selected {mainColor}' + ' ' * 100, mainColor)
                accentColor = coverColours[int(input('Select accent color  > '))]
                bg_hex(f'Selected {accentColor}' + ' ' * 100, accentColor)
                print('\n')
                coloursInput = True
            except Exception as e:
                print(e)
                print('Invalid entry. Try again')

        fontInput = False
        while not fontInput:
            fontStyle = input('Input s for Serif font, or ss for non serif. Enter to randomize. >')
            if fontStyle == '':
                rand = random.randint(0, 1)
                if rand == 0:
                    fontStyle = 's'
                else:
                    fontStyle = 'ss'
            if fontStyle in ('ss', 's'):
                fontInput = True
            else:
                print('Invalid input. Try again...')

        bookDataObj = {
            'title': title,
            'pages': pages,
            'author': author,
            'isbn': isbn,
            'isbn13': isbn13,
            'readDate': readDate.strftime('%Y/%m/%d'),
            'coverColours': coverColours,
            'mainColor': mainColor,
            'accentColor': accentColor,
            'fontStyle': fontStyle,
        }

        bookData.append(bookDataObj)

    pageNo = pageNo + 1
    time.sleep(1)

def returnDate(book):
    return book['readDate']
bookData.sort(reverse=True, key=returnDate)

with open(readingLog, 'w') as f:
    json.dump(bookData, f)
