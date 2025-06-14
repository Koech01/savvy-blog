import css from '../Auth/index.module.css';
import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';


interface AuthContextType {
  accessToken    : string | null;
  setAccessToken : React.Dispatch<React.SetStateAction<string | null>>;
  logout         : () => void;
}


interface AuthProviderProps { children: ReactNode; }


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [theme, setTheme]             = useState('light');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);

  
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
    const refreshToken = async () => {
      try {
        const response = await fetch('/api/v1/refresh/', {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
        }
      } 
      
      catch { setAccessToken(null); } 
      finally { setLoading(false); }
    };
    refreshToken();
  }, []);

  if (loading) return <div className={`${css.authParent} ${theme === 'dark' ? css.darkTheme : css.lightTheme}`}></div>;


  const logout = async () => {
    await fetch('/api/v1/logout/', { method : 'POST', credentials : 'include'});
    setAccessToken(null);
  };


  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};