#!/usr/bin/env python3
#
import requests
from urllib.parse import urlparse
from requests.auth import HTTPBasicAuth

query = 'national'
fetchItems = 20
apikey =  "cede43d9-f791-46df-ac00-8efbec44f039"
headers = {'Authorization': 'Basic ' + apikey}

searchUrl = urlparse(f'https://api.company-information.service.gov.uk/search/companies?q={query}&items_per_page={fetchItems}')
result = requests.get(searchUrl.geturl(), auth=HTTPBasicAuth(apikey, ''))
print(result.json())
