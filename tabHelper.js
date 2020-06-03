export function hideTab(id) {
  if (id != undefined) {
    console.log(`hide ${id}`)
    return browser.tabs.hide(id)
  }
}

export function showTab(id) {
  if (id != undefined) {
    console.log(`show ${id}`)
    return browser.tabs.show(id)
  }
}

export function focusTab(id) {
  browser.tabs.update(id, { active: true })
}