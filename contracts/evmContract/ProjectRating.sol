// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectRating {
    // Struct to store rating information
    struct Rating {
        uint256 totalRating;
        uint256 numberOfRatings;
    }

    // Mapping from project ID to its rating information
    mapping(string => Rating) public projectRatings;

    // Event emitted when a new rating is added
    event RatingAdded(string projectId, uint256 rating, uint256 averageRating);

    // Function to add a rating for a project
    function addRating(string memory projectId, uint256 rating) public {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        Rating storage projectRating = projectRatings[projectId];
        projectRating.totalRating += rating;
        projectRating.numberOfRatings += 1;

        uint256 averageRating = projectRating.totalRating / projectRating.numberOfRatings;
        emit RatingAdded(projectId, rating, averageRating);
    }

    // Function to get the average rating for a project
    function getAverageRating(string memory projectId) public view returns (uint256) {
        Rating storage projectRating = projectRatings[projectId];
        if (projectRating.numberOfRatings == 0) {
            return 0;
        }
        return projectRating.totalRating / projectRating.numberOfRatings;
    }

    // Function to get the total number of ratings for a project
    function getNumberOfRatings(string memory projectId) public view returns (uint256) {
        return projectRatings[projectId].numberOfRatings;
    }
} 