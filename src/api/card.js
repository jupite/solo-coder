import request from '@/utils/request'

export function getCardList(params) {
  return request({
    url: '/api/get-card-list',
    method: 'get',
    params
  })
}

export function getCardListByPage(data) {
  return request({
    url: '/api/get-card-list',
    method: 'post',
    data
  })
}
