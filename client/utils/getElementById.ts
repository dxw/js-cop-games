export const getElementById = (id: HTMLElement['id']): HTMLElement => {
  const element = document.getElementById(id)

  if (element == null) {
    throw new Error(`No element found with ID: ${id}`)
  }

  return element
}
