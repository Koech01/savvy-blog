from bs4 import BeautifulSoup
from urllib.parse import quote
from django.db import transaction
from django.db.models import Count
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
    titleDiv = soup.find('div', attrs={"class" : "news-article"}) 
    section  = soup.find('div', attrs={"id" : "article-body"}) 
    
    if section and titleDiv:
        topicTitle = titleDiv.find('h1').text.strip()
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
def livescienceScraper(request):
    requestHandler()
    searchUrl        = "https://www.livescience.com/"
    leastBlogTopic   = Topic.objects.annotate(blog_count=Count('blog')).order_by('blog_count').first()
    topicSitePageUrl = SiteUrlPage.objects.filter(url__contains = searchUrl, topic=leastBlogTopic, scraped=False).first()

    if leastBlogTopic:
        cleanedTopic = leastBlogTopic.name.strip().replace("&", " ")
        encodedTopic = quote(cleanedTopic)       
        url          = f"{searchUrl}search?searchTerm={encodedTopic}"
        response     = scrapeWithThrottle(topicSitePageUrl.url) if topicSitePageUrl else scrapeWithThrottle(url)
        soup         = BeautifulSoup(response, 'html.parser')
        parentDiv    = soup.find('div', attrs={ "class" : "listingResults" })
        pageList     = soup.find('ul', attrs={ "class" : "pagination-numerical-list" })
        lastPageNum  = int([item.text.strip() for item in pageList.find_all('li', attrs="pagination-numerical-list-item")[:-1]][-1])
        noResult     = soup.find('div', attrs={ "class" : "listingNoResultsPlaceholder" })
        articleDiv   = parentDiv.find_all('div', attrs={"class" : "listingResult"})  
        blogUrls     = [articleLink.find('a')['href'] for articleLink in articleDiv]
        newBlogUrls  = [link for link in blogUrls if link not in Blog.objects.filter(topic=leastBlogTopic, url__contains=searchUrl).values_list('url', flat=True)]
        siteUrlObjs  = SiteUrlPage.objects.filter(topic=leastBlogTopic, url__contains = searchUrl).values_list('url', flat=True)
        sitePageUrls = [urlTag.get('href') for urlTag in pageList.find_all('a')[:-1]]
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
            if pageUrlObjs: createSitePageUrlObjs(pageUrlObjs, leastBlogTopic)

        elif noResult and noResult.get_text().strip() == f'No results for {cleanedTopic}':
            print("No results found.")
            topicSitePageObj, created = SiteUrlPage.objects.get_or_create(url=scrapedUrl)
            topicSitePageObj.scraped = True
            topicSitePageObj.save()
            
        if not parentDiv and not noResult:
            error = SiteError(url=searchUrl)
            error.save()
    else:
        pass