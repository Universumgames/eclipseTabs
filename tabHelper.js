import * as dataHandler from './dataHandler.js'

export async function hideTab(id) {
  if (id != undefined) {
    if ((await getCurrentTab()).id == id) return false
    console.log(`hide ${id}`)
    //await chrome.tabs.hide(id)
    return true
  }
  return false
}

export async function showTab(id) {
  if (id != undefined) {
    console.log(`show ${id}`)
    //await chrome.tabs.show(id)
    return true
  }
  return false
}

export function focusTab(id) {
  chrome.tabs.update(id, { active: true })
}

export function createTab(url) {
  return chrome.tabs.create({
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

export async function getTabs(callback) {
  chrome.tabs.query({}, callback)
}

export async function getCurrentTab(callback) {
  chrome.tabs.query({ active: true }, callback)
}

export async function closeTab(id){
  return chrome.tabs.remove(id)
}