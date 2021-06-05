// pages/search/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    value: '',
    oldValue: '',
    ajax: false,
    showHistory: true,
    loading0: false,
    loading1: false,
    loading2: false,
    loading3: false,
    type: ['song', 'songList', 'singer', 'album'],
    fn: [[], [], [], []],
    all: ['songs', 'playlists', 'artists', 'albums'],
    page: [0, 0, 0, 0],
    top: 0,
    current: 0
  },
  onLoad() {
    this.setData({
      playerData: wx.getStorageSync('playerData'),
      searchKey: wx.getStorageSync('searchKey') || []
    })
  },
  input(e){
    this.setData({
      value: e.detail.value
    })
  },
  clearAll(){
    //清除搜索记录
    wx.removeStorageSync('searchKey')
    this.setData({
      searchKey: []
    })
  },
  rSearch(e){
    //点击搜索记录搜索
    const value = e.currentTarget.dataset.value
    this.setData({
      value: value
    })
    this.search()
  },
  search(e){
    if (!this.data.value) return
    if (e && e.currentTarget.dataset.ev == 'hand'){
      //重新搜索清除
      this.setData({
        fn: [[], [], [], []],
        page: [0, 0, 0, 0],
        top: 0
      })
    }
    this.setData({
      showHistory: false,
      ajax: true
    })
    const d = this.data, idx = d.current, type = d.type[idx], page = d.page[idx],
      each = d.all[idx], load = 'loading' + idx
    this.setData({
      [load]: true
    })
    //保存记录
    let searchKey = wx.getStorageSync('searchKey') || []
    if (!searchKey.some(i => i == d.value)){
      searchKey.unshift(d.value)
      let len = searchKey.length
      if (len > 20) searchKey.splice(len - 1, 1)
      wx.setStorageSync('searchKey', searchKey)
    }
    if (d.oldValue != d.value) {
      this.setData({
        ['fn[' + idx + ']']: []
      })
    }
    wx.request({
      url: url + `/netease/search?keyword=${m.encode(d.value)}&type=${type}&pageSize=20&page=${page}`,
      success: res => {
        const out = res.data.data[each]
        this.setData({
          oldValue: this.data.value
        })
        if (out && out.length > 0 ){
          this.setData({
            ['fn[' + idx + ']']: this.data.fn[idx].concat(out)
          })
        }
      },
      complete: res => {
        this.setData({
          [load]: false,
          ajax: false
        })
      }
    })
  },
  tab(e){
    const idx = e.currentTarget.dataset.idx
    if (idx == this.data.current) return
    this.setData({
      current: idx
    })
    if (!this.data.value) return
    if (this.data.oldValue != this.data.value || this.data.fn[idx].length == 0) this.search()
  },
  change(e){
    const idx = e.detail.current
    this.setData({
      current: idx
    })
    if (this.data.fn[idx].length == 0 && e.detail.source == 'touch') this.search()
  },
  player(e){
    m.player(e.currentTarget.dataset.id, this)
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  },
  go2songlist(e){
    //跳转歌单
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../songList/index?id=${id}`
    })
  },
  go2artist(e) {
    //跳转歌手
    const d = e.currentTarget.dataset
    wx.navigateTo({
      url: `../artist/index?id=${d.id}&name=${d.name}`
    })
  },
  go2album(e) {
    //跳转专辑
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../disc/index?id=${id}`
    })
  },
  onBottom(){
    if (this.data.ajax) return
    let idx = this.data.current, p = this.data.page[idx]
    this.setData({
      ['page[' + idx + ']']: p += 1
    })
    this.search()
  }
})