// =========================
// スタッフデータ
// =========================

let staff =
    JSON.parse(
        localStorage.getItem("staff")
    ) || [];


// =========================
// HTML要素
// =========================

const staffForm =
    document.getElementById("staffForm");

const staffName =
    document.getElementById("staffName");

const staffList =
    document.getElementById("staffList");

const backButton =
    document.getElementById("backButton");


// =========================
// スタッフ表示
// =========================

function displayStaff() {

    staffList.innerHTML = "";


    if (staff.length === 0) {

        staffList.innerHTML = `
            <p class="empty-message">
                まだスタッフが登録されていません。
            </p>
        `;

        return;
    }


    staff.forEach((person, index) => {

        const card =
            document.createElement("div");

        card.className = "staff-item";


        card.innerHTML = `

            <div class="staff-info">

                <h3>
                    👤 ${person.name}
                </h3>

                <p>
                    担当：
                    ${person.jobs.length > 0
                        ? person.jobs.join("・")
                        : "未設定"
                    }
                </p>

            </div>


            <div class="staff-buttons">

                <button
                    class="edit-button"
                    onclick="editStaff(${index})"
                >
                    編集
                </button>


                <button
                    class="delete-button"
                    onclick="deleteStaff(${index})"
                >
                    削除
                </button>

            </div>

        `;


        staffList.appendChild(card);

    });

}


// =========================
// スタッフ登録
// =========================

staffForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            staffName.value.trim();


        // 担当できる仕事を取得

        const checkedJobs =
            document.querySelectorAll(
                'input[name="job"]:checked'
            );


        const jobs =
            Array.from(checkedJobs)
                .map(job => job.value);


        // スタッフを追加

        staff.push({

            name: name,

            jobs: jobs

        });


        // 保存

        localStorage.setItem(
            "staff",
            JSON.stringify(staff)
        );


        // フォームをリセット

        staffForm.reset();


        // 一覧更新

        displayStaff();


        alert(
            "スタッフを登録しました！"
        );

    }
);


// =========================
// スタッフ編集
// =========================

function editStaff(index) {

    const person =
        staff[index];


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


    person.name =
        newName.trim();


    localStorage.setItem(
        "staff",
        JSON.stringify(staff)
    );


    displayStaff();


    alert(
        "スタッフ情報を更新しました！"
    );

}


// =========================
// スタッフ削除
// =========================

function deleteStaff(index) {

    const person =
        staff[index];


    const result =
        confirm(
            `${person.name}さんを削除しますか？`
        );


    if (!result) {

        return;

    }


    staff.splice(index, 1);


    localStorage.setItem(
        "staff",
        JSON.stringify(staff)
    );


    displayStaff();


    alert(
        "スタッフを削除しました。"
    );

}


// =========================
// シフト表へ戻る
// =========================

backButton.addEventListener(
    "click",
    function() {

        location.href = "index.html";

    }
);


// =========================
// 初期表示
// =========================

displayStaff();