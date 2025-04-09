from bs4 import BeautifulSoup
from urllib.parse import quote
from django.db import transaction
from django.db.models import Count
from profiles.models import Profile
from blog.models import Topic, Blog, SiteUrlPage, SiteError
from blog.imports import requestHandler, scrapeWithThrottle, paragraphExtracter


@transaction.atomic
def createSitePageUrlObjs(pageUrlObjs, leastBlogTopic):
    for url in pageUrlObjs:
        sitePageUrlItem, created = SiteUrlPage.objects.get_or_create(url=url)
        if created:
            sitePageUrlItem.topic.set([leastBlogTopic])
            sitePageUrlItem.save()
  
        if not created: sitePageUrlItem.topic.set([leastBlogTopic])
        else: sitePageUrlItem.topic.add(leastBlogTopic)


@transaction.atomic
def createBlogObj(url, topic):
    response = scrapeWithThrottle(url)
    soup     = BeautifulSoup(response, 'html.parser')
    title    = soup.find('h1', attrs={"class" : "header-default__title___ychM4"}) 
    section  = soup.find('div', attrs={"class" : "rich-text"}) 
    
    if section and title:
        topicTitle = title.text.strip()
        topicText  = paragraphExtracter(section).strip()

        if topicTitle and topicText and len(topicText) >= 3000:
            blogObj = Blog.objects.filter(title=topicTitle, topic=topic).first()

            if blogObj:
                blogObj.text = topicText
                blogObj.topic.set([topic])
                blogObj.url  = url.url
                blogObj.save()
                print("existing-blog: ", blogObj.title)
            else:
                newBlog = Blog(title=topicTitle, text=topicText, url=url)
                newBlog.save()
                newBlog.topic.set([topic])
                print(topic.name, " new-blog: ", newBlog.title)
        else:
            pass
        

@transaction.atomic
def sciencenewScraper(request):
    requestHandler()
    searchUrl        = "https://www.sciencenews.org/"
    leastBlogTopic   = Topic.objects.annotate(blog_count=Count('blog')).order_by('blog_count').first()
    topicSitePageUrl = SiteUrlPage.objects.filter(url__contains = searchUrl, topic=leastBlogTopic, scraped=False).first()

    if leastBlogTopic:
        cleanedTopic = leastBlogTopic.name.strip().replace("&", " ")
        encodedTopic = quote(cleanedTopic)       
        url          = f"{searchUrl}?s={encodedTopic}=&start-date=&end-date=&orderby=relevance"
        response     = scrapeWithThrottle(topicSitePageUrl.url) if topicSitePageUrl else scrapeWithThrottle(url)
        soup         = BeautifulSoup(response, 'html.parser')
        parentDiv    = soup.find('ol', attrs={ "class" : "list" })
        pagesList    = soup.find('nav', attrs={ "class" : "pagination__wrapper___M-SaE" })
        lastPageNum  = int([item.text.strip() for item in pagesList.find_all('a', attrs={"class" : "page-numbers"})][-2])
        noResult     = soup.find('p', attrs={ "class" : "search__not-found___FtRJn" })
        articleItems = parentDiv.find_all('li', attrs={ "class" : "post-item-river__wrapper___Nv-Ol"})
        blogUrls     = [item.find('a')['href'] for item in articleItems]
        newBlogUrls  = [link for link in blogUrls if link not in Blog.objects.filter(topic=leastBlogTopic, url__contains=searchUrl).values_list('url', flat=True)]
        siteUrlObjs  = SiteUrlPage.objects.filter(topic=leastBlogTopic, url__contains = searchUrl).values_list('url', flat=True)
        sitePageUrls = [urlTag.get('href') for urlTag in pagesList.find_all('a')[:-1]]
        pageUrlObjs  = [link for link in sitePageUrls if link not in siteUrlObjs][:11]
        scrapedUrl   = topicSitePageUrl.url if topicSitePageUrl else url
        
        if newBlogUrls: 
            for blogUrl in newBlogUrls[:11]: 
                createBlogObj(url=blogUrl, topic=leastBlogTopic)
        else:
            topicSitePageObj, created = SiteUrlPage.objects.get_or_create(url=scrapedUrl)
            topicSitePageObj.scraped = True
            topicSitePageObj.save()

        if lastPageNum > 1 and parentDiv: 
            if pageUrlObjs: 
                createSitePageUrlObjs(pageUrlObjs, leastBlogTopic)

        elif noResult is None:
            print("No results found.")
            topicSitePageObj, created = SiteUrlPage.objects.get_or_create(url=scrapedUrl)
            topicSitePageObj.scraped = True
            topicSitePageObj.save()
            
        if not parentDiv and noResult is None:
            error = SiteError(url=searchUrl)
            error.save()
    else:
        pass