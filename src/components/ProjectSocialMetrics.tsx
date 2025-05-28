"use client";
import React from 'react';

interface SocialMetrics {
  githubStars: number;
  githubForks: number;
  twitterFollowers: number;
  projectFreshness: number;
}

interface ProjectSocialMetricsProps {
  metrics: SocialMetrics | null;
}

const ProjectSocialMetrics: React.FC<ProjectSocialMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return <div className="text-gray-500 text-sm">No metrics available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-500">GitHub Stars</div>
          <div className="text-xl font-semibold">{metrics.githubStars.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-500">GitHub Forks</div>
          <div className="text-xl font-semibold">{metrics.githubForks.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-500">Twitter Followers</div>
          <div className="text-xl font-semibold">{metrics.twitterFollowers.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-500">Freshness Score</div>
          <div className="text-xl font-semibold">{metrics.projectFreshness.toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Activity Score</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${Math.min(100, metrics.projectFreshness * 10)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectSocialMetrics; 