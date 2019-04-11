// ==UserScript==
// @name         AtCoder Problems Language Filter
// @namespace    https://github.com/n4o847
// @version      1.0.2
// @description  AtCoder Problems で言語を指定して色付けできるようにします
// @author       n4o847
// @match        https://kenkoooo.com/atcoder/*
// ==/UserScript==

(function () {
    'use strict';

    class App {
        constructor() {
            this.data = [];
            this.content = this.createForm();
        }

        start() {
            window.addEventListener("hashchange", () => {
                this.update();
            });
            this.update();
        }

        update() {
            const user = this.getCurrentUser();
            if (user) {
                this.fetchData({ user }).then(() => {
                    this.createCheckBoxList();
                });
            }
        }

        getCurrentUser() {
            const args = location.hash.split("/");
            if (args[1] === "table") {
                return args[2];
            } else {
                return null;
            }
        }

        createForm() {
            const panel = document.createElement("div");
            panel.className = "card";
            panel.style.marginTop = "20px";
            const content = document.createElement("div");
            content.className = "card-body";
            panel.appendChild(content);
            const form = document.querySelector("#root > div > nav");
            form.insertAdjacentElement("afterend", panel);
            return content;
        }

        createCheckBoxList() {
            const langs = this.getLanguageList();
            const searchLangs = new Set();
            this.content.innerHTML = null;
            langs.forEach((lang) => {
                const label = document.createElement("label");
                label.style.marginLeft = "10px";
                const input = document.createElement("input");
                input.type = "checkbox";
                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + lang));
                label.addEventListener("click", () => {
                    input.checked ? searchLangs.add(lang) : searchLangs.delete(lang);
                    this.checkACProblemsByLanguages(searchLangs);
                });
                this.content.appendChild(label);
            });
        }

        fetchData({ user }) {
            const url = new URL("https://kenkoooo.com/atcoder/atcoder-api/results");
            url.searchParams.set("user", user);
            return fetch(url).then((res) => res.json()).then((data) => (this.data = data));
        }

        getLanguageList() {
            const langs = new Set();
            this.data.forEach((entry) => {
                langs.add(entry.language);
            });
            return Array.from(langs).sort();
        }

        getACProblemIdSetByLanguages(langs) {
            return new Set(
                this.data
                    .filter((entry) => entry.result === "AC" && langs.has(entry.language))
                    .map((entry) => entry.problem_id)
            );
        }

        checkACProblemsByLanguages(langs) {
            const ids = this.getACProblemIdSetByLanguages(langs);
            document.querySelectorAll("a").forEach((elem) => {
                const match = elem.href.match(/\/contests\/[^/]+\/tasks\/([^/]+)/);
                const check = !!match && ids.has(match[1]);
                elem.parentNode.classList.toggle("table-info", check);
            });
        }
    }

    const app = new App();
    app.start();
})();
