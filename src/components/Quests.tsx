import React, { useState, useEffect } from 'react';
import { FaCheck, FaLock, FaQuestion, FaTimes } from 'react-icons/fa';
import '../App.css';

export interface Quest {
  id: string;
  name: string;
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
  reward: string;
  unlocked: boolean;
  unlockTutorial?: string;
}

interface QuestProps {
  quests: Quest[];
  onClose: () => void;
}

const Quests: React.FC<QuestProps> = ({ quests, onClose }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [visible, setVisible] = useState(false);
  
  // Animate in on mount
  useEffect(() => {
    // Small delay to allow CSS transition to work
    setTimeout(() => setVisible(true), 50);
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation to finish
  };
  
  const activeQuests = quests.filter(quest => quest.unlocked && !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);
  
  return (
    <div 
      className="quests-panel"
      style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}
    >
      <div className="title-container">
        <h2>Quests</h2>
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      <div className="quests-list">
        {activeTab === 'active' ? (
          activeQuests.length > 0 ? (
            activeQuests.map((quest) => (
              <div 
                key={quest.id} 
                className="quest-item"
              >
                <div className="quest-icon">
                  <FaQuestion />
                </div>
                <div className="quest-details">
                  <div className="quest-name">
                    {quest.name}
                  </div>
                  <div className="quest-description">
                    {quest.description}
                  </div>
                  
                  <div className="quest-progress-container">
                    <div 
                      className="quest-progress-bar" 
                      style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                    ></div>
                    <div className="quest-progress-text">
                      {quest.progress} / {quest.goal}
                    </div>
                  </div>
                  
                  <div className="quest-reward">
                    Reward: {quest.reward}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-quests-message">
              <p>No active quests. Complete existing quests to unlock more!</p>
            </div>
          )
        ) : (
          completedQuests.length > 0 ? (
            completedQuests.map((quest) => (
              <div 
                key={quest.id} 
                className="quest-item completed"
              >
                <div className="quest-icon">
                  <FaCheck />
                </div>
                <div className="quest-details">
                  <div className="quest-name">
                    {quest.name}
                  </div>
                  <div className="quest-description">
                    {quest.description}
                  </div>
                  <div className="quest-reward">
                    Reward: {quest.reward}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-quests-message">
              <p>No completed quests yet. Keep playing to complete your quests!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Quests; 