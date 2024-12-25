import requests
from bs4 import BeautifulSoup 
import json

def WriteToFile(fileContent):
    file = open("passives.json", "w", encoding="utf-8")
    file.write(fileContent)
    file.close()

def GetDistilledValue(emotions):
    emotionValues = {
        "Distilled Ire": 1,
        "Distilled Guilt" : 3,
        "Distilled Greed" : 9,
        "Distilled Paranoia": 27,
        "Distilled Envy" : 81,
        "Distilled Disgust" : 243,
        "Distilled Despair" : 729,
        "Distilled Fear": 2187,
        "Distilled Suffering" :6561,
        "Distilled Isolation" : 19683,
    }
    return sum(emotionValues[x] for x in emotions)

def ParsePage(url):
    page = requests.get(url)

    soup = BeautifulSoup(page.content, "html.parser")

    passives = []
    for row in soup.select("tr"):
        distilled_entries = []
        for a_tag in row.select("a.item_currency"):
            if "Distilled" in a_tag.text:
                distilled_entries.append(a_tag.text.strip())
        cost = GetDistilledValue(distilled_entries)
        
        implicit_mods = []
        for td in row.select("td"):
            associated_name = td.select_one("a[data-hover]")
            implicit_mod_divs = td.select("div.implicitMod")
            if associated_name and implicit_mod_divs:
                associated_name_text = associated_name.text.strip()
                implicit_mod_texts = ", ".join([mod.get_text(" ", strip=True) for mod in implicit_mod_divs])
                implicit_mods.append({
                    "name": associated_name_text,
                    "mod": implicit_mod_texts
                })
        if distilled_entries or implicit_mods:
            passives.append({
                "distilled_entries": distilled_entries,
                "cost": cost,
                "implicit_mods": implicit_mods
            })
    return json.dumps(passives, indent=4)

url = "https://poe2db.tw/us/Distilled_Emotions#DistilledEmotionsPassives"
pageInfo = ParsePage(url)
WriteToFile(pageInfo)
