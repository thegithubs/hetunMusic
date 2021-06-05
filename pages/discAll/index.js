// pages/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    loading: true,
    page: 0,
    newList: []
  },
  onLoad(options){
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.onAlbum() //新碟上架
  },
  onAlbum() {
    //新碟上架
    wx.request({
      url: url + `/netease/album/newest`,
      success: res => {
        this.setData({
          newList: res.data.data,
          loading: false
        })
      }
    })
  },
  go2disc(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../disc/index?id=${id}`,
    })
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})