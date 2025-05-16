// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectRating {
    // Simple mapping to store project ratings
    mapping(bytes32 => uint256) public ratings;
    
    // Event for rating updates
    event RatingUpdated(bytes32 indexed projectId, uint256 rating);

    // Add or update a rating (1-5)
    function rateProject(string memory projectId, uint256 rating) external {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        ratings[projectHash] = rating;
        
        emit RatingUpdated(projectHash, rating);
    }

    // Get rating for a project
    function getRating(string memory projectId) external view returns (uint256) {
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        return ratings[projectHash];
    }
} 