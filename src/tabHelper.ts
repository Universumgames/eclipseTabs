export async function hideTab(id: string): Promise<Boolean> {
    if (id != undefined) {
      if ((await getCurrentTab()).id == id) return false
      console.log(`hide ${id}`)
      await browser.tabs.hide(+id)
      return true
    }
    return false
  }
  
  export async function showTab(id: string): Promise<Boolean> {
    if (id != undefined) {
      console.log(`show ${id}`)
      await browser.tabs.show(+id)
      return true
    }
    return false
  }
  
  export function focusTab(id: string) {
    browser.tabs.update(+id, { active: true })
  }
  
  export function createTab(url: string) {
    return browser.tabs.create({
      url: `${url}`
    })
  }
  
  export async function tabExists(tabID: string): Promise<Boolean> {
    return (await getTabByTabID(tabID)) != undefined
  }

  export async function getTabByTabID(tabID:string): Promise<any>{
    if(tabID == "-1") return undefined
    var tabs = await getTabs()
    for (var tab of tabs) {
      if (tab.id == tabID) return tab
    }
    return undefined
  }
  
  export async function getTabs() {
    return await browser.tabs.query({})
  }
  
  export async function getCurrentTab() {
    return (await browser.tabs.query({ active: true }))[0]
  }
  
  export async function closeTab(id: string){
    return browser.tabs.remove(+id)
  }