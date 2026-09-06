// ==================================================
// 文化祭シフト管理
// パスワード設定
// ==================================================

const SHIFT_PASSWORD = "craftshift";

const loginForm =
    document.getElementById("loginForm");

const passwordInput =
    document.getElementById("password");

const errorMessage =
    document.getElementById("errorMessage");


// すでにログインしている場合
if (
    sessionStorage.getItem(
        "shiftSystemLogin"
    ) === "true"
) {

    window.location.replace(
        "index.html"
    );
}


// ログイン処理
loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const enteredPassword =
            passwordInput.value;


        if (
            enteredPassword ===
            SHIFT_PASSWORD
        ) {

            sessionStorage.setItem(
                "shiftSystemLogin",
                "true"
            );

            window.location.replace(
                "index.html"
            );

        } else {

            errorMessage.textContent =
                "❌ パスワードが違います。";

            passwordInput.value = "";

            passwordInput.focus();
        }

    }
);
