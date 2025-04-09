import css from '../Auth/index.module.css';
import infoCircledIcon from '../assets/infoCircled.svg';
import { useNavigate, useParams } from 'react-router-dom';
import { SyntheticEvent, useState, useEffect } from 'react';


const ResetPassword = () => {

  const {token}                       = useParams();
  const navigate                      = useNavigate();
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [redirects, setRedirects]     = useState(false);
  const [error, setError]             = useState('');
  const [theme, setTheme]             = useState('light');

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) { setTheme(savedTheme); }
  }, []);


  const submit = async (e: SyntheticEvent) => {

    e.preventDefault();
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/reset/', {
        method      : 'POST',
        headers     : { 'Content-Type': 'application/json' },
        credentials : 'include',
        body        : JSON.stringify({ token, password, confirmPass }),
      });
  
      if (response.ok) {

        const data  = await response.json();
        const token = data.token;
        localStorage.setItem('token', token);
        setRedirects(true); 

      } else {

        const data = await response.json();
        setError(data.detail);

      }
    } catch (error) { setError('An error occurred. Please try again.'); }
  };


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
  

  return (
    <div className={`${css.authParent} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.authContainer}>
      <form className={`${css.authForm} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`} onSubmit={submit}>

        <h4 className={`${css.authHeader} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>Reset Password</h4>

        <div className={`${css.authInput} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
          <input 
            required
            type        = "password"
            placeholder = "Enter Password"
            onChange    = {(e) => setPassword(e.target.value)}
          />
          <div></div>
        </div>

        <div className={`${css.authInput} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}>
          <input 
            required
            type        = "password"
            placeholder = "Confirm Password"
            onChange    = {(e) => setConfirmPass(e.target.value)}
          />
          <div></div>
        </div>

        <button type='submit'><span>Reset</span></button> 

        {error &&(
          <div className={`${css.authErrorDiv} ${error ? css.fadeIn : css.fadeOut}`}>
            <img src={infoCircledIcon} alt="info-circled-icon"/>
            <p>{error}</p>
          </div>
        )} 

      </form>
    </div>
    </div>
  )
}

export default ResetPassword;