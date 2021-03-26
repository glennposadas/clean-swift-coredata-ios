// RESPONSES FILE
// ============================================================
exports.paging = (sequelizeResult, page, limit) => {
  const resultCount = sequelizeResult.count
  const isArray = Array.isArray(resultCount)
  const total = isArray == true ? resultCount.length : resultCount
  const obj = {
    page,
    limit,
    total: total,
    data: sequelizeResult.rows
  }

  return obj
}
