const baseUrl = '';

const request = (url, data, method = 'GET') => {
  return new Promise((r, j) => {
    wx.request({
      url: `${baseUrl}${url}`,
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

const get = (url, data = undefined) => {
  return request(url, data);
};

const post = (url, data) => {
  return request(url, data, 'POST');
};

module.exports = {
  request,
  get,
  post,
}