
export function hasNextPage(options) {
  // accepts options with keys limit, offset, count
  if ((options.offset + options.limit) >= options.count) {
    return false
  }
  return true
}