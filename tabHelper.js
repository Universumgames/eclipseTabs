import * as dataHandler from './dataHandler.js'

export async function hideTab(id) {
  if (id != undefined) {
    if ((await getCurrentTab()).id == id) return false
    console.log(`hide ${id}`)
    await browser.tabs.hide(id)
    return true
  }
  return false
}

export async function showTab(id) {
  if (id != undefined) {
    console.log(`show ${id}`)
    await browser.tabs.show(id)
    return true
  }
  return false
}

export function focusTab(id) {
  browser.tabs.update(id, { active: true })
}

export function createTab(url) {
  return browser.tabs.create({
    url: `${url}`
  })
}

export async function tabExists(tabID) {
  if(tabID == -1) return false
  var tabs = await getTabs()
  for (var tab of tabs) {
    if (tab.id == tabID) return true
  }
  return false
}

export async function getTabs() {
  return await browser.tabs.query({})
}

export async function getCurrentTab() {
  return (await browser.tabs.query({ active: true }))[0]
}

export async function closeTab(id){
  return browser.tabs.remove(id)
}