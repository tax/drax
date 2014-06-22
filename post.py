import requests
from random import randint
data = '{ "auth_token": "YOUR_AUTH_TOKEN", "text": "HHalllo" ,"id":"valuation","current":'+str(randint(0,100))+'}'
r = requests.post('http://localhost:5000/widgets/hb', data=data)
print r.status_code
# print "|"+r.content+"|"
data = '{ "auth_token": "YOUR_AUTH_TOKEN", "value":'+str(randint(0,100))+' ,"id":"synergy"}'
r = requests.post('http://localhost:5000/widgets/synergy', data=data)

# data = '{ auth_token": "YOUR_AUTH_TOKEN", "text": "nununu"}'
# r = requests.post('http://localhost:3030/widgets/welcome', data=data)
# print r.status_code
# print "|"+r.content+"|"

