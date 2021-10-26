<template>
  <el-dialog
    :title="title"
    width="62%"
    top="10vh"
    :visible.sync="visible"
    :close-on-click-modal="false"
    @close="toggle(false)"
    custom-class="poi-map-dialog"
  >
    <div class="poi-map-wrapper">
      <div id="poiMapContainer"></div>
      <div id="pickerBox">
        <input
          id="pickerInput"
          placeholder="输入关键字选取地点"
          :value="address"
        />
        <div id="poiInfo"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
// import AMapLoader from '../../utils/AMap'

export default {
  name: 'PoiSelect',
  model: {
    prop: 'value',
    event: 'toggle'
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    /**
     * 弹窗标题
     */
    title: {
      type: String,
      default: '地理位置选择'
    },
    /**
     * 限制地图和搜索得行政区
     */
    city: {
      type: String,
      default: '贵阳'
    },
    /**
     * 关键字。多个用 | 分隔
     */
    suggest: {
      type: String,
      default: '学校|培训机构'
    },
    /**
     * 默认地址。
     */
    address: {
      type: String,
      default: ''
    },
    /**
     * 默认经纬度。设置地图中心
     */
    position: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      map: null
    }
  },
  // async created() {
  //   await AMapLoader()
  // },
  methods: {
    toggle(flag) {
      this.$emit('toggle', flag)
    },
    initMap() {
      this.map = new AMap.Map('poiMapContainer', {
        zoom: 15,
        // city: this.city,
        resizeEnable: true
      })

      if (this.position && this.position.length > 0) {
        this.map.setCenter(new AMap.LngLat(this.position[0], this.position[1]))
      }

      // 创建标记点
      this.marker = new AMap.Marker({
        map: this.map,
        visible: false
      })

      // 创建信息窗体
      this.infoWindow = new AMap.InfoWindow({
        map: this.map,
        offset: new AMap.Pixel(0, -35),
        visible: false
      })

      const _self = this
      // 创建信息窗体
      AMap.plugin(['AMap.Geocoder'], function() {
        _self.geocoder = new AMap.Geocoder({
          // city: _self.city,
          radius: 1000 // 范围
        })
      })
      // 点击获取经纬度
      this.map.on('click', function(e) {
        _self.marker.setPosition(e.lnglat)
        _self.marker.show()
        // 获取逆地址编码
        _self.geocoder.getAddress(e.lnglat, function(status, result) {
          if (status === 'complete' && result.regeocode) {
            const lng = e.lnglat.getLng()
            const lat = e.lnglat.getLat()
            // 显示窗体
            // _self.infoWindow.setPosition(e.lnglat)
            const elment = _self.createInfoWindow(result.regeocode.formattedAddress, lng, lat)
            _self.infoWindow.setContent(elment)
            _self.infoWindow.open(_self.map, e.lnglat)
          } else {
            _self.$message({
              type: 'error',
              message: '获取逆地址编码失败！'
            })
          }
        })
      })

      this.map.on('complete', () => {
        this.setMapInfo()
      })

      this.initPOIPicker()
    },
    /**
     * 初始化POIPicker插件
     */
    initPOIPicker() {
      const _self = this
      // POI搜索
      AMapUI.loadUI(['misc/PoiPicker'], function(PoiPicker) {
        _self.poiPicker = new PoiPicker({
          city: _self.city,
          input: 'pickerInput'
        })

        // 选取了某个POI
        _self.poiPicker.on('poiPicked', function(poiResult) {
          const poi = poiResult.item
          _self.marker.setPosition(poi.location)
          _self.marker.show()
          // 获取逆地址编码
          _self.geocoder.getAddress(poi.location, function(status, result) {
            if (status === 'complete' && result.regeocode) {
              const lng = poi.location.getLng()
              const lat = poi.location.getLat()
              // 显示窗体
              // _self.infoWindow.setPosition(poi.location)
              const elment = _self.createInfoWindow(result.regeocode.formattedAddress, lng, lat)
              _self.infoWindow.setContent(elment)
              _self.infoWindow.open(_self.map, poi.location)
            } else {
              _self.$message({
                type: 'error',
                message: '获取逆地址编码失败！'
              })
            }
          })
          // _self.$emit('select', {
          //   name: poi.name,
          //   address: poi.address,
          //   longitude: poi.location.getLng(),
          //   latitude: poi.location.getLat()
          // })
          // _self.toggle(false)
        })

        _self.poiPicker.onCityReady(function() {
          _self.poiPicker.suggest(_self.suggest)
        })
      })
    },
    /**
     * 创建信息窗体内容
     */
    createInfoWindow(address, lng, lat) {
      const wrapperEl = document.createElement('div')
      wrapperEl.className = 'poi-info-wrapper'

      const titleEl = document.createElement('p')
      titleEl.className = 'poi-info-title'
      titleEl.innerText = '地理位置'

      const addressEl = document.createElement('p')
      addressEl.className = 'poi-info-content'
      const addrLabel = document.createElement('label')
      addrLabel.innerText = '位置:'
      addressEl.innerText = address
      addressEl.prepend(addrLabel)

      const positionEl = document.createElement('p')
      positionEl.className = 'poi-info-content'
      const posiLabel = document.createElement('label')
      posiLabel.innerText = '经纬度:'
      positionEl.innerText = lng + ', ' + lat
      positionEl.prepend(posiLabel)

      const btnEl = document.createElement('button')
      btnEl.className = 'el-button el-button--primary el-button--small is-plain'
      btnEl.style.width = '120px'

      btnEl.innerText = '确定'
      btnEl.onclick = () => {
        this.$emit('select', {
          address: address,
          longitude: lng,
          latitude: lat
        })
        this.toggle(false)
      }

      wrapperEl.appendChild(titleEl)
      wrapperEl.appendChild(addressEl)
      wrapperEl.appendChild(positionEl)
      wrapperEl.appendChild(btnEl)

      return wrapperEl
    },
    setMapInfo() {
      if (this.map == null) return
      if (this.position && this.position.length > 0) {
        const lnglat = new AMap.LngLat(this.position[0], this.position[1])
        this.map.setCenter(lnglat)
        // 显示标记点
        this.marker.setPosition(lnglat)
        this.marker.show()
        // 显示窗体
        const elment = this.createInfoWindow(this.address, this.position[0], this.position[1])
        this.infoWindow.setContent(elment)
        this.infoWindow.open(this.map, lnglat)
        // 设置搜索关键字
        this.poiPicker.suggest(this.city && this.city !== '' ? this.city + '|' + this.suggest : this.suggest)
        // 根据关键字搜索
        if (this.address && this.address !== '') {
          this.infoWindow.close()
          this.poiPicker.searchByKeyword(this.address)
        }
      } else if (this.city && this.city !== '') {
        this.map.setCity(this.city)
      }
    }
  },
  watch: {
    value(val) {
      this.visible = val
      if (val) {
        if (this.map == null) {
          this.$nextTick(() => {
            this.initMap()
          })
        } else {
          this.setMapInfo()
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.poi-map-dialog {
  .el-dialog__body {
    padding: 12px 20px 20px 20px;
  }
}

.poi-map-wrapper {
  position: relative;
}

.poi-info-wrapper {
  text-align: center;

  .poi-info-title {
    height: 32px;
    line-height: 32px;
    color: $color-text-2;
    font-size: $font-size-normal;
    border-bottom: 1px solid $color-border-2;
    margin-bottom: 12px;
    text-align: left;
  }

  .poi-info-content {
    line-height: 1.4;
    font-size: $font-size-small;
    color: $color-text-1;
    display: flex;
    margin-bottom: 10px;
    text-align: left;

    label {
      color: $color-text-3;
      width: 48px;
      text-align: right;
      margin-right: 8px;
      flex-shrink: 0;
    }
  }

  .el-button {
    margin-top: 12px;
  }
}

#poiMapContainer {
  width: 100%;
  height: 70vh;
  margin: 0px;
  font-size: 13px;
}

#pickerBox {
  position: absolute;
  z-index: 9999;
  top: 20px;
  right: 20px;
  width: 300px;
}

#pickerInput {
  width: 200px;
  padding: 5px 5px;
}

#poiInfo {
  background: #fff;
}
</style>