const paginationPageOffset = ({
  page,
  limit
}) => {

  page = (page||0)  
  limit = (limit||0)      

  return {
    start : (limit*page) - (limit-1),
    end : limit * page
  }  

}

const paginationRes = ({
  page,
  count,
  limit
}) => {

  page = (page||0)
  count = (count||0)
  limit = (limit||0)

  let lastPage = count / limit
  if (count%limit > 0) {
    lastPage += 1
  }

  return {
    pagination: {
      currentPage:  parseInt(page),
      lastPage: parseInt(lastPage),
      count: parseInt(count),
      recordPerPage: parseInt(limit),
    }
  }  

}

module.exports = {
  paginationPageOffset,
  paginationRes
}