const last = /[A-Z][^A-Z]+$/
const suffix2abrev: { [index: string]: string } = {
  Service: 'Serv',
  Controller: 'Ctrl',
}
export const c = (instance: any): string => {
  const className: string = instance.constructor.name ?? ''
  const match = last.exec(className)
  let shortName: string = className
  if (match !== null) {
    const suffix = match[0]
    shortName = className.replace(suffix, suffix2abrev[suffix] ?? suffix)
  }
  return `${shortName}.ts`.padStart(19)
}
