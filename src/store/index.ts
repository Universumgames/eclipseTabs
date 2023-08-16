import { TabStructData, createEmptyData } from "@/scripts/tabStructData"
import { InjectionKey } from 'vue'
import { Store, createStore, useStore } from 'vuex'

export interface State {
  eclipseData: TabStructData
}

export const key: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
  state: {
    eclipseData: createEmptyData()
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})


export function eclipseStore() {
  return useStore(key)
}