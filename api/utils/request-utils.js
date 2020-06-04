import {
  PAGINATION_MAX_LIMIT,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_OFFSET,
  SORT_DIRECTION
} from '../../config/constants'

export function getLimit(options) {
  let limit = parseInt(options.limit, 10) || PAGINATION_DEFAULT_LIMIT
  limit = limit > PAGINATION_MAX_LIMIT ? PAGINATION_MAX_LIMIT : limit
  return limit
}

export function getOffset(options) {
  let offset = PAGINATION_DEFAULT_OFFSET
  if (options.offset) offset = parseInt(options.offset, 10)
  return offset
}

export function getSortBy(options, defaultArg) {
  // required query param sort with +/-field
  let sort = options.sort || defaultArg || '+id'

  if (sort === '') {
    return {}
  }

  let orderBy = {}
  if (sort.startsWith('-')) {
    orderBy[sort.substring(1)] = SORT_DIRECTION.DESC
  } else if (sort.startsWith(' ') || sort.startsWith('+')) {
    orderBy[sort.substring(1)] = SORT_DIRECTION.ASC
  } else {
    orderBy[sort] = SORT_DIRECTION.DESC
  }

  return orderBy
}

export function getSearchObj(options) {
  // required query param search with field:value,field:value,...
  let searchStr = options.search || ''
  if (searchStr === '') {
    return {}
  }
  searchStr = '{"' + searchStr.replace(/:/g, '":"').replace(/,/g, '","') + '"}'
  let searchObj = JSON.parse(searchStr)
  let where = []
  for (let key in searchObj) {
    let temp = {}
    temp[key] = { contains: searchObj[key] }
    where.push(temp)
  }
  return where
}
