import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../Tutorial.css';

export interface TutorialTopic {
  id: string;
  title: string;
  description: string;
}

interface TutorialSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTutorial: (tutorialId: string) => void;
  topics: TutorialTopic[];
}

const TutorialSelector: React.FC<TutorialSelectorProps> = ({ 
  isVisible, 
  onClose, 
  onSelectTutorial,
  topics
}) => {
  if (!isVisible) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-container fade-in tutorial-selector">
        <div className="tutorial-header">
          <h2>Choose a Tutorial</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="tutorial-content">
          <p>Select a topic to learn more about that aspect of the game:</p>
          
          {topics.length > 0 ? (
            <div className="tutorial-topics-list">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="tutorial-topic-item"
                  onClick={() => onSelectTutorial(topic.id)}
                >
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tutorials-message">
              <p>Keep playing to unlock more tutorials!</p>
              <p>Tutorials become available as you discover new game features.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialSelector; 