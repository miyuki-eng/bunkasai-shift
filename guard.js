// ==================================================
// 文化祭シフト管理
// パスワードガード
// ==================================================

const isLoggedIn =
    sessionStorage.getItem(
        "shiftSystemLogin"
    ) === "true";


if (!isLoggedIn) {

    window.location.replace(
        "password.html"
    );

}