export const User = ({
 username = null,
 fullname = null,
 email = null,
 isAdmin = false,
} = {}) => ({
    username,
    fullname,
    email,
    isAdmin,
});
