
function hasNextPage({ limit, offset, count }) {
  // accepts options with keys limit, offset, count
  if ((offset + limit) >= count) {
    return false
  }
  return true
}

module.exports = {
  hasNextPage
}
