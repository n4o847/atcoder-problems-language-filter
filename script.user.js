// ==UserScript==
// @name         AtCoder Problems Language Filter
// @namespace    https://github.com/n4o847
// @version      1.0.1
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

        createForm() {
            const panel = document.createElement("div");
            panel.className = "panel panel-default";
            panel.style.marginTop = "20px";
            const content = document.createElement("div");
            content.className = "panel-body";
            panel.appendChild(content);
            const form = document.querySelector("#root > div > div > div > form");
            form.insertAdjacentElement("afterend", panel);
            return content;
        }

        createCheckBoxList() {
            const langs = this.getLanguageList();
            const searchLangs = new Set();
            langs.forEach((lang) => {
                const label = document.createElement("label");
                label.className = "checkbox-inline";
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

        fetchData({ user_id }) {
            const url = new URL("https://kenkoooo.com/atcoder/atcoder-api/results");
            url.searchParams.set("user", user_id);
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
                elem.parentNode.classList.toggle("info", check);
            });
        }
    }

    const loc = new URL(location.href);
    const kind = loc.searchParams.get("kind") || "category";
    if (kind === "category" || kind === "list") {
        const app = new App();
        const user_id = loc.searchParams.get("user");
        app.fetchData({ user_id }).then(() => {
            app.createCheckBoxList();
        });
    }
})();
