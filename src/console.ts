const last = /[A-Z][^A-Z]+$/
const suffix2abrev: { [index: string]: string } = {
  Service: 'Serv',
}
export const c = (instance: any): string => {
  const className: string = instance.constructor.name ?? ''
  const match = last.exec(className)
  let shortName: string = className
  if (match !== null) {
    shortName = className.replace(match[0], suffix2abrev[match[0]])
  }
  return `${shortName}.ts`.padStart(19)
}
