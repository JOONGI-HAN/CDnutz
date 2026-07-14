const usernameValidator = (username) => {
    if (username.includes("@") || username.includes(" ")) {
        return "Username and cannot include '@' symbol or an empty space"
    }
    return ""
}

const emailValidator = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
        return "Please enter a valid email address"
    }
    return ""
}

const passwordValidator = (password) => {
    if (password.length < 12) {
        return "Password must be at least 12 characters long"
    }
    if (/^[0-9]+$/.test(password)) {
        return "Password cannot contain only numbers"
    }
    return ""
}

const confirmPasswordValidator = (originalPassword, confirmedPassword) => {
    if (originalPassword !== confirmedPassword) {
        return "Passwords do not match"
    }
    return ""
}



export {usernameValidator, emailValidator, passwordValidator, confirmPasswordValidator}