// =========================
// データ
// =========================

let shiftData =
    JSON.parse(
        localStorage.getItem("shiftData")
    ) || [];


let staffData =
    JSON.parse(
        localStorage.getItem("staff")
    ) || [];


let timeSlots =
    JSON.parse(
        localStorage.getItem("timeSlots")
    ) || [];


// =========================
// 現在の日
// =========================

let selectedDay = "1";


// =========================
// HTML要素
// =========================

const timeSelect =
    document.getElementById(
        "timeSelect"
    );


const staffSelect =
    document.getElementById(
        "staffSelect"
    );


const registerButton =
    document.getElementById(
        "registerButton"
    );


const shiftList =
    document.getElementById(
        "shiftList"
    );


const shiftTitle =
    document.getElementById(
        "shiftTitle"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


const dayTabs =
    document.querySelectorAll(
        ".day-tab"
    );


// =========================
// 時間帯を読み込む
// =========================

function loadTimes() {

    // 最新の時間帯データを取得
    timeSlots =
        JSON.parse(
            localStorage.getItem("timeSlots")
        ) || [];


    timeSelect.innerHTML = `

        <option value="">
            時間帯を選択してください
        </option>

    `;


    // 選択中の日の時間帯だけ取得

    const daySlots =
        timeSlots
            .filter(
                slot =>
                    String(slot.day) ===
                    String(selectedDay)
            )
            .sort(
                (a, b) =>
                    a.start.localeCompare(
                        b.start
                    )
            );


    // 時間帯を選択肢に追加

    daySlots.forEach(
        slot => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                `${slot.start}〜${slot.end}`;


            option.textContent =
                `${slot.start}〜${slot.end}`;


            timeSelect.appendChild(
                option
            );

        }
    );

}


// =========================
// スタッフを読み込む
// =========================

function loadStaff() {

    staffSelect.innerHTML = `

        <option value="">
            スタッフを選択してください
        </option>

    `;


    staffData.forEach(
        person => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                person.name;


            option.textContent =
                person.name;


            staffSelect.appendChild(
                option
            );

        }
    );

}


// =========================
// シフト登録
// =========================


registerButton.addEventListener(
    "click",
    function() {

        if (
            registerButton.dataset.editing === "true"
        ) {

            saveEditedShift();

            return;

}

        const time =
            timeSelect.value;


        const staff =
            staffSelect.value;


        const jobElement =
            document.querySelector(
                'input[name="job"]:checked'
            );


        // 入力チェック

        if (!time) {

            alert(
                "時間帯を選択してください。"
            );

            return;

        }


        if (!staff) {

            alert(
                "スタッフを選択してください。"
            );

            return;

        }


        if (!jobElement) {

            alert(
                "担当を選択してください。"
            );

            return;

        }


        const job =
            jobElement.value;


        // =========================
        // 同じシフトがあるか確認
        // =========================

        const exists =
            shiftData.some(
                shift => {

                    if (
                        String(
                            shift.day
                        ) !==
                        String(
                            selectedDay
                        )
                    ) {

                        return false;

                    }


                    if (
                        shift.time !==
                        time
                    ) {

                        return false;

                    }


                    const sales =
                        Array.isArray(
                            shift.sales
                        )
                            ? shift.sales
                            : [];


                    const workshop =
                        Array.isArray(
                            shift.workshop
                        )
                            ? shift.workshop
                            : [];


                    const breaks =
                        Array.isArray(
                            shift.break
                        )
                            ? shift.break
                            : [];


                    return (
                        sales.includes(
                            staff
                        ) ||
                        workshop.includes(
                            staff
                        ) ||
                        breaks.includes(
                            staff
                        )
                    );

                }
            );


        if (exists) {

            alert(
                "このスタッフには、すでにこの時間のシフトが登録されています。"
            );

            return;

        }


        // =========================
        // 該当する時間帯を探す
        // =========================

        let shift =
            shiftData.find(
                item => {

                    return (
                        String(
                            item.day
                        ) ===
                        String(
                            selectedDay
                        ) &&
                        item.time ===
                        time
                    );

                }
            );


        // なければ作る

        if (!shift) {

            shift = {

                day:
                    selectedDay,

                time:
                    time,

                sales: [],

                workshop: [],

                break: []

            };


            shiftData.push(
                shift
            );

        }


        // =========================
        // 担当別に追加
        // =========================

        if (
            job === "sales"
        ) {

            if (
                !Array.isArray(
                    shift.sales
                )
            ) {

                shift.sales = [];

            }


            shift.sales.push(
                staff
            );

        }


        if (
            job === "workshop"
        ) {

            if (
                !Array.isArray(
                    shift.workshop
                )
            ) {

                shift.workshop = [];

            }


            shift.workshop.push(
                staff
            );

        }


        if (
            job === "break"
        ) {

            if (
                !Array.isArray(
                    shift.break
                )
            ) {

                shift.break = [];

            }


            shift.break.push(
                staff
            );

        }


        // 保存

        localStorage.setItem(
            "shiftData",
            JSON.stringify(
                shiftData
            )
        );


        // フォームをリセット

        staffSelect.value =
            "";

        document
            .querySelectorAll(
                'input[name="job"]'
            )
            .forEach(
                radio =>
                    radio.checked =
                        false
            );


        // 表示更新

        displayShifts();

    }
);


