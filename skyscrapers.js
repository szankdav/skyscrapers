"use strict";

// Többször felhasználásra kerülő constansok, és változók
const baseUrl = "http://skyscrapers.tanulosarok.eu:9401/api/skyscrapers";
const newSkyscraperModal = new bootstrap.Modal("#newSkyscraperModal");
const newSkyscraperButton = document.getElementById("newSkyscraperButton");
const skyscrapersRow = document.getElementById("skyscrapers");
const modalSubmitButton = document.getElementById("modalSubmitButton")

// Oldal betöltődésekor a modal-on belüli gombnak legyen szövege
modalSubmitButton.innerHTML = "Add new skyscraper!"

// Modal input mezői
const formName = document.getElementById("name");
const formCity = document.getElementById("city");
const formHeight = document.getElementById("height");
const formStories = document.getElementById("stories");
const formFinished = document.getElementById("finished");

// Egy bool változó, hogy az új felhőkarcoló feltöltésekor, és módosításkor ne kelljen kettő modalt használni
let modifying = false;
// Módosítandó felhőkarcoló ID-ja
let modifyingId;

// A modal "X" és Close gombjai
const closeModalButtons = document.getElementsByClassName("closeModal")

// Ha rányomok a módosításra, de mégsem módosítok, visszaállítom a modal input mezőit
// és a gomb szövegét, valamint nullázom az ID értéket
// Ez azért kellett, mert ha enélkül először módosításra nyomunk, mégsézünk, és utána
// akarunk új felhőkarcolót felvinni, akkor a módosítás gombra kattintás miatt már
// el lesznek mentve az adatok a modal formjában, és új felvitelkor megjelennek
for(const closeModalButton of closeModalButtons){
  closeModalButton.addEventListener("click", () => {
    modifying = false
    formName.value = "";
    formCity.value = "";
    formHeight.value = "";
    formStories.value = "";
    formFinished.value = "";
    modifyingId = 0
    modalSubmitButton.innerHTML = "Add new skyscraper!"
  })
}

// Modal előhozatala
newSkyscraperButton.addEventListener("click", () => {
  newSkyscraperModal.show();
});

// Táblázat generálása
function generateTable(rows) {
  const table = document.createElement("table");
  table.classList.add("table", "table-striped");
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  tr.classList.add("table-primary");
  const tbody = document.createElement("tbody");
  const headers = ["Name", "City", "Height", "Stories", "Finished", "Admin"];

  for (const header of headers) {
    const th = document.createElement("th");
    th.append(header);
    tr.append(th);
  }

  for (const rowDatas of rows) {
    tbody.append(generateRow(rowDatas));
  }

  thead.append(tr);
  table.append(thead);
  table.append(tbody);

  return table;
}

// Táblázat sor generálása
function generateRow(datasForRow) {
  const tr = document.createElement("tr");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger", "mx-3");
  deleteButton.innerText = "Delete";
  const modifyButton = document.createElement("button");
  modifyButton.innerText = "Modify";
  modifyButton.classList.add("btn", "btn-warning");

  for (const datas in datasForRow) {
    if (datas != "id") {
      //console.log(datasForRow[datas]);
      const td = document.createElement("td");
      td.append(document.createTextNode(datasForRow[datas]));
      deleteButton.dataset.id = datasForRow["id"];
      modifyButton.dataset.id = datasForRow["id"];
      tr.append(td);
    }
  }

  // Felhőkarcoló törlése gomb funkciója
  deleteButton.addEventListener("click", (e) => {
    const skyscraperId = e.target.dataset.id;
    deleteSkyscraper(skyscraperId);
  });

  // Felhőkarcoló módosítása gomb funkciója
  modifyButton.addEventListener("click", (e) => {
    const skyscraperId = e.target.dataset.id;
    modifying = true;
    modalSubmitButton.innerHTML = "Modify!"
    modifySkyscraper(skyscraperId);
  });

  const adminTd = document.createElement("td");
  adminTd.classList.add("d-flex", "justify-content-evenly");
  adminTd.append(modifyButton);
  adminTd.append(deleteButton);
  tr.append(adminTd);
  return tr;
}

// Újrafelhasználható config a fetchez, én nem szoktam így használni, de legyen egy ilyen is
const getConfig = {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

// A felhőkarcolók lekérése, és táblázatba írása
function loadSkyscrapers() {
  fetch(baseUrl, getConfig)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error while fetching skyscrapers!");
      }
      return res.json();
    })
    .then((datas) => {
      //console.log(datas)
      skyscrapersRow.append(generateTable(datas));
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err);
    });
}

// A modal formja
const newSkyscraperForm = document.querySelector("#newSkyscraperModal form");

// If ággal ellenőrzöm, hogy új felvitelről vagy módosításról van-e szó, és annak
// függvényében PUT vagy POST fetch
// Mindkét fetch végén újratöltöm a táblát, mivel nem használtam setTimeout-ot, 
// a szerver válasza van, hogy lassabb. Ha vártok kicsit az alert ablak felugrásánál
// és úgy okézzátok le, akkor biztos, hogy megjelenik az új feltöltés. Ha nagyon gyorsak
// vagytok, akkor lehet frissíteni kell az oldalt, mert a javascript túl gyorsan fetcheli
// az új adatokat ahhoz képest, hogy mi mikor töltöttük fel. setTimeout megoldás lenne, 
// de mivel ezt annak szántam, hogy legyen egy kész használható feladat, nem akartam belekavarni
newSkyscraperForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (modifying) {
    const skyscraper = new FormData(newSkyscraperForm);
    fetch(`${baseUrl}/${modifyingId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(skyscraper.entries())),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error while modifying skyscraper!");
        }
        modifying = false
        return alert("Successfully modified!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error: " + err);
      });
    newSkyscraperModal.hide();
    skyscrapersRow.innerHTML = "";
    loadSkyscrapers();
  } else {
    const skyscraper = new FormData(newSkyscraperForm);

    fetch(baseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(skyscraper.entries())),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error while adding new skyscraper!");
        }
        return alert("Success!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error: " + err);
      });
    newSkyscraperModal.hide();
    skyscrapersRow.innerHTML = "";
    loadSkyscrapers();
  }
});

// Felhőkarcoló törlése
function deleteSkyscraper(id) {
  fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => {
      if (res == 404) {
        throw new Error("Error while deleting skyscraper!");
      }
      // Sor törlése a táblából, oldal újratöltése nélkül
      const idRow = document.querySelector(`[data-id="${id}"]`).parentElement
        .parentElement;
      idRow.remove();
      alert("Skyscraper deleted!");
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err);
    });
}

// Felhőkarcoló módosítása. Id alapján fetch, és a módosítandó felhőkarcoló adatait 
// betöltöm a modal formjába
function modifySkyscraper(id) {
  fetch(`${baseUrl}/${id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error while fetching skyscrapers!");
      }
      return res.json();
    })
    .then((datas) => {
      console.log(datas);
      formName.value = datas["name"];
      formCity.value = datas["city"];
      formHeight.value = datas["height"];
      formStories.value = datas["stories"];
      formFinished.value = datas["finished"];
      modifyingId = datas["id"]
      //const datas = new FormData(data)
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err);
    });
  newSkyscraperModal.show();
}

// Belépési pont, oldal betöltésekor
loadSkyscrapers();
