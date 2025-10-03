export interface ProfileProps {
  profile: {
    username      : string;
    firstName     : string;
    lastName      : string;
    email         : string;
    phoneNo       : string;
    profileIcon   : string;
    displayTheme? : string; 
    receiveMails? : boolean;
    favourites?   : boolean;
  };

  updateProfile: (updatedProfile: ProfileProps['profile']) => void;
}