// =========================
// 登録済みシフト表示
// =========================

function displayShifts() {

    shiftTitle.textContent =
        `${selectedDay}日目のシフト`;

    shiftList.innerHTML = "";


    const dayShifts =
        shiftData.filter(
            shift =>
                String(shift.day) ===
                String(selectedDay)
        );


    // シフトがない

    if (dayShifts.length === 0) {

        shiftList.innerHTML = `

            <p class="empty-message">
                まだシフトが登録されていません。
            </p>

        `;

        return;
    }


    // 時間順

    dayShifts.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    dayShifts.forEach(
        shift => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "shift-edit-item";


            const sales =
                Array.isArray(
                    shift.sales
                )
                    ? shift.sales
                    : [];


            const workshop =
                Array.isArray(
                    shift.workshop
                )
                    ? shift.workshop
                    : [];


            const breaks =
                Array.isArray(
                    shift.break
                )
                    ? shift.break
                    : [];


            let html = `

                <div class="shift-edit-time">
                    🕐 ${shift.time}
                </div>

            `;


            // =========================
            // 物販
            // =========================

            if (
                sales.length > 0
            ) {

                html += `

                    <div class="shift-person-group">

                        <div class="shift-job-title">
                            🛍️ 物販
                        </div>

                `;


                sales.forEach(
                    name => {

                        html += `

                            <div class="shift-person">

                                <span>
                                    ${name}
                                </span>

                                <div>

                                    <button
                                        class="edit-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="sales">

                                        ✏️

                                    </button>

                                    <button
                                        class="delete-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="sales">

                                        🗑️

                                    </button>

                                </div>

                            </div>

                        `;

                    }
                );


                html += `</div>`;

            }


            // =========================
            // ワークショップ
            // =========================

            if (
                workshop.length > 0
            ) {

                html += `

                    <div class="shift-person-group">

                        <div class="shift-job-title">
                            🎨 ワークショップ
                        </div>

                `;


                workshop.forEach(
                    name => {

                        html += `

                            <div class="shift-person">

                                <span>
                                    ${name}
                                </span>

                                <div>

                                    <button
                                        class="edit-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="workshop">

                                        ✏️

                                    </button>

                                    <button
                                        class="delete-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="workshop">

                                        🗑️

                                    </button>

                                </div>

                            </div>

                        `;

                    }
                );


                html += `</div>`;

            }


            // =========================
            // 休憩
            // =========================

            if (
                breaks.length > 0
            ) {

                html += `

                    <div class="shift-person-group">

                        <div class="shift-job-title">
                            ☕ 休憩
                        </div>

                `;


                breaks.forEach(
                    name => {

                        html += `

                            <div class="shift-person">

                                <span>
                                    ${name}
                                </span>

                                <div>

                                    <button
                                        class="edit-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="break">

                                        ✏️

                                    </button>

                                    <button
                                        class="delete-person-button"
                                        data-time="${shift.time}"
                                        data-name="${name}"
                                        data-job="break">

                                        🗑️

                                    </button>

                                </div>

                            </div>

                        `;

                    }
                );


                html += `</div>`;

            }


            item.innerHTML =
                html;


            shiftList.appendChild(
                item
            );

        }
    );


    // =========================
    // 編集ボタン
    // =========================

    document
        .querySelectorAll(
            ".edit-person-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        editPersonShift(
                            this.dataset.time,
                            this.dataset.name,
                            this.dataset.job
                        );

                    }
                );

            }
        );


    // =========================
    // 削除ボタン
    // =========================

    document
        .querySelectorAll(
            ".delete-person-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        deletePersonShift(
                            this.dataset.time,
                            this.dataset.name,
                            this.dataset.job
                        );

                    }
                );

            }
        );

}


// =========================
// 日付タブ
// =========================

dayTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            function() {

                dayTabs.forEach(
                    otherTab =>
                        otherTab.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                selectedDay =
                    this.dataset.day;


                // 時間帯をその日のものに更新

                loadTimes();


                // シフト表示も更新

                displayShifts();

            }
        );

    }
);


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

