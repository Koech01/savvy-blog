import linkIcon from '../assets/link.svg';
import css from '../Blog/index.module.css';
import heartIcon from '../assets/heart.svg';
import { useAuth } from '../Auth/authContext';  
import linkDarkIcon from '../assets/linkDark.svg';
import { type ProfileProps } from '../types/index';
import heartDarkIcon from '../assets/heartDark.svg';
import heartFilledIcon from '../assets/heartfilled.svg';
import blogDarkInfoIcon from '../assets/blogDarkInfoIcon.svg';
import blogLightInfoIcon from '../assets/blogLightInfoIcon.svg';
import heartFilledDarkIcon from '../assets/heartfilledDark.svg';
import React, { useEffect, useState, type SVGProps, useRef } from 'react';


interface BlogObj {
  id    : number;
  title : string;
  text  : string;
  topic : string[];
  url   : string;
}


const FadeInSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domRef                  = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        observer.unobserve(domRef.current!);
      }
    });
    observer.observe(domRef.current!);
    return () => observer.disconnect();
  }, []);

  return (<div ref={domRef} className={`${css.blogItem} ${isVisible ? css.blogVisible : ''}`}>{children}</div>);
};


const SVGComponent: React.FC<SVGProps<SVGSVGElement>> = ({ }) => (
  <svg
    className           = {css.loaderParent}
    x                   = "0px" 
    y                   = "0px"
    width               = "55"
    height              = "23.1"
    viewBox             = "0 0 55 23.1"
    preserveAspectRatio = 'xMidYMid meet'
  >
    <path
      className   = {css.loaderTrack}
      fill        = "none" 
      strokeWidth = "4" 
      pathLength  = "100"
      d           = "M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z"
    />

    <path
      className   = {css.loaderCar}
      fill        = "none" 
      strokeWidth = "4" 
      pathLength  = "100"
      d           = "M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z"
    />
  </svg>
);


