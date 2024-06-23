const { get } = require("../routes");

const getReviewCards = `SELECT
    r.review_id,
    d.destination_name,
    d.destination_category,
    img_profile.location AS author_profile_picture_location,
    u.nickname AS author_nickname,
    u.user_id AS author_id,
    r.review_body,
    r.date_posted
FROM
    reviews r
LEFT JOIN
    destinations d ON r.destination_id = d.destination_id
LEFT JOIN
    users u ON r.author_id = u.user_id
LEFT JOIN
    images img_profile ON u.profile_picture_id = img_profile.image_id
ORDER BY
    r.date_posted DESC`;

const getReviewCardsWhereAuthorId = `SELECT
    r.review_id,
    d.destination_name,
    d.destination_category,
    img_profile.location AS author_profile_picture_location,
    u.nickname AS author_nickname,
    u.user_id AS author_id,
    r.review_body,
    r.date_posted
FROM
    reviews r
LEFT JOIN
    destinations d ON r.destination_id = d.destination_id
LEFT JOIN
    users u ON r.author_id = u.user_id
LEFT JOIN
    images img_profile ON u.profile_picture_id = img_profile.image_id
WHERE
    author_id = $1
ORDER BY
    r.date_posted DESC`;

const getReviewCardsWhereDestinationId = `SELECT
    r.review_id,
    d.destination_id,
    d.destination_name,
    d.destination_category,
    img_profile.location AS author_profile_picture_location,
    u.nickname AS author_nickname,
    u.user_id AS author_id,
    r.review_body,
    r.date_posted
FROM
    reviews r
LEFT JOIN
    destinations d ON r.destination_id = d.destination_id
LEFT JOIN
    users u ON r.author_id = u.user_id
LEFT JOIN
    images img_profile ON u.profile_picture_id = img_profile.image_id
WHERE
    d.destination_id = $1
ORDER BY
    r.date_posted DESC`;

const getEditReviewById = `SELECT
    d.destination_name,
    r.review_body
FROM
    reviews r
LEFT JOIN
    destinations d ON r.destination_id = d.destination_id
WHERE
    r.review_id = $1`;

const queryReviewCardsByKeyword = `SELECT
    r.review_id,
    d.destination_name,
    d.destination_category,
    img_profile.location AS author_profile_picture_location,
    u.nickname AS author_nickname,
    u.user_id AS author_id,
    r.review_body,
    r.date_posted
FROM
    reviews r
LEFT JOIN
    destinations d ON r.destination_id = d.destination_id
LEFT JOIN
    users u ON r.author_id = u.user_id
LEFT JOIN
    images img_profile ON u.profile_picture_id = img_profile.image_id
WHERE
	LOWER(UNACCENT(r.review_body)) LIKE LOWER(UNACCENT('%'||$1||'%')) OR
	LOWER(UNACCENT(d.destination_name)) LIKE LOWER(UNACCENT('%'||$1||'%'))
ORDER BY
    r.date_posted DESC`;

const getUserInfoById = `SELECT
    u.user_id,
    u.email,
    u.full_name,
    u.nickname,
    img_profile.location AS profile_picture_location,
    img_background.location AS background_picture_location
FROM
    users u
LEFT JOIN
    images img_profile ON u.profile_picture_id = img_profile.image_id
LEFT JOIN
    images img_background ON u.background_picture_id = img_background.image_id
WHERE
    u.user_id = $1`;

const getReviewIdsSavedByUser = `SELECT
    review_id
FROM
    saved_reviews
WHERE
    user_id = $1`;

module.exports = {
    getReviewCards,
    getReviewCardsWhereAuthorId,
    getReviewCardsWhereDestinationId,
    getEditReviewById,
    queryReviewCardsByKeyword,
    getUserInfoById,
    getReviewIdsSavedByUser
}