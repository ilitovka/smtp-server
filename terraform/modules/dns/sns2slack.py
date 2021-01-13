import urllib3
import json
import os

http = urllib3.PoolManager()

def lambda_handler(event, context):
    url      = os.environ['slack_url']
    channel  = os.environ['slack_channel']
    username = os.environ['slack_username']
    sns  = json.loads(event['Records'][0]['Sns']['Message'])
    
    if sns["NewStateValue"] == "OK":
        scolor = "#36a64f"
    else:
        scolor = "#FF0000"

    stext = sns["Trigger"]["Namespace"]+"/"+sns["Trigger"]["MetricName"]+"\n"+sns["AlarmDescription"]+"\n\n"
    stext2 = "Status is changed from \""+sns["OldStateValue"]+"\" to \"*"+sns["NewStateValue"]+"*\""
    msg = {
        "channel": channel,
        "username": username,
        "text": stext,
        "attachments": [
            {
                "text": stext2,
                "color": scolor,
            }
        ],
        "icon_emoji": ""
    }
    
    encoded_msg = json.dumps(msg).encode('utf-8')
    resp = http.request('POST',url, body=encoded_msg)
    print({
        "message": event['Records'][0]['Sns']['Message'], 
        "status_code": resp.status, 
        "response": resp.data
    })