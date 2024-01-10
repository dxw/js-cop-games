type NameFormElementElements = HTMLFormControlsCollection & {
  name: HTMLInputElement
}

type NameFormElement = HTMLFormElement & {
  elements: NameFormElementElements
}

export type { NameFormElement }
