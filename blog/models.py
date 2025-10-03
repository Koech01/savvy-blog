from django.db import models
from profiles.models import Profile


class TopicCategory(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        ordering = ['name']  

    def __str__(self):
        return f"{self.name}"


class Topic(models.Model):
    name     = models.CharField(max_length=50)
    users    = models.ManyToManyField(Profile, blank=True)
    category = models.ManyToManyField(TopicCategory)
    updated  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"
    
    class Meta:
        ordering = ['name']  


class Blog(models.Model):
    title = models.CharField(max_length=200)
    text  = models.TextField(max_length=5000)
    topic = models.ManyToManyField(Topic)
    url   = models.CharField(max_length=200)

    def __str__(self):
        topics = ', '.join([topic.name for topic in self.topic.all()])
        return f"{topics} -- {self.title}"
    
    class Meta:
        ordering = ['topic__name']


class SiteUrlPage(models.Model):
    url     = models.CharField(max_length=200)
    topic   = models.ManyToManyField(Topic)
    scraped = models.BooleanField(default=False)

    class Meta:
        ordering = ['url']


class SiteError(models.Model):
    url = models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.url}"
    

class BlogEmailRecord(models.Model):
    blog    = models.ForeignKey(Blog, on_delete=models.CASCADE)
    user    = models.ForeignKey(Profile, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    

class Bookmark(models.Model):
    user    = models.ForeignKey(Profile, on_delete=models.CASCADE)
    blog    = models.ForeignKey(Blog, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.blog}"