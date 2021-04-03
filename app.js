
const lists = {
    homework: document.querySelector("*[name=homework]"),
    tests: document.querySelector("*[name=tests]")
}, data = JSON.parse(localStorage.getItem("ai.pneuj.hwlist.data") ?? "{}");

function updateHomeworkList(app, toast) {
    const homeworkList = {
        homework: {},
        tests: [],
        others: [],
        update: 0,
        date: new Date()
    }
    app.request.get("data/homework_list.txt").then(res => {
        let update = res.data.match(/=========================(\r\n|\n)Update: .+/)[0].replace(/=========================(\r\n|\n)Update: /, "");
        homeworkList.update = update.slice(-1);
        homeworkList.date.setFullYear("20" + update.slice(0, 2), ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(update.slice(2, 5)), update.slice(5, 7));
        let tmr = new Date(homeworkList.date.getTime() + 1000*60*60*24);
        let date = `${tmr.getDate()}/${tmr.getMonth() + 1}`
        { // Today's Homework
            let subjects = res.data.match(/=========================(\r\n|\n)Today's Homework:[\s\S]+?(?=-------------------------)-------------------------/)[0].replace(/=========================(\r\n|\n)Today's Homework:(\r\n|\n)(\r\n|\n)/, "").match(/^\w+:(\r\n|\n)[\s\S]+?(?=(\r\n|\n)\w+:|(\r\n|\n)-------------------------)/gm);
            for (let subject of subjects ?? []) {
                let name = subject.match(/^\w+(?=:(\r\n|\n))/)[0];
                let items = subject.match(/^\d+. .+/gm);
                if (!homeworkList.homework[name]) {
                    homeworkList.homework[name] = [];
                };
                for (let item of items) {
                    homeworkList.homework[name].push({
                        label: item.replace(/^\d+. /, ""),
                        date: date
                    });
                }
            }
            let tests = res.data.match(/-------------------------(\r\n|\n)Dictation \/Test:(\r\n|\n)(\r\n|\n)[\s\S]+?(?=(\r\n|\n)(\r\n|\n)=========================|(\r\n|\n)=========================)/)[0].replace(/-------------------------(\r\n|\n)Dictation \/Test:(\r\n|\n)(\r\n|\n)/, "").match(/.+/g);
            console.log(tests)
            for (let test of tests ?? []) {
                homeworkList.tests.push({
                    label: test,
                    date: date
                });
            }
        }
        {
            let days = res.data.match(/=========================(\r\n|\n)Coming Homework:[\s\S]+?(?=-------------------------)-------------------------/)[0].replace(/=========================(\r\n|\n)Homework \(Next 7 Days\):(\r\n|\n)(\r\n|\n)/, "").match(/^[\d-]{1,2}\/[\d-]{1,2}(\r\n|\n)[\s\S]+?(?=(\r\n|\n)[\d-]{1,2}\/[\d-]{1,2}|(\r\n|\n)-------------------------)(\r\n|\n)/gm);
            for (let day of days ?? []) {
                let date = day.match(/^[\d-]{1,2}\/[\d-]{1,2}/)[0];
                let subjects = day.match(/\w+:(\r\n|\n)[\s\S]+?(?=(\r\n|\n)\w+:|(\r\n|\n)$)/g);
                for (let subject of subjects ?? []) {
                    let name = subject.match(/^\w+(?=:(\r\n|\n))/)[0];
                    let items = subject.match(/^\d+. .+/gm);
                    if (!homeworkList.homework[name]) {
                        homeworkList.homework[name] = [];
                    };
                    for (let item of items) {
                        homeworkList.homework[name].push({
                            label: item.replace(/^\d+. /, ""),
                            date: date
                        });
                    }
                }
            }
        }
        {
            let days = res.data.match(/-------------------------(\r\n|\n)Coming Dictation \/Test:[\s\S]+?(?==========================)=========================/)[0].replace(/-------------------------(\r\n|\n)Dictation \/Test(\r\n|\n)(Next 7 Days):/, "").match(/^[\d-]{1,2}\/[\d-]{1,2}(\r\n|\n)[\s\S]+?(?=(\r\n|\n)[\d-]{1,2}\/[\d-]{1,2}|(\r\n|\n)=========================)(\r\n|\n)/gm);
            for (let day of days ?? []) {
                let date = day.match(/^[\d-]{1,2}\/[\d-]{1,2}/)[0];
                let tests = day.match(/.+/g).slice(1);
                for (let test of tests) {
                    homeworkList.tests.push({
                        label: test,
                        date: date
                    });
                }
            }
        }
        console.log(homeworkList);
        if (Object.keys(homeworkList.homework).length === 0) {
            lists.homework.innerHTML =
            `<li>
                <div class="item-content">
                    <div class="item-inner">
                        <div class="item-title">
                            There doesn't seem to be any homework upcoming, enjoy your day!
                        </div>
                    </div>
                </div>
            </li>`.replace(/\n/g, "");
        }
        if (homeworkList.tests.length === 0) {
            lists.tests.innerHTML =
                `<li>
                    <div class="item-content">
                        <div class="item-inner">
                            <div class="item-title">
                                There doesn't seem to be any tests upcoming, enjoy your day!
                            </div>
                        </div>
                    </div>
                </li>`.replace(/\n/g, "");
        }
        for (let [subject, homework] of Object.entries(homeworkList.homework)) {
            let element = document.createElement("li");
            element.innerHTML =
                `<label class="item-checkbox item-content">
                    <input type="checkbox" name="subject" />
                        <i class="icon icon-checkbox"></i>
                        <div class="item-inner">
                            <div class="item-title">${subject}</div>
                        </div>
                </label>`.replace(/\n/g, "");
            element.querySelector("*[name=subject]").addEventListener("change", ev => {
                for (let homework of element.querySelectorAll("*[name=homework]")) {
                    homework.checked = ev.target.checked;
                    if (!data[subject]) {
                        data[subject] = {};
                    }
                    data[subject][homework.parentElement.querySelector(".item-title").innerText] = ev.target.checked;
                    localStorage.setItem("ai.pneuj.hwlist.data", JSON.stringify(data));
                }
            });
            for (item of homework) {
                let child = document.createElement("ul");
                if (!data[subject]) {
                    data[subject] = {};
                }
                child.innerHTML =
                    `<li>
                        <label class="item-checkbox item-content">
                            <input type="checkbox" name="homework" />
                            <i class="icon icon-checkbox"></i>
                            <div class="item-inner">
                                <div class="item-title">${item.label}</div>
                                <div class="item-after">${item.date}</div>
                            </div>
                        </label>
                    </li>`.replace(/\n/g, "");
                child.querySelector("*[name=homework]").addEventListener("change", ev => {
                    let totalCount = element.querySelectorAll("*[name=homework]").length;
                    let checkedCount = element.querySelectorAll("*[name=homework]:checked").length;
                    let main = element.querySelector("*[name=subject]");
                    if (checkedCount === 0) {
                        main.checked = false;
                        main.indeterminate = false;
                    } else if (checkedCount === totalCount) {
                        main.checked = true;
                        main.indeterminate = false;
                    } else {
                        main.checked = false;
                        main.indeterminate = true;
                    }
                    if (!data[subject]) {
                        data[subject] = {};
                    }
                    data[subject][ev.target.parentElement.querySelector(".item-title").innerText] = ev.target.checked;
                    localStorage.setItem("ai.pneuj.hwlist.data", JSON.stringify(data));
                });
                if (data[subject][item.label]) {
                    setTimeout(() => {
                        child.querySelector("*[name=homework]").click();
                    }, 0);
                }
                element.appendChild(child);
            }
            lists.homework.appendChild(element);
        }
        for (let item of homeworkList.tests) {
            let element = document.createElement("li");
            element.innerHTML =
                `<div class="item-content">
                    <div class="item-inner">
                        <div class="item-title">${item.label}</div>
                        <div class="item-after">${item.date}</div>
                    </div>
                </div>`.replace(/\n/g, "");
            lists.tests.appendChild(element);
        }
        if (toast) {
            app.toast.create({
                text: `Updated to ${homeworkList.date.toDateString()} #${homeworkList.update}`,
                closeTimeout: 2000,
            }).open();
        }
    });
}

const app = new Framework7({
    el: "#app",
    name: "Homework List",
    id: "ai.pneuj.hwlist",
    panel: {
        swipe: false
    },
    autoDarkTheme: true,
    on: {
        init: function() {
            const view = this.views.create(".view-main");
            for (let element of document.querySelectorAll(".ptr-content")) {
                this.ptr.create(element);
            }
            updateHomeworkList(this, location.hash === "#toast" ? true : false);
            location.hash = "";
        },
        ptrRefresh: function(ptr) {
            this.ptr.done(ptr);
            location.hash = "#toast";
            location.reload();
        },
    }
});