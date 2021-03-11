function saveOptions(e) {
    e.preventDefault();
    // @ts-ignore
    browser.storage.sync.set({color: document.querySelector("#color").value});
}

function restoreOptions() {

    function setCurrentChoice(result) { // @ts-ignore
        document.querySelector("#color").value = result.color || "blue";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    // @ts-ignore
    let getting = browser.storage.sync.get("color");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
