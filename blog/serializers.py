from rest_framework import serializers
from .models import Topic, TopicCategory, Blog, Bookmark


class TopicCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = TopicCategory
        fields = '__all__'  


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Topic
        fields = '__all__'


class BlogSerializer(serializers.ModelSerializer):
    topic = serializers.StringRelatedField(many=True)

    class Meta:
        model  = Blog
        fields = ['id', 'title', 'text', 'topic', 'url']


class BlogBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Bookmark
        fields = '__all__'  