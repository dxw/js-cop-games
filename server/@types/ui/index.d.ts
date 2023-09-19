type nameFormElementElements = HTMLFormControlsCollection & {
  name: HTMLInputElement;
};

type nameFormElement = HTMLFormElement & {
  elements: nameFormElementElements;
};

export type { nameFormElement };
