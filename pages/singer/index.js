// pages/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    isEnd: false,
    page: 0,
    artist: [],
    loading: true
  },
  onLoad(opt){
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.onArtist() //全部歌手
  },
  onArtist(){
    //热门歌手
    this.setData({
      loading: true
    })
    wx.request({
      url: url + `/netease/artist/top?page=${this.data.page}`,
      success: res => {
        const _data = res.data.data
        this.setData({
          artist: this.data.artist.concat(_data),
          loading: false,
          isEnd: _data < 30 ? true : false
        })
      }
    })
  },
  go2Artist(e){
    //跳转歌手详情
    let dataset = e.currentTarget.dataset,
      info = {
        id: dataset.id,
        name: dataset.name
      }
    wx.navigateTo({
      url: `../artist/index?${m.str(info)}`,
    })
  },
  onReachBottom(){
    if (this.data.isEnd || this.data.loading) return
    let p = this.data.page
    this.setData({
      page: p += 1
    })
    this.onArtist()
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})