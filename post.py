import requests

data = '{ "auth_token": "YOUR_AUTH_TOKEN", "text": "HHalllo" ,"id":"mywidget"}'
r = requests.post('http://localhost:8888/publish', data=data)
print r.status_code
print "|"+r.content+"|"