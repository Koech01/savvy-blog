import { useAuth } from '../Auth/authContext'; 
import { useNavigate } from 'react-router-dom';
import css from '../Settings/index.module.css';
import { type ProfileProps } from '../types/index';
import React, { useEffect, useState } from 'react';


const Settings: React.FC<ProfileProps> = ({ profile, updateProfile }) => {

  const { accessToken }                        = useAuth();
  const navigate                               = useNavigate();
  const [getMails, setGetMails]                = useState(profile.receiveMails || false);
  const [getUserFavourites, setUserFavourites] = useState(profile.favourites || false);


  const handleThemeToggle = async () => {

    const newTheme = profile.displayTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('themePreference', newTheme);

    try { 
      const response = await fetch('/api/v1/user/theme/', {
        method      : 'PATCH',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
        body        : JSON.stringify({ theme: newTheme }),
      });

      if (response.ok) { 
        localStorage.setItem('themePreference', newTheme);
        updateProfile({ ...profile, displayTheme: newTheme });
      } 
      else { console.error('Failed to update theme: ', response.status); }

    } catch (error) { console.error('Error updating theme: ', error); }
  };


  const handleMailsToggle = async () => {
    const newReceiveMails = !getMails;
    setGetMails(newReceiveMails);

    try { 
      const response = await fetch('/api/v1/user/mail/preferences/', {
        method      : 'PATCH',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
        body        : JSON.stringify({ receiveMails: newReceiveMails }),
      });

      if (response.ok) {
        setGetMails(newReceiveMails);
        updateProfile({ ...profile, receiveMails: newReceiveMails });
        localStorage.setItem('receiveMails', JSON.stringify(newReceiveMails));
      } else {
        console.error('Failed to update receiveMails: ', response.status);
      }
    } catch (error) {
      console.error('Error updating receiveMails: ', error);
    }
  };


  const handleBookmarkToggle = async () => {
    const newUserFavourites = !getUserFavourites;
    setUserFavourites(newUserFavourites);

    try { 
      const response = await fetch('/api/v1/user/bookmarks/visibility/', {
        method      : 'PATCH',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
        body        : JSON.stringify({ favourites: newUserFavourites }),
      });

      if (response.ok) {
        setUserFavourites(newUserFavourites);
        updateProfile({ ...profile, favourites: newUserFavourites });
        localStorage.setItem('favourites', JSON.stringify(newUserFavourites));
      } else {
        console.error('Failed to update user favourites: ', response.status);
      }
    } catch (error) {
      console.error('Error updating user favourites: ', error);
    }
  };


  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/logout/', {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json' },
        credentials : 'include',
      });

      if (response.ok) {
        navigate('/login/');
        localStorage.removeItem('token');
      } else {
        console.error('Failed to logout: ', response.status);
      }
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  
  useEffect(() => {
    // Initialize getMails state from localStorage
    const savedReceiveMails = localStorage.getItem('receiveMails');
    if (savedReceiveMails !== null) {
      setGetMails(JSON.parse(savedReceiveMails));
    }

    // Initialize getUserFavourites state from localStorage
    const savedUserFavourites = localStorage.getItem('favourites');
    if (savedUserFavourites !== null) {
      setUserFavourites(JSON.parse(savedUserFavourites));
    }
  }, []);

  return (
    <div className={`${css.settingsContainer} ${profile.displayTheme === 'dark' ? css.darkTheme : css.lightTheme}`}>

      <div className={css.settingsParentDiv}>

        <div className={css.settingsChildDiv}>

          <p className={css.settingsHeaderTitle}>Settings</p>

          <div className={css.settingsDisplayModeDiv}>

            <div className={css.settingsDisplayModeChild}>
              
              <div className={css.settingsItemDiv}>
                <div className={css.settingsItemTextDiv}>
                  <p className={css.settingsItemText}>Dark Mode</p>
                </div>

                <div className={css.settingsModeSwitchDiv}>
                  <label className={css.settingsModeSwitch}>
                    <input 
                      type     = "checkbox"
                      onChange = {handleThemeToggle}
                      checked  = {profile.displayTheme === 'dark'}
                    />
                    <span className={css.settingsModeSlider}></span>
                  </label>
                </div>
              </div>

              <div className={css.settingsItemDiv}>
                <div className={css.settingsItemTextDiv}>
                  <p className={css.settingsItemText}>Email Notifications</p>
                  <p className={css.settingsItemDesc}>Email updates on favorite topics' blogs.</p>
                </div>

                <div className={css.settingsModeSwitchDiv}>
                  <label className={css.settingsModeSwitch}>
                    <input 
                      type     = "checkbox"
                      onChange = {handleMailsToggle}
                      checked  = {getMails}
                    />
                    <span className={css.settingsModeSlider}></span>
                  </label>
                </div>
              </div>

              <div className={css.settingsItemDiv}>
                <div className={css.settingsItemTextDiv}>
                  <p className={css.settingsItemText}>Bookmarks</p>
                  <p className={css.settingsItemDesc}>Show blog bookmarks.</p>
                </div>

                <div className={css.settingsModeSwitchDiv}>
                  <label className={css.settingsModeSwitch}>
                    <input 
                      type     = "checkbox"
                      onChange = {handleBookmarkToggle}
                      checked  = {getUserFavourites}
                    />
                    <span className={css.settingsModeSlider}></span>
                  </label>
                </div>
              </div>

              <div className={css.settingsItemDiv}>
                <div className={css.settingsItemTextDiv}>
                  <p className={css.settingsItemText}>Logout</p>
                </div>

                <div className={css.settingsModeSwitchDiv}>
                  <button className={css.settingsLogoutBtn} onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>

          </div>

        </div>
      
      </div>
    </div>
  );
};

export default Settings;