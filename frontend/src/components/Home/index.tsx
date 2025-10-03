import AddPage from '../Add';
import BlogPage from '../Blog';
import ProfilePage from '../Profile';
import SettingsPage from '../Settings';
import AddIcon from '../assets/add.svg';
import userIcon from '../assets/user.svg';
import blogIcon from '../assets/blog.svg';
import css from '../Home/index.module.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../Auth/authContext'; 
import { useNavigate } from 'react-router-dom';
import settingIcon from '../assets/setting.svg';
import AddDarkIcon from '../assets/addDark.svg';
import blogDarkIcon from '../assets/blogDark.svg';
import userDarkIcon from '../assets/userDark.svg';
import { type ProfileProps } from '../types/index'; 
import settingDarkIcon from '../assets/settingDark.svg';


const Home = () => {
      
  const { accessToken }                       = useAuth();
  const navigate                              = useNavigate();
  const [username, setUsername]               = useState('');
  const [activeContent, setActiveContent]     = useState('blog'); 
  const [activeMobileTab, setActiveMobileTab] = useState('blog');
  const [profile, setProfile]                 = useState({

    username     : '',
    firstName    : '',
    lastName     : '',
    email        : '',
    phoneNo      : '',
    profileIcon  : '',
    displayTheme : 'dark',
    receiveMails : false, 
  });


  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/home/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });
  
        if (response.ok) {
          const profile = await response.json();
          setProfile(profile);
          setUsername(profile.username);
          const savedTheme     = localStorage.getItem('themePreference');
          const bookmarkOption = localStorage.getItem('favourites');
          if (savedTheme)     { updateProfile({ ...profile, displayTheme: savedTheme }); }
          if (bookmarkOption) { updateProfile({ ...profile, favourites: bookmarkOption }); }
        } else {
          if (response.status === 404) {
            navigate('/login/');
          } else {
            console.error('Failed to fetch Home: ', response.status);
            navigate('/login/');
          }
        }
      } catch (error) { console.error('An error occurred while fetching Home:', error); }
    })();
  }, [navigate]);


  const handleBlogClick     = () => { setActiveContent('blog'); };
  const handleAddClick      = () => { setActiveContent('add'); };
  const handleSettingsClick = () => { setActiveContent('settings'); };
  const handleProfileClick  = () => { setActiveContent('profile'); };

  const handleMobileTabChange = (tab: string) => { 
    setActiveMobileTab(tab);
    setActiveContent(tab);
  };


  const updateProfile = (updatedProfile: ProfileProps['profile']) => {
    setProfile((prevProfile) => ({ ...prevProfile, ...updatedProfile, }));
  };
  
  
  return (
    <div className={`${css.homeParentDiv} ${profile.displayTheme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.homeParentDiv}>
        { profile.username ? ( 
          <div className={css.homeChildDiv}>

            <div className={css.homeSideDiv}>
              <div 
                className = {`${css.homeSideBlog} ${activeContent === 'blog' ? css.active : '' }`}
                onClick   = {handleBlogClick}
              >
                <img alt="blog-icon" src={profile.displayTheme === 'light' ? blogIcon : blogDarkIcon}/>
                <p>Blogs</p>
              </div>

              <div 
                className = {`${css.homeSideAdd} ${activeContent === 'add' ? css.active : '' }`}
                onClick   = {handleAddClick}
              >
                <img alt="add-icon" src={profile.displayTheme === 'light' ? AddIcon : AddDarkIcon}/>
                <p>Topics</p>
              </div>

              <div 
                className = {`${css.homeSideProfile} ${activeContent === 'profile' ? css.active : '' }`}
                onClick   = {handleProfileClick}
              >
                <img alt="user-icon" src={profile.displayTheme === 'light' ? userIcon : userDarkIcon}/>
                <p>{username}</p>
              </div>

              <div 
                className = {`${css.homeSideSettings} ${activeContent === 'settings' ? css.active : '' }`}
                onClick   = {handleSettingsClick}
              >
                <img alt="setting-icon" src={profile.displayTheme === 'light' ? settingIcon : settingDarkIcon}/>
                <p>Settings</p>
              </div>
            </div>

            <div className={css.homeContent}>
              {activeContent === 'blog' && <BlogPage profile={profile} updateProfile={updateProfile}/>}
              {activeContent === 'add' && <AddPage profile={profile} updateProfile={updateProfile}/>}
              {activeContent === 'profile' && <ProfilePage profile={profile} updateProfile={updateProfile} />}
              {activeContent === 'settings' && <SettingsPage profile={profile} updateProfile={updateProfile} />} 
            </div>

            <div className={css.homeMobileTabBar}>
              <label className={`${css.homeMobileTabBarLabel} ${activeMobileTab === 'blog' ? css.active : '' }`}>
                <input
                  type     = "radio"
                  name     = "homeMobileTabBarLabel"
                  checked  = {activeMobileTab === 'blog'}
                  onChange = {() => handleMobileTabChange('blog')}
                />
                <span>blog</span>
              </label>

              <label className={`${css.homeMobileTabBarLabel} ${activeMobileTab === 'add' ? css.active : '' }`}>
                <input
                  type     = "radio"
                  name     = "homeMobileTabBarLabel"
                  checked  = {activeMobileTab === 'add'}
                  onChange = {() => handleMobileTabChange('add')}
                />
                <span>topics</span>
              </label>

              <label className={`${css.homeMobileTabBarLabel} ${activeMobileTab === 'profile' ? css.active : '' }`}>
                <input
                  type     = "radio"
                  name     = "homeMobileTabBarLabel"
                  checked  = {activeMobileTab === 'profile'}
                  onChange = {() => handleMobileTabChange('profile')}
                />
                <span>profile</span>
              </label>

              <label className={`${css.homeMobileTabBarLabel} ${activeMobileTab === 'settings' ? css.active : '' }`}>
                <input
                  type     = "radio"
                  name     = "homeMobileTabBarLabel"
                  checked  = {activeMobileTab === 'settings'}
                  onChange = {() => handleMobileTabChange('settings')}
                />
                <span>settings</span>
              </label>
            </div>

          </div> 
         ) : null }    
      </div>
    </div>
  );
};

export default Home;