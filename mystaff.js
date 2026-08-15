// =========================
// データ
// =========================

let staff = [];
let shiftData = [];


// =========================
// HTML要素
// =========================

const staffSelect =
    document.getElementById("staffSelect");

const myShiftList =
    document.getElementById("myShiftList");

const shiftTitle =
    document.getElementById("shiftTitle");

const backButton =
    document.getElementById("backButton");

const dayTabs =
    document.querySelectorAll(".day-tab");


// =========================
// 選択中の日
// =========================

let selectedDay = "1";


// =========================
// 最新データを読み込む
// =========================

function loadData() {

    staff =
        JSON.parse(
            localStorage.getItem("staff")
        ) || [];

    shiftData =
        JSON.parse(
            localStorage.getItem("shiftData")
        ) || [];

}


// =========================
// スタッフ一覧を読み込む
// =========================

function loadStaff() {

    loadData();


    staffSelect.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "スタッフを選択してください";

    staffSelect.appendChild(
        defaultOption
    );


    staff.forEach(
        person => {

            if (
                !person ||
                !person.name
            ) {
                return;
            }


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
// 配列にする
// =========================

function toArray(value) {

    if (Array.isArray(value)) {

        return value;

    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return [];

    }


    return [value];

}


// =========================
// スタッフ別シフト表示
// =========================

function displayMyShift() {

    // 最新データを読み込む

    loadData();


    myShiftList.innerHTML = "";


    const selectedStaff =
        staffSelect.value;


    shiftTitle.textContent =
        `${selectedDay}日目のシフト`;


    // =========================
    // スタッフ未選択
    // =========================

    if (!selectedStaff) {

        myShiftList.innerHTML = `
            <p class="empty-message">
                スタッフを選択してください。
            </p>
        `;

        return;

    }


    // =========================
    // 自分のシフトだけ取得
    // =========================

    const myShifts =
        shiftData
            .filter(
                shift =>
                    String(shift.day) ===
                    String(selectedDay)
            )
            .filter(
                shift => {

                    const sales =
                        toArray(
                            shift.sales
                        );


                    const workshop =
                        toArray(
                            shift.workshop
                        );


                    const breaks =
                        toArray(
                            shift.break
                        );


                    return (
                        sales.includes(
                            selectedStaff
                        ) ||

                        workshop.includes(
                            selectedStaff
                        ) ||

                        breaks.includes(
                            selectedStaff
                        )
                    );

                }
            );


    // =========================
    // 時間順
    // =========================

    myShifts.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    // =========================
    // シフトなし
    // =========================

    if (
        myShifts.length === 0
    ) {

        myShiftList.innerHTML = `
            <p class="empty-message">
                この日のシフトはありません。
            </p>
        `;

        return;

    }


    // =========================
    // シフト表示
    // =========================

    myShifts.forEach(
        shift => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "my-shift-item";


            const sales =
                toArray(
                    shift.sales
                );


            const workshop =
                toArray(
                    shift.workshop
                );


            const breaks =
                toArray(
                    shift.break
                );


            let jobs = [];


            // =========================
            // 物販
            // =========================

            if (
                sales.includes(
                    selectedStaff
                )
            ) {

                jobs.push(
                    "🛍️ 物販"
                );

            }


            // =========================
            // ワークショップ
            // =========================

            if (
                workshop.includes(
                    selectedStaff
                )
            ) {

                jobs.push(
                    "🎨 ワークショップ"
                );

            }


            // =========================
            // 休憩
            // =========================

            if (
                breaks.includes(
                    selectedStaff
                )
            ) {

                jobs.push(
                    "☕ 休憩"
                );

            }


            item.innerHTML = `

                <div class="my-shift-time">
                    🕐 ${shift.time}
                </div>

                <div class="my-shift-job">
                    ${jobs.join(" / ")}
                </div>

            `;


            myShiftList.appendChild(
                item
            );

        }
    );

}


// =========================
// スタッフ変更
// =========================

staffSelect.addEventListener(
    "change",
    function () {

        displayMyShift();

    }
);


// =========================
// 日付切り替え
// =========================

dayTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            function () {

                dayTabs.forEach(
                    otherTab => {

                        otherTab.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                selectedDay =
                    this.dataset.day;


                displayMyShift();

            }
        );

    }
);


// =========================
// 戻る
// =========================

backButton.addEventListener(
    "click",
    function () {

        location.href =
            "index.html";

    }
);


// =========================
// ページ表示時に最新データ
// =========================

window.addEventListener(
    "pageshow",
    function () {

        const currentName =
            staffSelect.value;


        loadStaff();


        // 以前選んでいたスタッフを復元

        if (
            currentName
        ) {

            const exists =
                Array.from(
                    staffSelect.options
                ).some(
                    option =>
                        option.value ===
                        currentName
                );


            if (exists) {

                staffSelect.value =
                    currentName;

            }

        }


        displayMyShift();

    }
);


// =========================
// 初期表示
// =========================

loadStaff();

displayMyShift();