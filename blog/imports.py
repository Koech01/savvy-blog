import os
import time
import json
import requests
from django.db import transaction
from .models import TopicCategory, Topic


def addingTopicCategoriesAndTopicsToDb():
    jsonFilePath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/topics.json')

    with open(jsonFilePath, 'r') as file:
        data = json.load(file)

    for categoryData in data:
        categoryName = categoryData['name']
        topics       = categoryData['topics']
        
        topicCategory, created = TopicCategory.objects.get_or_create(name=categoryName)
        topicCategory.save()

        for topicName in topics:
            topic, created = Topic.objects.get_or_create(name=topicName)
            topic.category.add(topicCategory)


@transaction.atomic
def requestHandler():
    USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    LANGUAGE   = "en-US,en;q=0.5"
    session    = requests.Session()
    session.headers['User-Agent']       = USER_AGENT
    session.headers['Accept-Language']  = LANGUAGE
    session.headers['Content-Language'] = LANGUAGE


@transaction.atomic
def scrapeWithThrottle(url):
    delay    = 0.5 # Unit time in seconds
    response = requests.get(url)
    time.sleep(delay)
    
    return response.text


@transaction.atomic
def paragraphExtracter(section):
    paragraphs = []
    pTags = section.find_all('p')

    for pTag in pTags:
        paragraph = pTag.get_text().strip()  
        if paragraph:  
            paragraphs.append(paragraph)

    formattedTxt = "\n\n".join(paragraphs) + "\n"  
    return formattedTxt