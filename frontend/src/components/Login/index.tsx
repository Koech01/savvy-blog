import css from '../Auth/index.module.css';
import { useAuth } from '../Auth/authContext';
import { useNavigate } from 'react-router-dom';
import infoCircledIcon from '../assets/infoCircled.svg';
import { type SyntheticEvent, useState, useEffect } from 'react';
import authDemoLockDarkSvg from '../assets/authDemoLockDark.svg'; 
import authDemoLockLightSvg from '../assets/authDemoLockLight.svg'; 


const Login = () => {

  
  const { setAccessToken }          = useAuth();
  const navigate                    = useNavigate();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [redirects, setRedirects]   = useState(false);
  const [error, setError]           = useState('');
  const [theme, setTheme]           = useState('light');
  const [guestBoard, setGuestBoard] = useState(false);


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


  const submit = async (e: SyntheticEvent) => {

    e.preventDefault();
  
    try {
      const response = await fetch('/api/v1/login/', {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json' },
        credentials : 'include',
        body        : JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json(); 
        setAccessToken(data.token); 

        if (data.guestMode) {
          navigate('/welcome/');  
          return;
        }
        setRedirects(true);
      } else {
        const data = await response.json();
        setError(data.detail);
      }
    } catch (error) { setError('An error occurred. Please try again.'); }
  };

  const redirectToSignup = () => { navigate('/signup/'); };

  const redirectToReset  = () => { navigate('/forgot/'); };

  useEffect(() => { if (redirects) { navigate('/'); } }, [redirects, navigate]);

  
  useEffect(() => {
    if (error) {
      const timer        = setTimeout(() => { setError(''); }, 4000);
      const fadeOutTimer = setTimeout(() => { setError(''); }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fadeOutTimer);
      };
    }
  }, [error]);


  useEffect(() => {
    const timer = setTimeout(() => { setGuestBoard(true); }, 500); 
    return () => clearTimeout(timer);  
  }, []);


  return (
    <div className={`${css.authParent} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.authContainer}>
        <form className={`${css.authForm} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onSubmit={submit}>

          <h4 className={`${css.authHeader} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>Welcome Back !</h4>
 
          <div className={`${css.authInput} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
            <input 
              required
              type        = "email"
              placeholder = "Enter Email"
              onChange    = {(e) => setEmail(e.target.value)} 
            />
            <div></div>
          </div>

          <div className={css.authInput}>
            <input 
              required
              type        = "password"
              placeholder = "Enter Password"
              onChange    = {(e) => setPassword(e.target.value)}
            />
            <div></div>
          </div>

          <button type='submit'><span>Login</span></button> 

          {error &&(
            <div className={`${css.authErrorDiv} ${error ? css.fadeIn : css.fadeOut}`}>
              <img src={infoCircledIcon} alt="info-circled-icon"/>
              <p>{error}</p>
            </div>
          )} 

          <div className={`${css.authUrlDiv} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}> 
            <div><p className={`${css.authUrlRedirect} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onClick={redirectToReset}>Forgot Password ?</p></div>
            <div><p className={`${css.authUrlRedirect} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onClick={redirectToSignup}>Sign Up</p></div>
          </div>

        </form>

        {guestBoard && (
          <div className={`${css.authGuestAccDiv} ${guestBoard ? css.fadeIn : css.fadeOut}`}> 
            <div className={css.authGuestAccHeaderDiv}>
              <img 
                alt       = "auth-guest-pass-icon"
                className = {css.authGuestAccIcon}
                src       = {theme === 'light' ? authDemoLockLightSvg: authDemoLockDarkSvg}  
              />
              <p className={css.authGuestAccHint}>Guest Mode &nbsp;|&nbsp; Jump Right In !</p>
            </div>
            
            <div className={css.authGuestAccTextDiv}>
              <div className={css.authGuestAccHintMobile}>   
                <p className={css.authGuestAccText}>guest@savvyblog.com</p> 
                <p className={css.authGuestAccHint}>—</p>
                <p className={css.authGuestAccText}>!justlooking@!</p>
              </div> 

              <div className={`${css.authGuestAccItemDiv} ${css.authGuestAccHintTablet}`}> 
                <p className={css.authGuestAccHint}>email &nbsp;</p>
                <p className={css.authGuestAccText}>guest@savvyblog.com</p>
              </div>

              <div className={`${css.authGuestAccFlexEndDiv} ${css.authGuestAccHintTablet}`}>  
                <p className={css.authGuestAccHint}>password &nbsp;</p>
                <p className={css.authGuestAccText}>!justlooking@!</p>
              </div> 
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login;