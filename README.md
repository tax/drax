#Drax dashboard

Drax is a python and react implementation of the beautiful [dashing](http://shopify.github.io/dashing/) app. I created this project to develop my [react](http://facebook.github.io/react/index.html) and  [tornado](http://www.tornadoweb.org/) skills.

## How to use drax
After you installed drax run the following commands:

```
    $ drax init mydashboard
    $ cd mydashboard
    $ drax start
```

Now a new dashboard is available on http://localhost:8888/


Every project comes with some base widgets and an example dashboard. The directory is setup as follows:

* **Assets** - All your images, fonts, and javascript libraries.
* **Dashboards** - One html file for each dashboard that contains the layout for the widgets. The default dashboard is defined in *index.html*.
* **Jobs** - The python jobs for fetching data to sent to your widgets.
* **Widgets** - All the jsx and css files for individual widgets.


## How to create a dashboard
By editing the *index.html* file in the *templates* directory: 

```javascript
  React.render(
    <Dashboard>
      <Clock widgetid="clock" row={1} col={1}/>
      <HeartBeat widgetid="hearthbeat" row={1} col={1}/>
      <Text widgetid="mywidget3" row={1} col={4} initialTitle="This is the title" initialText="This is my initial text...."/>
      <List widgetid="mylist" row={1} col={3} sizey={2}/>
      <Number widgetid="valuation" row={2} col={1} initialTitle="Current valuation" initialInfo="In billions"/>
      <Meter widgetid="synergy" initialTitle="Synergy" initialValue={10} min={0} max={100} row={2} col={2}/>
      <Image widgetid="image" row={2} col={4} src="http://dashingdemo.herokuapp.com/assets/logo.png"/>
    </Dashboard>,
    document.getElementById('dashboard'));
```

If you want to add more dashboards copy *index.html* to a new html file in the templates directory and edit that file.

If you created a new dashboard *status.html* it will be available on http://localhost:8888/status **(Notice that this is without the ".html")**.


## How get data into widgets
Your widgets can be updated directly over HTTP. Post the data you want in json to /widgets/widget_id. 
Example

```
curl -d '{ "auth_token": "YOUR_AUTH_TOKEN", "text": "Some new text..."}' http://localhost:8888/widgets/text
```
or a python example:

```python
import json
import requests

url = 'http://localhost:8888/widgets/text'
data = {
    'auth_token': 'YOUR_AUTH_TOKEN',
    'text': 'Some new text...',
    'id': 'text'
}

requests.post(url, data=json.dumps(data))

```

## How to create a job
Every file with the .py extension in the jobs folder is loaded as a job and executed periodically. 

Each job needs to define a function named *callback* (the actual job) and a variable *callback_time* that defines the time in milliseconds of the frequency the job is executed.

An example of a job executing every 30 seconds:
```python
import json
from tornado.httpclient import AsyncHTTPClient

# callback function is called every 30 seconds
callback_time = 3000


def get_myapi_data():
    # Add logic to fetch data from somewhere
    data = 'This is some data loaded from somewhere...'
    return data


def callback():
    data = {
        'auth_token': 'YOUR_AUTH_TOKEN',
        # the id of the widget you want to post the data to
        'id': 'text',
        'title': 'Some Info:',
        'icon': 'icon-star',
        'text': get_myapi_data()
    }
    payload = json.dumps(data)
    print payload
    url = 'http://localhost:8888/widgets/text'

    # Using tornado async client
    client = AsyncHTTPClient()
    client.fetch(url, None, method='POST', headers=None, body=payload)
```



## Installation
Installing drax is easy with pip:

```
    $ pip install drax
```

## Developing
To run tests:
```
    $ python test.py
```
Tested with python 2.7

[![Build Status](https://travis-ci.org/tax/drax.svg?branch=master)](https://travis-ci.org/tax/drax)