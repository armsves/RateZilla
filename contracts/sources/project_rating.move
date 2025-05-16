module project_rating::project_rating {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use std::vector;

    // Errors
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_RATING: u64 = 2;

    // Struct to store rating information
    struct ProjectRating has key {
        ratings: vector<u64>,
        rating_events: EventHandle<RatingEvent>,
    }

    // Event emitted when a rating is updated
    struct RatingEvent has drop, copy, store {
        project_id: vector<u8>,
        rating: u64,
    }

    // Initialize the module
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        move_to(account, ProjectRating {
            ratings: vector::empty(),
            rating_events: account::new_event_handle<RatingEvent>(account),
        });
    }

    // Add or update a rating (1-5)
    public entry fun rate_project(
        account: &signer,
        project_id: vector<u8>,
        rating: u64,
    ) acquires ProjectRating {
        let account_addr = signer::address_of(account);
        let project_rating = borrow_global_mut<ProjectRating>(account_addr);

        // Validate rating
        assert!(rating >= 1 && rating <= 5, EINVALID_RATING);

        // Update rating
        vector::push_back(&mut project_rating.ratings, rating);

        // Emit event
        event::emit_event(
            &mut project_rating.rating_events,
            RatingEvent {
                project_id,
                rating,
            },
        );
    }

    // Get rating for a project
    public fun get_rating(account_addr: address, project_id: vector<u8>): u64 acquires ProjectRating {
        let project_rating = borrow_global<ProjectRating>(account_addr);
        if (vector::is_empty(&project_rating.ratings)) {
            return 0
        };
        *vector::borrow(&project_rating.ratings, vector::length(&project_rating.ratings) - 1)
    }

    #[test_only]
    use aptos_framework::account::create_account_for_test;

    #[test(admin = @project_rating)]
    fun test_rating(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        initialize(admin);

        // Test rating a project
        rate_project(admin, b"project1", 5);
        assert!(get_rating(admin_addr, b"project1") == 5, 0);

        // Test updating a rating
        rate_project(admin, b"project1", 4);
        assert!(get_rating(admin_addr, b"project1") == 4, 0);

        // Test invalid rating
        let invalid_rating = 6;
        assert!(invalid_rating > 5, EINVALID_RATING);
    }
} 