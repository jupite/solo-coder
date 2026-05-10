import Mock from 'mockjs'

const cardList = Mock.mock({
  code: 200,
  message: 'success',
  'data|10-20': [
    {
      'id|+1': 1,
      title: '@ctitle(5, 20)',
      description: '@cparagraph(1, 3)',
      'status|1': ['active', 'inactive', 'pending'],
      'views|100-5000': 0,
      createTime: '@datetime()',
      updateTime: '@datetime()'
    }
  ]
})

Mock.mock('/api/get-card-list', 'get', () => {
  return cardList
})

Mock.mock('/api/get-card-list', 'post', (options) => {
  const body = JSON.parse(options.body)
  const { page = 1, pageSize = 10 } = body
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = cardList.data.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total: cardList.data.length,
      page,
      pageSize
    }
  }
})
