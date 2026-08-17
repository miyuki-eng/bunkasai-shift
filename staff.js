// =========================
// Firebase
// =========================

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    push,
    set,
    remove
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import {
    getAuth,
    signInAnonymously
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// =========================
// Firebase設定
// =========================

const firebaseConfig = {

    apiKey: "AIzaSyD_gYOoHpgbxHH4u7pEJIDK0yX7IRBlD-A",

    authDomain:
        "bunkasai-shift-ba044.firebaseapp.com",

    databaseURL:
        "https://bunkasai-shift-ba044-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "bunkasai-shift-ba044",

    storageBucket:
        "bunkasai-shift-ba044.firebasestorage.app",

    messagingSenderId:
        "415230184888",

    appId:
        "1:415230184888:web:ccb285a6843c558cf3134d"

};


// =========================
// Firebase初期化
// =========================

const app =
    initializeApp(
        firebaseConfig
    );


const database =
    getDatabase(app);


const auth =
    getAuth(app);


// =========================
// HTML要素
// =========================

const staffForm =
    document.getElementById(
        "staffForm"
    );

const staffName =
    document.getElementById(
        "staffName"
    );

const staffList =
    document.getElementById(
        "staffList"
    );

const backButton =
    document.getElementById(
        "backButton"
    );


// =========================
// スタッフデータ
// =========================

let staff = [];


// =========================
// Firebaseにログイン
// =========================

signInAnonymously(auth)

    .then(() => {

        console.log(
            "Firebaseに接続しました"
        );

        loadStaff();

    })

    .catch(error => {

        console.error(
            "Firebaseログインエラー:",
            error
        );

        alert(
            "Firebaseに接続できませんでした。"
        );

    });


// =========================
// スタッフ読み込み
// =========================

function loadStaff() {

    const staffRef =
        ref(
            database,
            "staff"
        );


    onValue(
        staffRef,
        snapshot => {

            const data =
                snapshot.val();


            if (!data) {

                staff = [];

            } else {

                staff =
                    Object.entries(
                        data
                    ).map(
                        ([id, person]) => ({

                            id: id,

                            name:
                                person.name,

                            jobs:
                                person.jobs || []

                        })
                    );

            }


            displayStaff();

        }
    );

}


// =========================
// スタッフ表示
// =========================

function displayStaff() {

    staffList.innerHTML = "";


    if (
        staff.length === 0
    ) {

        staffList.innerHTML = `
            <p class="empty-message">
                まだスタッフが登録されていません。
            </p>
        `;

        return;

    }


    staff.forEach(person => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "staff-item";


        card.innerHTML = `

            <div class="staff-info">

                <h3>
                    👤 ${person.name}
                </h3>

                <p>
                    担当：
                    ${
                        person.jobs.length > 0
                            ? person.jobs.join("・")
                            : "未設定"
                    }
                </p>

            </div>


            <div class="staff-buttons">

                <button
                    class="edit-button"
                    data-id="${person.id}"
                >
                    編集
                </button>


                <button
                    class="delete-button"
                    data-id="${person.id}"
                >
                    削除
                </button>

            </div>

        `;


        // 編集

        card
            .querySelector(
                ".edit-button"
            )
            .addEventListener(
                "click",
                () => {

                    editStaff(
                        person.id
                    );

                }
            );


        // 削除

        card
            .querySelector(
                ".delete-button"
            )
            .addEventListener(
                "click",
                () => {

                    deleteStaff(
                        person.id
                    );

                }
            );


        staffList.appendChild(
            card
        );

    });

}


// =========================
// スタッフ登録
// =========================

staffForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            staffName.value.trim();


        if (!name) {

            return;

        }


        const checkedJobs =
            document.querySelectorAll(
                'input[name="job"]:checked'
            );


        const jobs =
            Array.from(
                checkedJobs
            )
            .map(
                job => job.value
            );


        try {

            const staffRef =
                push(
                    ref(
                        database,
                        "staff"
                    )
                );


            await set(
                staffRef,
                {

                    name: name,

                    jobs: jobs

                }
            );


            staffForm.reset();


            alert(
                "スタッフを登録しました！"
            );

        }

        catch (error) {

            console.error(
                error
            );

            alert(
                "スタッフの登録に失敗しました。"
            );

        }

    }
);


// =========================
// スタッフ編集
// =========================

async function editStaff(id) {

    const person =
        staff.find(
            item =>
                item.id === id
        );


    if (!person) {

        return;

    }


    const newName =
        prompt(
            "スタッフ名を入力してください",
            person.name
        );


    if (
        newName === null ||
        newName.trim() === ""
    ) {

        return;

    }


    try {

        await set(
            ref(
                database,
                "staff/" + id
            ),
            {

                name:
                    newName.trim(),

                jobs:
                    person.jobs || []

            }
        );


        alert(
            "スタッフ情報を更新しました！"
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "スタッフ情報の更新に失敗しました。"
        );

    }

}


// =========================
// スタッフ削除
// =========================

async function deleteStaff(id) {

    const person =
        staff.find(
            item =>
                item.id === id
        );


    if (!person) {

        return;

    }


    const result =
        confirm(
            `${person.name}さんを削除しますか？`
        );


    if (!result) {

        return;

    }


    try {

        await remove(
            ref(
                database,
                "staff/" + id
            )
        );


        alert(
            "スタッフを削除しました。"
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "スタッフの削除に失敗しました。"
        );

    }

}


// =========================
// 戻る
// =========================

backButton.addEventListener(
    "click",
    function() {

        location.href =
            "index.html";

    }
);