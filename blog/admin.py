from django.contrib import admin
from .models import TopicCategory, Topic, Blog, BlogEmailRecord, SiteUrlPage, SiteError, Bookmark


# Register your models here.
admin.site.register(Blog)
admin.site.register(Topic)


class TopicCategoryAdmin(admin.ModelAdmin):
  list_display = ("id", "name")
admin.site.register(TopicCategory, TopicCategoryAdmin)


class BlogEmailRecordAdmin(admin.ModelAdmin):
  list_display = ("blog", "user", "created")
admin.site.register(BlogEmailRecord , BlogEmailRecordAdmin)


class SiteUrlPageAdmin(admin.ModelAdmin):
  list_display = ("url", "scraped")
admin.site.register(SiteUrlPage , SiteUrlPageAdmin)


class BookmarkAdmin(admin.ModelAdmin):
  list_display = ("user", "blog", "created")
admin.site.register(Bookmark , BookmarkAdmin)


class SiteErrorAdmin(admin.ModelAdmin):
  list_display = ("id", "url")
admin.site.register(SiteError , SiteErrorAdmin)