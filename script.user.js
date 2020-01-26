// ==UserScript==
// @name         AtCoder Problems Language Filter
// @namespace    https://github.com/n4o847
// @version      2.0.0
// @description  AtCoder Problems で言語を指定して色付けできるようにします
// @author       n4o847
// @match        https://kenkoooo.com/atcoder/*
// ==/UserScript==

(function () {
    'use strict';

    class App {
        constructor() {
            this.data = [];
            this.form = null;
        }

        start() {
            this.insertStyleSheet();
            window.addEventListener("hashchange", () => {
                this.update();
            });
            this.update();
        }

        async update() {
            const user = this.getCurrentUser();
            if (user) {
                this.data = await this.fetchData({ user });
                if (this.form) {
                    this.removeForm(this.form);
                }
                this.form = this.createForm();
                this.insertForm(this.form);
            } else {
                if (this.form) {
                    this.removeForm(this.form);
                    this.form = null;
                }
            }
        }

        insertStyleSheet() {
            const style = document.createElement("style");
            document.head.appendChild(style);
            const styleSheet = style.sheet;
            styleSheet.insertRule(`.aplf-table-info { background-color: #bee5eb; }`, styleSheet.cssRules.length);
        }

        getCurrentUser() {
            const args = location.hash.split("/");
            if (args[1] === "table") {
                return args[2];
            } else {
                return null;
            }
        }

        insertForm(form) {
            const parent = document.querySelector("#root > div > div.container");
            parent.insertAdjacentElement("afterbegin", form);
        }

        removeForm(form) {
            form.parentNode.removeChild(form);
        }

        createForm() {
            const langs = this.getLanguageList();
            const searchLangs = new Set();
            const card = document.createElement("div");
            card.className = "card";
            card.style.marginTop = "20px";
            const content = document.createElement("div");
            content.className = "card-body";
            card.appendChild(content);
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
                content.appendChild(label);
            });
            return card;
        }

        async fetchData({ user }) {
            const url = new URL("https://kenkoooo.com/atcoder/atcoder-api/results");
            url.searchParams.set("user", user);
            const req = await fetch(url);
            const data = await req.json();
            return data;
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
                elem.parentNode.classList.toggle("aplf-table-info", check);
            });
        }
    }

    const app = new App();
    app.start();
})();
