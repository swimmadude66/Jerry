export function secondsToDuration(seconds: number): string {
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  const breakoutVals = [days, hours % 24, minutes % 60, seconds % 60] 
  const units = ['day', 'hour', 'minute', 'second']
  const displayVals = breakoutVals.flatMap((v, i) => {
    const wholeValue = Math.floor(v)
    return wholeValue > 0 ? [`${wholeValue} ${units[i]}${wholeValue > 1 ? 's' : ''}`] : []
  })
  const formatted = displayVals.join(', ')
  return formatted
}