// =========================
// スタッフ1人分を編集
// =========================

function editPersonShift(
    time,
    name,
    job
) {

    const shift =
        shiftData.find(
            item =>
                String(item.day) ===
                    String(selectedDay) &&
                item.time === time
        );


    if (!shift) {

        return;

    }


    // 元の担当から削除

    if (
        Array.isArray(
            shift[job]
        )
    ) {

        shift[job] =
            shift[job].filter(
                person =>
                    person !== name
            );

    }


    // 時間帯を選択

    timeSelect.value =
        time;


    // スタッフを選択

    staffSelect.value =
        name;


    // 担当を選択

    const radio =
        document.querySelector(
            `input[name="job"][value="${job}"]`
        );


    if (radio) {

        radio.checked =
            true;

    }


    // 保存ボタンを編集モードにする

    registerButton.textContent =
        "変更を保存";


    registerButton.dataset.editing =
        "true";


    registerButton.dataset.oldTime =
        time;


    registerButton.dataset.oldName =
        name;


    registerButton.dataset.oldJob =
        job;

}

// =========================
// 編集したシフトを保存
// =========================

function saveEditedShift() {

    const newTime =
        timeSelect.value;


    const newName =
        staffSelect.value;


    const jobElement =
        document.querySelector(
            'input[name="job"]:checked'
        );


    if (!newTime) {

        alert(
            "時間帯を選択してください。"
        );

        return;

    }


    if (!newName) {

        alert(
            "スタッフを選択してください。"
        );

        return;

    }


    if (!jobElement) {

        alert(
            "担当を選択してください。"
        );

        return;

    }


    const newJob =
        jobElement.value;


    // =========================
    // 新しい時間帯を探す
    // =========================

    let shift =
        shiftData.find(
            item =>
                String(item.day) ===
                    String(selectedDay) &&
                item.time === newTime
        );


    // なければ作成

    if (!shift) {

        shift = {

            day:
                selectedDay,

            time:
                newTime,

            sales: [],

            workshop: [],

            break: []

        };


        shiftData.push(
            shift
        );

    }


    // 配列を用意

    if (
        !Array.isArray(
            shift[newJob]
        )
    ) {

        shift[newJob] = [];

    }


    // 重複確認

    if (
        !shift[newJob].includes(
            newName
        )
    ) {

        shift[newJob].push(
            newName
        );

    }


    // 保存

    localStorage.setItem(
        "shiftData",
        JSON.stringify(
            shiftData
        )
    );


    // 編集モード解除

    registerButton.textContent =
        "シフトを登録";


    delete registerButton.dataset.editing;
    delete registerButton.dataset.oldTime;
    delete registerButton.dataset.oldName;
    delete registerButton.dataset.oldJob;


    // フォームリセット

    staffSelect.value =
        "";

    timeSelect.value =
        "";


    document
        .querySelectorAll(
            'input[name="job"]'
        )
        .forEach(
            radio =>
                radio.checked =
                    false
        );


    displayShifts();


    alert(
        "シフトを変更しました！"
    );

}

// =========================
// スタッフ1人分を削除
// =========================

function deletePersonShift(
    time,
    name,
    job
) {

    const shift =
        shiftData.find(
            item =>
                String(item.day) ===
                    String(selectedDay) &&
                item.time === time
        );


    if (!shift) {

        return;

    }


    const jobNames =
        Array.isArray(
            shift[job]
        )
            ? shift[job]
            : [];


    const jobText = {

        sales:
            "🛍️ 物販",

        workshop:
            "🎨 ワークショップ",

        break:
            "☕ 休憩"

    };


    const result =
        confirm(
            `${name}さんの${jobText[job]}を削除しますか？`
        );


    if (!result) {

        return;

    }


    shift[job] =
        jobNames.filter(
            person =>
                person !== name
        );


    // 全部空になったら時間帯自体を削除

    const salesEmpty =
        !shift.sales ||
        shift.sales.length === 0;


    const workshopEmpty =
        !shift.workshop ||
        shift.workshop.length === 0;


    const breakEmpty =
        !shift.break ||
        shift.break.length === 0;


    if (
        salesEmpty &&
        workshopEmpty &&
        breakEmpty
    ) {

        shiftData =
            shiftData.filter(
                item =>
                    !(
                        String(item.day) ===
                            String(selectedDay) &&
                        item.time === time
                    )
            );

    }


    localStorage.setItem(
        "shiftData",
        JSON.stringify(
            shiftData
        )
    );


    displayShifts();

}


// =========================
// 初期表示
// =========================

loadTimes();

loadStaff();

displayShifts();