import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from '../Onboarding/index.module.css';
import onBoardingPng from '../assets/onBoarding.png';


const OnBoarding = () => {

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
    <div className={`${css.onBoardingParentDiv} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.onBoardingParentDiv}>
        <div className={css.onBoardingChildDiv}>
          <div className={css.onBoardingTextDiv}>
            <p className={`${css.onBoardingText} ${css.fadeIn}`}>
              Prepare to explore <strong>curated</strong> content <strong>matched</strong> to your interests. 
              Our web scraping technology finds the latest blogs on topics you love, so no more endless searches—just <strong>effortless</strong> discovery!
            </p>
            {showButton && <button className={`${css.onBoardingExploreBtn} ${css.fadeIn}`} onClick={handleExploreClick}>Explore</button>}
          </div>
          <img className={css.jello} src={onBoardingPng} alt="onBoarding-image"/>
        </div>
      </div>
    </div>
  )
}

export default OnBoarding;