
function setDefaultInstills(){
    Object.keys(myCurrentEmotions).forEach((element) =>
    {
        document.getElementById(element).value = 0;
    });
}


function setEventListeners(){
    let emotions = document.getElementsByClassName("emotion");
    let clearButton = document.getElementById("clear-selection");
    let searchBox = document.getElementById("searchBox");
    let emotionQuants = document.getElementsByClassName("emotion_quant");

    searchBox.addEventListener("input",updateTable);
    clearButton.addEventListener("click", clearEmotions);

    Array.from(emotions).forEach(function(emotion) {
        emotion.addEventListener('click', addToEmotions);
      });

    Array.from(emotionQuants).forEach(function(quant) {
        quant.addEventListener('input', updateQuant);
    });

}

function updateQuant(){
    const emotionName = this.getAttribute("name");
    const emotionValue= this.value;
    myCurrentEmotions[emotionName] = emotionValue;
    updateTable()
}

function clearEmotions(){
    document.getElementById("select-list").innerHTML ="";
    document.getElementById("passive-name").textContent = "";
    document.getElementById("passive-tip").textContent = "";

}

async function showcasePassive(list){
    const chosenEmotions = Array.from(list.getElementsByTagName('li')).map(item => item.textContent);
    const json = await getData();
    const passive = json.find(item => JSON.stringify(chosenEmotions) === JSON.stringify(item.distilled_entries));
    if(passive){
        const {name, mod } = passive.implicit_mods[0];
        document.getElementById("passive-name").textContent = name;
        document.getElementById("passive-tip").textContent = mod;
    } else{
        document.getElementById("passive-name").textContent = "This combo does not currently exist.";
        document.getElementById("passive-tip").textContent = "";
    }

}

function addToEmotions(){
    const emotionName = this.getAttribute("title");
    let list = document.getElementById("select-list");
    const imageRef = emotionImageNames[emotionName];
    if(list.getElementsByTagName("li").length < 3){
        let newItem = document.createElement('li');
        const element = `<li><div class="tooltip"><img class="emotion" src="img/${imageRef}.webp" alt="Distilled Ire" title="Distilled Ire"><span class="tooltiptext">${emotionName}</span></div></li>	
        `;
        //newItem.textContent = emotionName;
        list.insertAdjacentHTML("beforeend",element);
    }
    if(list.getElementsByTagName("li").length == 3){
        showcasePassive(list);
    }
}

async function updateTable(){
    let json = await getData();
    const tableBody = document.querySelector("#passives-table tbody");
    tableBody.innerHTML = "";

    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    if(searchQuery != ""){
        json = json.filter(item =>
            item.implicit_mods[0].name.toLowerCase().includes(searchQuery) ||
            item.implicit_mods[0].mod.toLowerCase().includes(searchQuery)
          );
    } 

    const emotionSum = Object.values(myCurrentEmotions).reduce((sum, value) => sum + value, 0);
    if(emotionSum != 0){
        json = json.filter(item =>{
            let value = item.cost;
            let totalUsed = 0;
            //credit to Raelys for this little oil solver
            for (let i = 10-1; i > -1; i--){
                const values = Object.values(myCurrentEmotions);
                const oilValue = 3 ** i;
                const maxEmotions = 3;
                for(let q = values[i]; q > 0 && (value > oilValue || value === oilValue && totalUsed >= maxEmotions - 1); q--){
                    value -= oilValue;
                    totalUsed+=1
                }
                if(value === 0)
                {
                    return true;
                }
            }
            return false;
        });
    }

    json.forEach(item => {
        const distilledEntries = item.distilled_entries.join(", ");
        const name = item.implicit_mods[0].name;
        const mod = item.implicit_mods[0].mod;

        const row = `
        <tr>
          <td>${name}</td>
          <td>${mod}</td>
          <td>${distilledEntries}</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);

    });
}

async function getData(){
    const response = await fetch('/scraper/passives.json');
    const json = await response.json();
    return json;
}

myCurrentEmotions = {
    ire_quantity: "0",
    guilt_quantity: "0",
    greed_quantity: "0",
    paranoia_quantity: "0",
    envy_quantity: "0",
    disgust_quantity: "0",
    despair_quantity: "0",
    fear_quantity: "0",
    suffering_quantity: "0",
    isolation_quantity: "0",
};

emotionImageNames = {
    "Distilled Ire" : "1_distilled_ire",
    "Distilled Guilt" : "2_distilled_guilt",
    "Distilled Greed" : "3_distilled_greed",
    "Distilled Paranoia" : "4_distilled_paranoia",
    "Distilled Envy" : "5_distilled_envy",
    "Distilled Disgust" : "6_distilled_disgust",
    "Distilled Despair" : "7_distilled_despair",
    "Distilled Fear" : "8_distilled_fear",
    "Distilled Suffering" : "9_distilled_suffering",
    "Distilled Isolation" : "10_distilled_isolation",
}

setDefaultInstills();
setEventListeners();
updateTable();