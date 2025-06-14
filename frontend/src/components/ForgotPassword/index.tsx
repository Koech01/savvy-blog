import css from '../Auth/index.module.css';
import { useNavigate } from 'react-router-dom';
import infoCircledIcon from '../assets/infoCircled.svg';
import { type SyntheticEvent, useState, useEffect } from 'react';


const ForgotPassword = () => {

  const navigate              = useNavigate();
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [theme, setTheme]     = useState('light');
  

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
      const response = await fetch('/api/v1/forgot/', {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json' },
        credentials : 'include',
        body        : JSON.stringify({ email }),
      });
  
      if (response.ok) { setSuccess(true); } 
      else { setError('Enter a valid email address.'); }

    } catch (error) { setError('An error occurred. Please try again.'); }
  };


  const redirectToLogin = () => { navigate('/login/'); };


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

          {success ?
            <p className={`${css.authHeader} ${css.flash} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
              Email Sent !
            </p>
            : 
            <p className={`${css.authHeader} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>Forgot Password</p>
          }

          <div className={`${css.authInput} ${theme === 'dark' ? css.darkTheme : css.lightTheme} ${success ? css.hidden : '' }`}>
            <input 
              required
              type        = "email"
              placeholder = "Enter Email"
              onChange    = {(e) => setEmail(e.target.value)} 
            />
            <div></div>
          </div>

          <button type="submit"><span>Send</span></button> 

          {error &&(
            <div className={`${css.authErrorDiv} ${error ? css.fadeIn : css.fadeOut}`}>
              <img src={infoCircledIcon} alt="info-circled-icon"/>
              <p>{error}</p>
            </div>
          )} 

          { success ? '' : 
            <div className={`${css.authSignUpUrlDiv} ${theme === 'dark' ? css.darkTheme : '' }`}>
              <div><p className={css.authUrlTitle}>Already have an account?</p></div>
              <div><p className={`${css.authUrlRedirect} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onClick={redirectToLogin}>Sign In</p></div>
            </div>
          }
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword;