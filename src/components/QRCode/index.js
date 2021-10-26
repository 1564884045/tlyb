import QRCode from 'qrcode'

export default {
  name: 'qrcode',

  props: {
    /**
     * The value of the QR code.
     */
    value: null,

    /**
     * The options for the QR code generator.
     * {@link https://github.com/soldair/node-qrcode#qr-code-options}
     */
    options: Object,

    /**
     * The tag name of the component's root element.
     */
    tag: {
      type: String,
      default: 'canvas'
    }
  },

  render(createElement) {
    return createElement(this.tag, this.$slots.default)
  },

  watch: {
    $props: {
      deep: true,
      immediate: true,

      /**
       * Update the QR code when props changed.
       */
      handler() {
        if (this.$el) {
          this.generate()
        }
      }
    }
  },

  methods: {
    /**
     * Generate QR code.
     */
    generate() {
      const { options, tag } = this
      const value = String(this.value)

      if (tag === 'canvas') {
        QRCode.toCanvas(this.$el, value, options, (error) => {
          if (error) {
            throw error
          }
        })
      } else if (tag === 'img') {
        QRCode.toDataURL(value, options, (error, url) => {
          if (error) {
            throw error
          }

          this.$el.src = url
        })
      } else {
        QRCode.toString(value, options, (error, string) => {
          if (error) {
            throw error
          }

          this.$el.innerHTML = string
        })
      }
    },
    toDataURL(callback, options) {
      const tempOpt = Object.assign({}, this.options, options)
      QRCode.toDataURL(String(this.value), tempOpt, (error, url) => {
        if (error) {
          throw error
        }

        callback(url)
      })
    }
  },
  mounted() {
    this.generate()
  }
}