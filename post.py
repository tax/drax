import requests

data = '{ "auth_token": "YOUR_AUTH_TOKEN", "text": "HHalllo" }'
r = requests.post('http://localhost:8000/publish', data=data)
print r.status_code
print "|"+r.content+"|"