const Blog: React.FC<ProfileProps> = ({ profile }) => {
  
  const { accessToken }                          = useAuth();
  const [profileBlogContent, setProfBlogContent] = useState<BlogObj[]>([]);
  const [blogContent, setBlogContent]            = useState<BlogObj[]>([]);
  const [bookmarkBlogs, setBookmarkBlogs]        = useState<BlogObj[]>([]);
  const [activeTab, setActiveTab]                = useState<'Explore'|'Home'|'Bookmarks'>('Home'); 
  const [loading, setLoading]                    = useState(true);
  const [selectedBlog, setSelectedBlog]          = useState<BlogObj | null>(null);
  const [bookmarkBlogIds, setBookmarkBlogIds]    = useState<number[]>([]); 
  const [visibleBlogsCount, setVisibleBlogsCount] = useState(25);


  const handleLoadMore = () => { setVisibleBlogsCount(prevCount => prevCount + 25); };


  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/explore/blogs/', {
          method      : 'GET',
          headers     :  { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        if (response.ok) {
          const blogObjs = await response.json();
          setBlogContent(blogObjs); 
        } else { console.error('Failed to fetch blogs:', response.status); }
      } 
      catch (error) { console.error('Error fetching blogs:', error); } 
      finally { setLoading(false); }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/user/blogs/', {
          method      : 'GET',
          headers     :  { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        if (response.ok) {
          const profileBlogObjs = await response.json();
          setProfBlogContent(profileBlogObjs); 
        } else { console.error('Failed to fetch user blogs:', response.status); }
      } 
      catch   (error) { console.error('Error fetching user blogs:', error);   } 
      finally { setLoading(false); }
    })();
  }, []);


  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/user/bookmarks/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        if (response.ok) {
          const bookmarkBlogObjs = await response.json();
          setBookmarkBlogs(bookmarkBlogObjs); 
        } else { console.error('Failed to fetch user blogs:', response.status); }
      } 
      catch (error) { console.error('Error fetching user blogs:', error); } 
      finally { setLoading(false); }
    })();
  }, []);


  const handleBookmarkToggle = async (blogId: number) => {
    try { 
      const response = await fetch(`/api/v1/blog/${blogId}/bookmark/`, {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
      });

      if (response.ok) {
        const isBookmarked = bookmarkBlogIds.includes(blogId);
  
        if (isBookmarked) {
          setBookmarkBlogIds(bookmarkBlogIds.filter(id => id !== blogId));
        } else {
          setBookmarkBlogIds([...bookmarkBlogIds, blogId]);
        }
  
        if (isBookmarked) {
          setBookmarkBlogs(bookmarkBlogs.filter(blog => blog.id !== blogId));
        } else {
          const blogToAdd = blogContent.find(blog => blog.id === blogId);
          if (blogToAdd) {
            setBookmarkBlogs([...bookmarkBlogs, blogToAdd]);
          }
        }
      } else { console.error('Failed to toggle bookmark:', response.status); }
    } 
    catch (error) { console.error('Error toggling bookmark:', error); }
  };
  

  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/user/bookmarks/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });
  
        if (response.ok) {
          const bookmarkBlogObjs: { id: number }[] = await response.json(); 
          const bookmarkedIds = bookmarkBlogObjs.map(blog => blog.id);
          setBookmarkBlogIds(bookmarkedIds);
          
        } else { console.error('Failed to fetch user bookmarks:', response.status); }
      } catch (error) { console.error('Error fetching user bookmarks:', error); }
    })();
  }, []);


  const handleBlogClick  = (blog: BlogObj) => {setSelectedBlog(blog);};
 

  const handleBackToTabs = () => { setSelectedBlog(null);};


  const handleBlogIconClick = (url: string) => { window.location.href = url; };

  
  return (
    <div className={`${css.blogParentDiv} ${profile.displayTheme === 'dark' ? css.darkTheme : css.lightTheme}`}>

      <div className={`${css.mobileTabBar} ${css.TabBar}`}>
        {!selectedBlog && (
          <a 
            className = {`${css.TabBarItem} ${activeTab === 'Explore' ? css.active : ''}`} 
            onClick   = {() => setActiveTab('Explore')}
          >
            Explore
          </a>
        )} 

        {!selectedBlog && (
          <a 
            className = {`${css.TabBarItem} ${activeTab === 'Home' ? css.active : ''}`} 
            onClick   = {() => setActiveTab('Home')}
          >
            Home
          </a>
        )} 

        {profile.favourites && !selectedBlog && (
          <a 
            className = {`${css.TabBarItem} ${activeTab === 'Bookmarks' ? css.active : ''}`} 
            onClick   = {() => setActiveTab('Bookmarks')}
          >
            Bookmarks
          </a>
        )} 

        <div className={`${selectedBlog ? css.blogMobileblogCloseBtnDiv : '' }`}>
        {selectedBlog && (<button className={css.blogCloseBtn} onClick={handleBackToTabs}>Close</button>)} 
        </div> 
      </div>

      <div 
        className = {css.blogExploreParentDiv}
        style     = {{ display: activeTab === 'Explore' && !selectedBlog ? '' : 'none' }}
      >
        {loading ? (  
          <div className={css.loaderParentDiv}><SVGComponent className={css.loaderParent}/></div>
        ) : (
          blogContent.slice(0, visibleBlogsCount).map((blog, index) => (
            <FadeInSection key={index}>
              <div className={css.blogHomeChildDiv}>
                <div className={css.blogChildDiv}>
                  <h5 className={css.blogTitle} onClick={() => handleBlogClick(blog)}>{blog.title}</h5>
                  <p className={css.blogText}>
                    {blog.text.split(' ').slice(0, 50).join(' ')}{blog.text.split(' ').length > 50 ? '  . . .' : ''}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))
        )} 

        {visibleBlogsCount < blogContent.length && !loading && ( 
          <div className={css.blogLoadMoreDiv}><button className={css.blogLoadMoreBtn} onClick={handleLoadMore}>Load More</button></div> 
        )}
      </div>

      <div 
        className = {css.blogBookmarkParentDiv}
        style     = {{ display: activeTab === 'Home' && !selectedBlog ? '' : 'none' }}
      >

        {loading ? (  
          <div className={css.loaderParentDiv}><SVGComponent className={css.loaderParent}/></div>
        ) : profileBlogContent.length === 0 ? (
          <div className={css.blogPlaceHolder}>
            <div className={css.blogPlaceHolderHeaderDiv}> 
              <img  
                alt        = "blog-info-icon"
                className  = {css.blogPlaceHolderIcon}  
                src        = {profile.displayTheme === 'light' ? blogLightInfoIcon : blogDarkInfoIcon} 
              />
              <p className={css.blogPlaceHolderHeader}>Choose Your Interests !</p>
            </div>

            <p className={css.blogPlaceHolderText}>
              You haven't selected any topics yet, which is why you're not seeing any blogs.
            </p>
          </div>
        ) : (
          profileBlogContent.slice(0, visibleBlogsCount).map((blog, index) => (
            <FadeInSection key={index}>
              <div className={css.blogHomeChildDiv}>
                <div className={css.blogChildDiv}>
                  <h5 className={css.blogTitle} onClick={() => handleBlogClick(blog)}>{blog.title}</h5>
                  <p className={css.blogText}>
                    {blog.text.split(' ').slice(0, 50).join(' ')}{blog.text.split(' ').length > 50 ? '  . . .' : ''}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))
        )} 
        
        {visibleBlogsCount < profileBlogContent.length && !loading && ( 
          <div className={css.blogLoadMoreDiv}><button className={css.blogLoadMoreBtn} onClick={handleLoadMore}>Load More</button></div> 
        )}
      </div>

      <div 
        className = {css.blogHomeParentDiv}
        style     = {{ display: activeTab === 'Bookmarks' && !selectedBlog ? '' : 'none' }}
      >

        {loading ? ( 
          <div className={css.loaderParentDiv}><SVGComponent className={css.loaderParent}/></div>
        ) : bookmarkBlogs.length === 0 ? (
          <div className={css.blogPlaceHolder}>
            <div className={css.blogPlaceHolderHeaderDiv}>
              <img  
                alt        = "blog-info-icon"
                className  = {css.blogPlaceHolderIcon}  
                src        = {profile.displayTheme === 'light' ? blogLightInfoIcon : blogDarkInfoIcon} 
              />
              <p className={css.blogPlaceHolderHeader}>Bookmark Your Favourites</p>
            </div>

            <p className={css.blogPlaceHolderText}>Bookmark your favourite reads to keep them close at hand.</p>
          </div>
        ) : (
          bookmarkBlogs.map((blog, index) => (
            <FadeInSection key={index}>
              <div className={css.blogHomeChildDiv}>
                <div className={css.blogChildDiv}>
                  <h5 className={css.blogTitle} onClick={() => handleBlogClick(blog)}>{blog.title}</h5>
                  <p className={css.blogText}>
                    {blog.text.split(' ').slice(0, 50).join(' ')}{blog.text.split(' ').length > 50 ? '  . . .' : ''}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))
        )} 
      </div>

      {selectedBlog && (
        <div className={css.blogDetail}>
          <h5 className={css.blogDetailTitle}>{selectedBlog.title}</h5>
          <div>
            <p className={css.blogDetailChip}>{selectedBlog.topic.join(', ')}</p> 
            <img  
              alt        = "link-icon"
              className  = {css.blogDetailIcon}  
              onClick    = {() => handleBlogIconClick(selectedBlog.url)}
              src        = {profile.displayTheme === 'light' ? linkIcon : linkDarkIcon} 
            />

            <img  
              alt        = "heart-icon" 
              onClick    = {() => handleBookmarkToggle(selectedBlog.id)}
              src={
                profile.displayTheme === 'light'
                  ? (bookmarkBlogIds.includes(selectedBlog.id) ? heartFilledIcon : heartIcon)
                  : (bookmarkBlogIds.includes(selectedBlog.id) ? heartFilledDarkIcon : heartDarkIcon)
              }
              className = {`${css.blogBookmarkIcon} ${bookmarkBlogIds.includes(selectedBlog.id) ? css.tada : ''}`}  
            />
          </div>
          <p className={css.blogDetailText} style={{ whiteSpace: 'pre-line', lineHeight: '1.2' }}>{selectedBlog.text}</p>
        </div>
      )}

    </div>
  );
};

export default Blog;