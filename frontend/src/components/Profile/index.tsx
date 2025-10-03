import checkIcon from '../assets/check.svg';
import css from '../Profile/index.module.css'; 
import { useAuth } from '../Auth/authContext'; 
import { type ProfileProps } from '../types/index';
import checkDarkIcon from '../assets/checkDark.svg';
import React, { useEffect, useRef, useState } from 'react';


const Profile: React.FC<ProfileProps> = ({ profile, updateProfile }) => {

  const { accessToken }                               = useAuth();
  const [shakeUsername, setShakeUsername]             = useState(false);
  const [usernamePlaceholder, setUsernamePlaceholder] = useState('Username');
  const [shakeEmail, setShakeEmail]                   = useState(false);
  const [emailPlaceholder, setEmailPlaceholder]       = useState('Email');
  const [rubberBand, setRubberBandShake ]             = useState(false);
  const [editingMode, setEditingMode]                 = useState(false);
  const [showSucessMsg, setShowSucessMsg]             = useState(false); 
  const [selectedProfileIcon, setSelectedProfileIcon] = useState<File | null>(null);
  const initialProfileRef                             = useRef({ ...profile });


  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [profile]);


  useEffect(() => { setRubberBandShake(true); }, []);


  const toggleEditingMode = () => { setEditingMode(!editingMode); };


  const handleProfilePictureChange = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };


  const handleProfileSubmit = async () => {

    if (!profile.username || profile.username.length < 5) {
      setShakeUsername(true);
      setUsernamePlaceholder('It must be at least 5 chars');
      setTimeout(() => {
        setShakeUsername(false);
        setUsernamePlaceholder('Username');
      }, 3000); 
      return;
    }

    const formData = new FormData();
    formData.append('username', profile.username);
    formData.append('firstName', profile.firstName);
    formData.append('lastName', profile.lastName);
    formData.append('email', profile.email);
    formData.append('phoneNo', profile.phoneNo);
    
    if (selectedProfileIcon) {
      formData.append('profileIcon', selectedProfileIcon);
    }
  
    try { 
      const response = await fetch('/api/v1/user/details/', {
        method      : 'PATCH',
        headers     : { Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
        body        : formData,
      });
      
      if (response.ok) {
 
        const response = await fetch('/api/v1/home/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        const updatedProfile = await response.json();
        const hasChanged     = JSON.stringify(updatedProfile) !== JSON.stringify(initialProfileRef.current);

        setEditingMode(false);
        updateProfile(updatedProfile);
        
        if (hasChanged) { setShowSucessMsg(true); }

        initialProfileRef.current = updatedProfile;

      } 
      
      else {

        try {
          const errorResponse = await response.json();

          if (errorResponse && errorResponse.message) {
            console.log('An error occurred: ', errorResponse.message);
          } 
          else if (errorResponse && errorResponse.error === "Email cannot be blank.") {

            updateProfile({ ...profile, email: '' });
            setShakeEmail(true);
            setEmailPlaceholder('Email cannot be blank.');
            setTimeout(() => {
              setShakeEmail(false);
              setEmailPlaceholder('Email');
            }, 3000);

          }
          else if (errorResponse && errorResponse.error === "Invalid email address.") {

            updateProfile({ ...profile, email: '' });
            setShakeEmail(true);
            setEmailPlaceholder('Enter a valid email address.');
            setTimeout(() => {
              setShakeEmail(false);
              setEmailPlaceholder('Email');
            }, 3000);

          }
          else if (errorResponse && errorResponse.error === "This email is already taken.") {

            updateProfile({ ...profile, email: '' });
            setShakeEmail(true);
              setEmailPlaceholder('This email is already taken.');
              setTimeout(() => {
                setShakeEmail(false);
                setEmailPlaceholder('Email');
              }, 3000); 
              return;

          } else { console.log('An error occurred, status:', response.statusText);  }
        } catch (error) {
          console.log('An error occurred, status: ', response.statusText);
        }

      }
  
    } catch (error) {
      console.log('An error occurred. Please try again later: ', error);
    }
  };
  

  useEffect(() => {
    if (showSucessMsg) {
      const timer = setTimeout(() => { setShowSucessMsg(false); }, 2000);
      return () => { clearTimeout(timer); };
    }
  }, [showSucessMsg]);


  return (
    <div className={`${css.profileContainer} ${profile.displayTheme === 'dark' ? css.darkTheme : css.lightTheme}`}>

      <div className={css.profileParent}>

        <div className={css.profileParentDiv}>

          {showSucessMsg ? (
            <div className={`${css.profileUdpatedDiv} ${css.fadeIn}`}>
              <img alt="check-icon" src={profile.displayTheme === 'light' ? checkIcon : checkDarkIcon}/>
              <p>Changes Saved!</p>
            </div>
          ) : ( 
            <p className={css.profilePageTitle}>Account</p>
          )} 

          <div className={css.profileHeaderDiv}>
            
            <div>
              <img 
                alt       = "user-profile-icon"
                className = {`${css.profilePicture} ${rubberBand ? css.rubberBand : '' }`}
                src       = {selectedProfileIcon ? URL.createObjectURL(selectedProfileIcon) : profile.profileIcon}
              />

              <input
                type     = "file"
                accept   = "image/jpeg, image/png, image/gif"
                style    = {{ display: 'none' }}
                onChange = {(e) => {
                const selectedIcon = e.target.files?.[0];
                if (selectedIcon) { setSelectedProfileIcon(selectedIcon); }
                }}
              />
            </div>

            <div className={css.profileHeaderSubDiv}>
              
              {!editingMode ? ( 

                <div className={`${css.profileHeaderChildDiv} ${editingMode ? css.userEditMode : css.displayMode }`}>
                  <p className={css.profileUsername}>{profile.username}</p>
                  <button className={css.profileEditBtn} onClick={toggleEditingMode}>Change</button>
                </div>

              ) : ( 

                <div className={`${editingMode ? css.fadeIn : '' }`}>
                  
                  <div className={`${css.profileHeaderChildDiv} ${editingMode ? css.userEditMode : css.displayMode }`}>

                    <button
                      className = {`${css.profileChangeIconBtn} ${editingMode ? '' : css.hidden }`}
                      onClick   = {handleProfilePictureChange} 
                    >Change Picture</button>

                    <div className={css.profileInputDiv}>
                      <input
                        type        = "text"
                        name        = "username"
                        placeholder = {usernamePlaceholder}
                        value       = {profile.username}
                        className   = {`${css.profileInput} ${shakeUsername ? css.shakeX : '' }`}
                        onChange    = {(e) =>
                          updateProfile({ ...profile, username: e.target.value })
                        }
                        required
                      />
                      <span className={css.profileInputBorder}></span>
                    </div>

                  </div>

                  <p className = {`${css.profileIconNote} ${editingMode ? '' : css.hidden }`}>Allowed files .png, .jpg .jpeg</p>
              
                </div>

              )}

            </div>

          </div>

          {!editingMode ? (
            <div className={css.profileChildDiv}>

              <div className={css.profileNamesDiv}>

                <div className={css.profileFNameDiv}>
                  <p className={css.profileHeaderText}>First Name</p> 

                  <div>
                    {profile.firstName ? (
                      <p className={css.profileValueText}>{profile.firstName}</p>
                    ) : (
                     <p className={css.profileEmptyField}>Not Set</p>
                    )} 
                  </div>
                </div>

                <div className={css.profileLNameDiv}>
                  <p className={css.profileHeaderText}>Last Name</p>

                  <div>
                    {profile.lastName ? (
                      <p className={css.profileValueText}>{profile.lastName}</p> 
                    ) : (
                      <p className={css.profileEmptyField}>Not Set</p>
                    )}
                  </div>
                </div>

              </div>

              <div className={css.profileEmailAndNoDiv}>

                <div className={css.profileEmailDiv}>
                  <p className={css.profileHeaderText}>Email</p>
                    
                  <div>
                    {profile.email ? (
                      <p className={css.profileValueText}>{profile.email}</p> 
                    ) : (
                     <p className={css.profileEmptyField}>Not Set</p>
                    )}
                  </div>
                </div>

                <div className={css.profileNoDiv}>
                  <p className={css.profileHeaderText}>Phone Number</p>

                  <div>
                    {profile.phoneNo ? (
                      <p className={css.profileValueText}>{profile.phoneNo}</p> 
                    ) : (
                      <p className={css.profileEmptyField}>Not Set</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          ) : (

            <div className={`${css.profileChildDiv} ${editingMode ? css.fadeIn : '' }`}>

              <div className={css.profileEditNamesDiv}>

                <div className={css.profileInputDiv}>
                  <input
                    type       ="text"
                    className  ={css.profileInput}
                    placeholder="First Name"
                    name       ="firstName"
                    value      ={profile.firstName}
                    onChange   ={(e) =>
                      updateProfile({ ...profile, firstName: e.target.value })
                    }
                  />
                  <span className={css.profileInputBorder}></span>
                </div>

                <div className={css.profileInputDiv}>
                  <input
                    type       ="text"
                    className  ={css.profileInput}
                    placeholder="Last Name"
                    name       ="lastName"
                    value      ={profile.lastName}
                    onChange   ={(e) =>
                      updateProfile({ ...profile, lastName: e.target.value })
                    }
                  />
                  <span className={css.profileInputBorder}></span>
                </div>

              </div>

              <div className={css.profileEditEmailPhoneDiv}>

                <div className={css.profileInputDiv}>
                  <input
                    type       ="email"
                    name       ="email"
                    value      ={profile.email}
                    placeholder={emailPlaceholder}
                    className  ={`${css.profileInput} ${shakeEmail ? css.shakeX : '' }`}

                    onChange   ={(e) =>
                      updateProfile({ ...profile, email: e.target.value })
                    }
                  />
                  <span className={css.profileInputBorder}></span>
                </div>

                <div className={css.profileInputDiv}>
                  <input
                    type       ="tel"
                    className  ={css.profileInput}
                    placeholder="Phone Number"
                    name       ="phoneNo"
                    value      ={profile.phoneNo}
                    onChange   ={(e) =>
                      updateProfile({ ...profile, phoneNo: e.target.value })
                    }
                  />
                  <span className={css.profileInputBorder}></span>
                </div>

              </div>
            
              <div className={css.profileSubmitBtnDiv}>
              <button className={css.profileSubmitBtn} onClick={handleProfileSubmit}>Done</button>
              </div>
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;