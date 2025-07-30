import css from '../Add/index.module.css';
import checkIcon from '../assets/check.svg';
import { useAuth } from '../Auth/authContext'; 
import { type ProfileProps } from '../types/index';
import { useState, useEffect, useRef } from 'react';
import checkDarkIcon from '../assets/checkDark.svg';


interface TopicCategory {
  id   : number;
  name : string;
}


interface Topic {
  id   : number;
  name : string;
}


const Add: React.FC<ProfileProps> = ({ profile }) => {
  
  const { accessToken }                                   = useAuth();
  const [topicCategories, setTopicCategories]             = useState<TopicCategory[]>([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [topicsForCategory, setTopicsForCategory]         = useState<Topic[]>([]);
  const categoryRefs                                      = useRef<HTMLDivElement[]>([]);
  const [selectedTopics, setSelectedTopics]               = useState<{ [topicId: number]: boolean }>({});
  const [activeTab, setActiveTab]                         = useState< 'Interest Selection' | 'Topics' >('Interest Selection'); 
  const [topics, setTopics]                               = useState<[]>([]);
  const [showCheckboxes, setShowCheckboxes]               = useState(false); 
  const [showSuccessTopicAdd, setshowSuccessTopicAdd]     = useState(false); 
  const [showSuccessTopicDel, setshowSuccessTopicDel]     = useState(false); 
  const [selectedTopicIds, setSelectedTopicIds]           = useState<{ [topicId: number]: boolean }>({});
  const [updatedTopics, setUpdatedTopics]                 = useState<number[]>([]);
  

  useEffect(() => {
    const fetchTopicCategories = async () => {
      try { 
        const response = await fetch('/api/v1/topics/user/add/', {
          method      : 'POST',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setTopicCategories(data.categories);
        } else { console.error('Failed to fetch topic categories'); }
      } catch (error) { console.error('Error fetching topic categories:', error); }
    };

    fetchTopicCategories();
  }, []);


  useEffect(() => {
    if (selectedCategoryIndex !== null) {
      const selectedCategory = topicCategories[selectedCategoryIndex];
      const fetchTopicsForCategory = async () => {
        try { 
          const encodedCategoryName = encodeURIComponent(selectedCategory.name);
          const response = await fetch(`/api/v1/topics/?category=${encodedCategoryName}`, {
            method      : 'GET',
            headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            credentials : 'include',
            body        : JSON.stringify({})
          });

          if (response.ok) {
            const data = await response.json();
            setTopicsForCategory(data);
          } else { console.error('Failed to fetch topics for category'); }
        } catch (error) { console.error('Error fetching topics:', error); }
      };

      fetchTopicsForCategory();
    }
  }, [selectedCategoryIndex, topicCategories]);


  const handleCategoryClick = (index: number) => {

    setSelectedCategoryIndex(index === selectedCategoryIndex ? null : index);

    if (categoryRefs.current[index]) {
      categoryRefs.current[index].scrollIntoView({
        behavior : 'smooth',
        block    : 'start',
      });
    }

  };
  
  useEffect(() => {
    (async () => {
      try { 
        const response = await fetch('/api/v1/topics/list/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });

        if (response.ok) {
          const topicsData = await response.json();
          setTopics(topicsData); 
        } else { console.error('Failed to fetch topics:', response.status); }
      } catch (error) { console.error('Error fetching topics:', error); }
    })();
  }, []);


  const toggleCheckboxes = () => { setShowCheckboxes(!showCheckboxes); };


  const handleTopicsSubmit = async () => {
    try { 
      const response = await fetch('/api/v1/topics/add/', {
        method      : 'PATCH',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body        : JSON.stringify({ selectedTopics }),
        credentials : 'include',
      });
  
      if (response.ok) {
        setSelectedCategoryIndex(null);
        setSelectedTopics({}); 
        setshowSuccessTopicAdd(true);

        const topicsResponse = await fetch('/api/v1/topics/list/', {
          method      : 'GET',
          headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials : 'include',
        });
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setTopics(topicsData);
        } else { console.error('Failed to fetch topics:', topicsResponse.status); }

      } else { console.error('Failed to submit selected topics'); }
    } catch (error) { console.error('Error submitting selected topics:', error); }
  };


  const handleUpdateTopics = async () => {
    try { 
      const selectedTopicsIds = Object.keys(selectedTopicIds).filter(id => selectedTopicIds[parseInt(id)]);
      const response = await fetch('/api/v1/topics/remove/', {
        method      : 'PATCH',
        headers     : { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials : 'include',
        body        : JSON.stringify({ selectedTopics: selectedTopicsIds }),
      });
  
      if   (response.ok) { 
        setshowSuccessTopicDel(true);
        setUpdatedTopics(prev => [...prev, ...selectedTopicsIds.map(id => parseInt(id))]); 
      } 
      else { console.error('Failed to remove selected topics:', response.status); }
    } catch (error) { console.error('Error removing selected topics:', error); }
  };


  useEffect(() => {
    if (showSuccessTopicAdd) {
      const timer = setTimeout(() => { setshowSuccessTopicAdd(false); }, 2000);
      return () => { clearTimeout(timer); };
    }
  }, [showSuccessTopicAdd]);


  useEffect(() => {
    if (showSuccessTopicDel) {
      const timer = setTimeout(() => { setshowSuccessTopicDel(false); }, 2000);
      return () => { clearTimeout(timer); };
    }
  }, [showSuccessTopicDel]);

  
  return (

    <div className={`${css.addParentDiv} ${profile.displayTheme === 'dark' ? css.darkTheme : css.lightTheme}`}>
      <div className={css.addMainDiv}>
        <div className={`${css.mobileTabBar} ${css.addTabBar}`}>
          <a 
            className = {`${css.addTabBarItem} ${activeTab === 'Interest Selection' ? css.active : ''}`} 
            onClick   = {() => setActiveTab('Interest Selection')}
          >
            Interest Selection
          </a>
        
          <a 
            className = {`${css.addTabBarItem} ${activeTab === 'Topics' ? css.active : ''}`} 
            onClick   = {() => setActiveTab('Topics')}
          >
            Topics
          </a>

          <div className={css.addTopicsNavDiv}>
            {activeTab === 'Interest Selection' && Object.values(selectedTopics).some(value => value) && (
              <button 
                className = {`${css.addTopicsSubmitBtn} ${css.fadeIn}`}
                onClick   = {handleTopicsSubmit}
              >Save</button>
            )}

            <div 
              className={`
                ${css.addTopicsMessageDiv} 
                ${showSuccessTopicAdd || showSuccessTopicDel ? css.fadeIn : css.hidden}
              `}
            >
              <img src={profile.displayTheme === 'light' ? checkIcon : checkDarkIcon} alt="check-icon"/>
              <p>{showSuccessTopicAdd ? 'Topics successfully added !' : 'Topics successfully removed !'}</p>
            </div>
          </div>
        </div>

        <div 
          className = {css.addChipsDiv}
          style     = {{ display: activeTab === 'Interest Selection' ? 'flex' : 'none' }}
        >

          {topicCategories.map((category, index) => (
            <div className={css.addChipsChildDiv} key={category.id}>
              <div
                className = {`${css.addTopicCategoryChip} ${index === selectedCategoryIndex ? css.active : '' }`}
                onClick   = {() => handleCategoryClick(index)}
              >
                <span>{category.name}</span>
              </div>

              {index === selectedCategoryIndex && (
                <>
                  {topicsForCategory.map((topic) => (
                    <div 
                    className = {`${css.addTopicChip} ${index === selectedCategoryIndex ? css.fadeInRight : css.fadeOut }`} 
                    key       = {topic.id}
                    >
                      <label className={css.addTopicChkBoxLabel}>
                        <input
                          type     = "checkbox"
                          checked  = {selectedTopics[topic.id] || false}
                          onChange = {(e) => {
                          const isChecked = e.target.checked;
                          setSelectedTopics((prevSelectedTopics) => ({
                            ...prevSelectedTopics, [topic.id]: isChecked, })); 
                          }}
                          />
                        <div className={css.addTopicChkBoxChkMark}></div>
                      </label>

                      <span>{topic.name}</span>
                    </div>
                  ))}
                </>
              )}

            </div>
          ))}
        </div>

        <div 
          className = {css.addTopicListDiv} 
          style     = {{ display: activeTab === 'Topics' ? 'flex' : 'none' }}
        >
          
          <div>
            <button 
              className = {`${css.addTopicChangeBtn} ${topics.length >= 1 ? css.fadeIn : css.hidden}`}
              onClick   = {toggleCheckboxes}
            >{showCheckboxes ? 'Done' : 'Change'}</button>
            <button
              className = {`${css.addUpdateTopicEditBtn} ${showCheckboxes && topics.length >= 1 ? css.fadeIn : css.hidden}`}
              onClick   = {handleUpdateTopics}
            >Remove</button>
          </div>

          <p className={css.addTopicListHint}>Topics you have selected are listed here.</p>

          {topics.map((topic: Topic) => (
            updatedTopics.includes(topic.id) ? null : (
              <div className={css.addTopicItemDiv} key={topic.id}>
                {showCheckboxes && (
                  <label className={`${css.addTopicItemChkBoxLabel} ${showCheckboxes ? css.headShake : '' }`}>
                    <input
                      type     = "checkbox"
                      checked  = {selectedTopicIds[topic.id] || false}
                      onChange = {(e) => {
                      const isChecked = e.target.checked;
                      setSelectedTopicIds(prevSelectedTopicIds => ({
                      ...prevSelectedTopicIds,
                      [topic.id]: isChecked,
                      }));
                      }}
                    />
                    <div className={css.addTopicListChkBoxChkMark}></div>
                  </label>
                )}
                <div className={css.addProfileSelectedTopic}><span>{topic.name}</span></div>
              </div>
            )
          ))}

        </div>
      </div>
    </div>
  );
};

export default Add;