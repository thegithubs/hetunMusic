const baseUrl = 'https://music.163.com/api';

const request = (url, data, params) => {
  const { method, full } = params;
  return new Promise((r, j) => {
    wx.request({
      url: full ? url : `${baseUrl}${url}`,
      data,
      method,
      success: res => {
        const { statusCode, data, errMsg } = res;
        statusCode === 200 ?  r(data) : j(errMsg);
      },
      fail: err => {
        j(err);
      }
    });
  }).catch(() =>{});
};

const get = (url, params) => {
  return request(url, undefined, {
    method: 'GET',
    ...params,
  });
};

const post = (url, data, params) => {
  return request(url, data, {
    method: 'POST',
    ...params,
  });
};

module.exports = {
  request,
  get,
  post,
}