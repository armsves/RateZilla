"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context';

interface ProjectRatingProps {
  projectId: number;
}

const ProjectRating: React.FC<ProjectRatingProps> = ({ projectId }) => {
  const { activePubKey } = useAppContext();
  const [rating, setRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    // Fetch project rating data
    const fetchRatingData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/rating`);
        if (response.ok) {
          const data = await response.json();
          setAverageRating(data.averageRating || 0);
          setTotalVotes(data.totalVotes || 0);
          
          if (data.userRating) {
            setUserRating(data.userRating);
            setRating(data.userRating);
          }
        }
      } catch (error) {
        console.error('Error fetching rating data:', error);
      }
    };

    fetchRatingData();
  }, [projectId]);

  const handleRate = async (value: number) => {
    if (!activePubKey) {
      alert('Please connect your wallet to rate this project');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: value }),
      });

      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating);
        setTotalVotes(data.totalVotes);
        setUserRating(value);
        setRating(value);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Rate this project</h3>
        <div 
          className="flex"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        {!activePubKey && (
          <p className="text-sm text-gray-500 mt-2">
            Connect your wallet to rate this project
          </p>
        )}
        {userRating > 0 && (
          <p className="text-sm text-green-600 mt-2">
            You rated this project {userRating} {userRating === 1 ? 'star' : 'stars'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectRating; 