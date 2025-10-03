import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from '../NotFound/index.module.css';


const NotFound = () => {

  const navigate                    = useNavigate();
  const [theme, setTheme]           = useState('light');
  const [showButton, setShowButton] = useState(false);

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) { setTheme(savedTheme); }
  }, []);


  useEffect(() => {
    if (!theme) return;
    if (theme === 'dark') {
      document.body.classList.add(css.darkTheme);
      document.body.classList.remove(css.lightTheme);
    } else {
      document.body.classList.add(css.lightTheme);
      document.body.classList.remove(css.darkTheme);
    }
  }, [theme]);


  useEffect(() => {
    const timer = setTimeout(() => { setShowButton(true); }, 1500); 
    return () => clearTimeout(timer);
  }, []);


  const handleExploreClick = () => { navigate('/'); };


  return (
    <div className={`${css.notFoundParentDiv} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.notFoundParentDiv}>
        <div className={css.notFoundChildDiv}>
          
          <div className={css.notFoundTextDiv}>
            <p className={`${css.notFoundText} ${css.fadeIn}`}>This page does not exist</p>
          </div>

          {showButton && <button className={`${css.notFoundExploreBtn} ${css.fadeIn}`} onClick={handleExploreClick}>Home</button>}
        </div>
      </div>
    </div>
  )
}

export default NotFound;