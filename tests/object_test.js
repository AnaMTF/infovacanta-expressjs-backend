const user = {
    id: 1,
    username: "john_doe",
    password: "password"
}

const saved_review_ids = [
    {
        review_id: 1
    },
    {
        review_id: 2
    },
    {
        review_id: 3
    }
]

const saved_review_ids_list = saved_review_ids.map(review => review.review_id);

console.log(saved_review_ids_list); // [ 1, 2, 3 ]

const user_new = {
    ...user,
    saved: saved_review_ids.map(review => review.review_id)
}

delete user_new.password;
console.log(user_new); // { id: 1, username: 'john_doe', password: 'password', saved: [ 1, 2, 3 ] }