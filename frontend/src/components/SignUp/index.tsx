import css from '../Auth/index.module.css';
import { useAuth } from '../Auth/authContext';
import { useNavigate } from 'react-router-dom';
import infoCircledIcon from '../assets/infoCircled.svg';
import { type SyntheticEvent, useState, useEffect } from 'react';


const Signup = () => {

  const { setAccessToken }        = useAuth();
  const navigate                  = useNavigate();
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [redirects, setRedirects] = useState(false);
  const [error, setError]         = useState('');
  const [theme, setTheme]         = useState('light');


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
      const response = await fetch('/api/v1/signup/', {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json' },
        credentials : 'include',
        body        : JSON.stringify({ username, email, password }),
      });
  
      if (response.ok) { 
        const data = await response.json();
        setAccessToken(data.token);
        localStorage.setItem('themePreference', 'light');
        setRedirects(true); 
      } 

      else {

        const data = await response.json();
        if ( data.username) {
          setError(data.username[0] === 'This field must be unique.' ? 'This username is already taken.' : data.username[0]);
        }
        else if ( data.email) { setError(data.email[0]); } 
        else if ( data.password) { setError(data.password[0]); }
        else    { setError('An error occurred. Please try again later.'); }
        
      }
    } catch (error) { setError('An error occurred. Please try again later.'); }
  };


  const redirectToLogin = () => { navigate('/login/'); };


  useEffect(() => { if (redirects) { navigate('/welcome/'); } }, [ redirects, navigate ]);


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


  return (
    <div className={`${css.authParent} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.authContainer}>
        
      <form className={`${css.authForm} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onSubmit={submit}>

        <h4 className={`${css.authHeader} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>Get Started</h4>

          <div className={`${css.authInput} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
            <input 
              required
              type        = "text"
              placeholder = "Enter Username"
              onChange    = {(e) => setUsername(e.target.value)}
            />
            <div></div>
          </div>

          <div className={css.authInput}>
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

          <button type='submit'><span>Sign Up</span></button>

          {error &&(
            <div className={`${css.authErrorDiv} ${error ? css.fadeIn : css.fadeOut}`}>
              <img src={infoCircledIcon} alt="info-circled-Icon"/>
              <p>{error}</p>
            </div>
          )} 

          <div className={`${css.authSignUpUrlDiv} ${theme === 'dark' ? css.darkTheme : '' }`}>
            <div><p className={css.authUrlTitle}>Already have an account ?</p></div>
            <div><p className={`${css.authUrlRedirect} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onClick={redirectToLogin}>Sign In</p></div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Signup;