// pages/index.js
const App = getApp(), url = App.globalData.url;

Page({
  data: {
    isEnd: false,
    loading: true,
    tagid: '',
    sub: [
      {
        name: '全部',
        special_tag_id: ''
      }
    ],
    page: 0,
    name: '全部',
    songList: []
  },
  async onLoad(){
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    await this.getMenu()
    await this.onSongList() //歌单广场
  },
  getMenu(){
    wx.request({
      url: `${url}/v3/tag/recommend?showtype=3&apiver=2&plat=0`,
      success: res => {
        const { info } = res.data.data;
        this.setData({
          sub: this.data.sub.concat(info),
        })
      }
    })
  },
  onSongList(){
    //歌单广场
    this.setData({
      loading: true
    })
    wx.request({
      url: `${url}/v3/tag/specialList?plat=0&page=1&tagid=${this.data.tagid}&pagesize=30&ugc=1&id=68&sort=2`,
      success: res => {
        const _data = res.data.data.info;
        this.setData({
          songList: this.data.songList.concat(_data),
          loading: false,
          isEnd: _data < 30 ? true : false
        })
        console.log(9929, res.data.data)
      }
    })
  },
  go2SongList(e){
    //跳转歌单详情
    let d = e.currentTarget.dataset
    wx.navigateTo({
      url: `../songList/index?id=${d.id}&type=${d.type}`
    })
  },
  changeSub(e){
    const tagid = e.currentTarget.dataset.tagid
    this.setData({
      tagid,
      page: 0,
      songList: []
    })
    this.onSongList()
  },
  onReachBottom(){
    //滑到底部
    if (this.data.isEnd || this.data.loading) return
    let p = this.data.page
    this.setData({
      page: p += 1
    })
    this.onSongList()
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})