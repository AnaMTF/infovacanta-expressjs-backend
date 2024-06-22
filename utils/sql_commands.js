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

module.exports = {
    getReviewCards,
    getReviewCardsWhereAuthorId,
    getReviewCardsWhereDestinationId
}